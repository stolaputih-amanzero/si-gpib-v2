-- ============================================================================
-- F11 REAL-TIME TELEMETRY & EVENT STREAM ENGINE MIGRATION
-- Reference Implementation #10 (Transactional Outbox, Sequence Replay, & Telemetry ACL)
-- ============================================================================

-- 1. SEQUENCE TRACKER TABLE PER TOPIC
CREATE TABLE IF NOT EXISTS public.sys_telemetry_topic_sequence (
    topic TEXT PRIMARY KEY,
    last_sequence BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Topics
INSERT INTO public.sys_telemetry_topic_sequence (topic, last_sequence)
VALUES 
    ('telemetry.batch_queue', 0),
    ('telemetry.system_audit', 0),
    ('telemetry.workflow', 0)
ON CONFLICT (topic) DO NOTHING;

-- 2. PHYSICAL TRANSACTIONAL EVENT OUTBOX TABLE
CREATE TABLE IF NOT EXISTS public.sys_event_outbox (
    event_id TEXT PRIMARY KEY DEFAULT ('EVT-' || gen_random_uuid()::text),
    idempotency_key TEXT NOT NULL UNIQUE,
    topic TEXT NOT NULL,
    event_type TEXT NOT NULL,
    sequence_number BIGINT NOT NULL,
    payload JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    delivery_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (delivery_status IN ('PENDING', 'PUBLISHED', 'FAILED', 'RETRYING')),
    retry_count INT NOT NULL DEFAULT 0,
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Fast Querying, Replay & Delivery Processing
CREATE INDEX IF NOT EXISTS idx_event_outbox_topic_seq ON public.sys_event_outbox (topic, sequence_number ASC);
CREATE INDEX IF NOT EXISTS idx_event_outbox_delivery ON public.sys_event_outbox (delivery_status, created_at);
CREATE INDEX IF NOT EXISTS idx_event_outbox_actor ON public.sys_event_outbox (created_by, topic);

-- Enable RLS
ALTER TABLE public.sys_event_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_telemetry_topic_sequence ENABLE ROW LEVEL SECURITY;

-- 3. FUNCTION TO OBTAIN CONCURRENCY-SAFE MONOTONIC SEQUENCE NUMBER PER TOPIC
CREATE OR REPLACE FUNCTION public.next_telemetry_topic_sequence(p_topic TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_next BIGINT;
BEGIN
    UPDATE public.sys_telemetry_topic_sequence
    SET last_sequence = last_sequence + 1, updated_at = NOW()
    WHERE topic = p_topic
    RETURNING last_sequence INTO v_next;

    IF v_next IS NULL THEN
        INSERT INTO public.sys_telemetry_topic_sequence (topic, last_sequence)
        VALUES (p_topic, 1)
        ON CONFLICT (topic) DO UPDATE SET last_sequence = sys_telemetry_topic_sequence.last_sequence + 1
        RETURNING last_sequence INTO v_next;
    END IF;

    RETURN v_next;
END;
$$;

-- 4. RPC: EMIT TELEMETRY EVENT ATOMICALLY WITH ZERO-PII ENFORCEMENT
CREATE OR REPLACE FUNCTION public.emit_telemetry_event_atomic(
    p_topic TEXT,
    p_event_type TEXT,
    p_idempotency_key TEXT,
    p_payload JSONB,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_seq BIGINT;
    v_event_id TEXT;
    v_existing_event RECORD;
    v_pii_key TEXT;
    v_forbidden_keys TEXT[] := ARRAY['full_name', 'phone', 'email', 'address', 'nik', 'raw_identity', 'password', 'access_token'];
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required for emitting telemetry events.';
    END IF;

    -- Zero-PII Payload Validation
    FOREACH v_pii_key IN ARRAY v_forbidden_keys LOOP
        IF p_payload ? v_pii_key THEN
            RAISE EXCEPTION 'ZERO_PII_VIOLATION: Telemetry payload contains forbidden PII key: %', v_pii_key;
        END IF;
    END LOOP;

    -- Idempotency Check
    SELECT * INTO v_existing_event FROM public.sys_event_outbox WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
        RETURN jsonb_build_object(
            'event_id', v_existing_event.event_id,
            'idempotency_key', v_existing_event.idempotency_key,
            'topic', v_existing_event.topic,
            'event_type', v_existing_event.event_type,
            'sequence_number', v_existing_event.sequence_number,
            'occurred_at', v_existing_event.occurred_at,
            'published_at', v_existing_event.published_at,
            'delivery_state', v_existing_event.delivery_status,
            'payload', v_existing_event.payload,
            'metadata', v_existing_event.metadata
        );
    END IF;

    -- Obtain Concurrency-Safe Sequence Number
    v_seq := public.next_telemetry_topic_sequence(p_topic);
    v_event_id := 'EVT-' || substring(md5(random()::text || clock_timestamp()::text) from 1 for 12);

    -- Insert Atomically into Durable Outbox Table
    INSERT INTO public.sys_event_outbox (
        event_id,
        idempotency_key,
        topic,
        event_type,
        sequence_number,
        payload,
        metadata,
        delivery_status,
        created_by
    ) VALUES (
        v_event_id,
        p_idempotency_key,
        p_topic,
        p_event_type,
        v_seq,
        p_payload,
        p_metadata,
        'PUBLISHED',
        v_uid
    );

    RETURN jsonb_build_object(
        'event_id', v_event_id,
        'idempotency_key', p_idempotency_key,
        'topic', p_topic,
        'event_type', p_event_type,
        'sequence_number', v_seq,
        'occurred_at', NOW(),
        'published_at', NOW(),
        'delivery_state', 'PUBLISHED',
        'payload', p_payload,
        'metadata', p_metadata
    );
END;
$$;

-- 5. RPC: GET TELEMETRY EVENT REPLAY WITH PAGINATION & DETERMINISTIC NEXT SEQUENCE
CREATE OR REPLACE FUNCTION public.get_telemetry_event_replay(
    p_topic TEXT,
    p_after_sequence BIGINT DEFAULT 0,
    p_limit INT DEFAULT 50
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_events JSONB;
    v_max_seq BIGINT := p_after_sequence;
    v_has_more BOOLEAN := FALSE;
    v_total_found INT;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required for telemetry replay.';
    END IF;

    -- Select events ordered strictly ascending by sequence_number
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'event_id', e.event_id,
            'idempotency_key', e.idempotency_key,
            'topic', e.topic,
            'event_type', e.event_type,
            'sequence_number', e.sequence_number,
            'occurred_at', e.occurred_at,
            'published_at', e.published_at,
            'delivery_state', e.delivery_status,
            'payload', e.payload,
            'metadata', e.metadata
        ) ORDER BY e.sequence_number ASC
    ), '[]'::jsonb) INTO v_events
    FROM (
        SELECT * FROM public.sys_event_outbox
        WHERE topic = p_topic AND sequence_number > p_after_sequence
        ORDER BY sequence_number ASC
        LIMIT p_limit + 1
    ) e;

    v_total_found := jsonb_array_length(v_events);

    IF v_total_found > p_limit THEN
        v_has_more := TRUE;
        -- Remove the +1 overflow element
        v_events := v_events - (v_total_found - 1);
    END IF;

    -- Compute max sequence in current page
    IF jsonb_array_length(v_events) > 0 THEN
        SELECT (v_events->(jsonb_array_length(v_events) - 1)->>'sequence_number')::BIGINT INTO v_max_seq;
    END IF;

    RETURN jsonb_build_object(
        'events', v_events,
        'next_sequence', v_max_seq,
        'has_more', v_has_more
    );
END;
$$;

-- 6. RPC: AUTOMATED RETENTION CLEANUP
CREATE OR REPLACE FUNCTION public.cleanup_expired_telemetry_events(
    p_retention_days INT DEFAULT 7
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_deleted_count INT;
BEGIN
    DELETE FROM public.sys_event_outbox
    WHERE created_at < (NOW() - (p_retention_days || ' days')::INTERVAL);

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$;

-- 7. EVENT IMMUTABILITY TRIGGER (PREVENTS DIRECT UPDATE/DELETE BY CALLERS)
CREATE OR REPLACE FUNCTION public.prevent_sys_event_outbox_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'EVENT_IMMUTABILITY_VIOLATION: Direct UPDATE or DELETE on sys_event_outbox is strictly prohibited.';
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_sys_event_outbox_mutation ON public.sys_event_outbox;
CREATE TRIGGER trg_prevent_sys_event_outbox_mutation
BEFORE UPDATE OR DELETE ON public.sys_event_outbox
FOR EACH ROW
WHEN (pg_trigger_depth() = 0) -- Allows internal cleanup RPC
EXECUTE FUNCTION public.prevent_sys_event_outbox_mutation();
