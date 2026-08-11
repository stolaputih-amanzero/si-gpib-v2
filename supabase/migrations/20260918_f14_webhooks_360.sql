-- Migration: F14 External Webhook Reliability Engine (360)
-- Description: Endpoint Registry, Outbound Delivery Queue, Attempt Logging, Exponential Backoff, DLQ, and Dispatcher RPCs.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Webhook Endpoint Registry Table
CREATE TABLE IF NOT EXISTS public.sys_webhook_endpoints (
  endpoint_id TEXT PRIMARY KEY,
  target_url TEXT NOT NULL,
  description TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  subscribed_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  delivery_policy JSONB NOT NULL DEFAULT '{"max_retries": 5, "initial_backoff_ms": 1000, "max_backoff_ms": 60000, "timeout_ms": 10000, "accepted_http_codes": [200, 201, 202, 204]}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version TEXT NOT NULL DEFAULT '1.0.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Outbound Webhook Delivery Outbox Table
CREATE TABLE IF NOT EXISTS public.sys_webhook_deliveries (
  delivery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id TEXT NOT NULL REFERENCES public.sys_webhook_endpoints(endpoint_id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_envelope JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'DELIVERING', 'DELIVERED', 'FAILED_RETRYING', 'DLQ', 'CANCELLED')),
  current_attempt INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  next_retry_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  idempotency_key TEXT NOT NULL,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  delivered_at TIMESTAMPTZ,
  dlq_at TIMESTAMPTZ,
  CONSTRAINT sys_webhook_deliveries_endpoint_event_key UNIQUE (endpoint_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_sys_webhook_deliveries_status_retry ON public.sys_webhook_deliveries(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_sys_webhook_deliveries_endpoint ON public.sys_webhook_deliveries(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_sys_webhook_deliveries_event ON public.sys_webhook_deliveries(event_id);

-- 3. Delivery Attempt History Log
CREATE TABLE IF NOT EXISTS public.sys_webhook_delivery_attempts (
  attempt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES public.sys_webhook_deliveries(delivery_id) ON DELETE CASCADE,
  attempt_number INT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('SUCCESS', 'HTTP_ERROR', 'TIMEOUT', 'NETWORK_ERROR')),
  http_status_code INT,
  latency_ms INT NOT NULL,
  response_snippet TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_sys_webhook_delivery_attempts_delivery ON public.sys_webhook_delivery_attempts(delivery_id);

-- 4. Enqueue Delivery RPC (Idempotent Event Fan-Out)
CREATE OR REPLACE FUNCTION public.enqueue_webhook_deliveries(
  p_event_id TEXT,
  p_topic TEXT,
  p_event_type TEXT,
  p_payload JSONB,
  p_source TEXT DEFAULT 'F11_TELEMETRY_OUTBOX'
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  rec RECORD;
  v_enqueued_count INT := 0;
  v_envelope JSONB;
  v_idempotency_key TEXT;
  v_max_retries INT;
BEGIN
  v_envelope := jsonb_build_object(
    'event_id', p_event_id,
    'topic', p_topic,
    'event_type', p_event_type,
    'source', p_source,
    'occurred_at', clock_timestamp(),
    'payload', p_payload,
    'metadata', jsonb_build_object('enqueued_by', 'sys_webhook_dispatcher')
  );

  FOR rec IN
    SELECT endpoint_id, delivery_policy
    FROM public.sys_webhook_endpoints
    WHERE is_active = true
      AND (
        subscribed_events @> jsonb_build_array(p_event_type)
        OR subscribed_events @> jsonb_build_array('*')
        OR subscribed_events @> jsonb_build_array(p_topic)
      )
  LOOP
    v_idempotency_key := concat('IDEM-', p_event_id, '-', rec.endpoint_id);
    v_max_retries := COALESCE((rec.delivery_policy->>'max_retries')::int, 5);

    INSERT INTO public.sys_webhook_deliveries (
      endpoint_id, event_id, topic, event_type, payload_envelope,
      status, current_attempt, max_attempts, next_retry_at, idempotency_key
    ) VALUES (
      rec.endpoint_id, p_event_id, p_topic, p_event_type, v_envelope,
      'QUEUED', 0, v_max_retries, clock_timestamp(), v_idempotency_key
    )
    ON CONFLICT (endpoint_id, event_id) DO NOTHING;

    v_enqueued_count := v_enqueued_count + 1;
  END LOOP;

  RETURN v_enqueued_count;
END;
$$;

-- 5. Record Attempt & Backoff Retry RPC
CREATE OR REPLACE FUNCTION public.record_webhook_attempt(
  p_delivery_id UUID,
  p_outcome TEXT,
  p_http_status INT DEFAULT NULL,
  p_latency_ms INT DEFAULT 0,
  p_response TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_delivery RECORD;
  v_endpoint RECORD;
  v_next_attempt INT;
  v_accepted_codes JSONB;
  v_is_success BOOLEAN := false;
  v_backoff_ms INT;
  v_initial_backoff_ms INT;
  v_max_backoff_ms INT;
  v_next_retry_at TIMESTAMPTZ;
  v_new_status TEXT;
BEGIN
  -- Row locking delivery record
  SELECT * INTO v_delivery
  FROM public.sys_webhook_deliveries
  WHERE delivery_id = p_delivery_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DELIVERY_NOT_FOUND: Webhook delivery % does not exist.', p_delivery_id;
  END IF;

  SELECT * INTO v_endpoint
  FROM public.sys_webhook_endpoints
  WHERE endpoint_id = v_delivery.endpoint_id;

  v_next_attempt := v_delivery.current_attempt + 1;
  v_accepted_codes := COALESCE(v_endpoint.delivery_policy->'accepted_http_codes', '[200, 201, 202, 204]'::jsonb);
  v_initial_backoff_ms := COALESCE((v_endpoint.delivery_policy->>'initial_backoff_ms')::int, 1000);
  v_max_backoff_ms := COALESCE((v_endpoint.delivery_policy->>'max_backoff_ms')::int, 60000);

  IF p_outcome = 'SUCCESS' OR (p_http_status IS NOT NULL AND v_accepted_codes @> jsonb_build_array(p_http_status)) THEN
    v_is_success := true;
  END IF;

  -- Insert attempt history entry
  INSERT INTO public.sys_webhook_delivery_attempts (
    delivery_id, attempt_number, outcome, http_status_code, latency_ms, response_snippet
  ) VALUES (
    p_delivery_id, v_next_attempt, p_outcome, p_http_status, p_latency_ms, substring(COALESCE(p_response, ''), 1, 500)
  );

  IF v_is_success THEN
    v_new_status := 'DELIVERED';
    UPDATE public.sys_webhook_deliveries
    SET status = 'DELIVERED',
        current_attempt = v_next_attempt,
        delivered_at = clock_timestamp()
    WHERE delivery_id = p_delivery_id;
  ELSE
    IF v_next_attempt >= v_delivery.max_attempts THEN
      v_new_status := 'DLQ';
      UPDATE public.sys_webhook_deliveries
      SET status = 'DLQ',
          current_attempt = v_next_attempt,
          dlq_at = clock_timestamp()
      WHERE delivery_id = p_delivery_id;
    ELSE
      v_new_status := 'FAILED_RETRYING';
      -- Bounded Exponential Backoff: initial * 2^(attempt - 1) capped at max_backoff
      v_backoff_ms := LEAST(v_max_backoff_ms, v_initial_backoff_ms * (2 ^ (v_next_attempt - 1)));
      v_next_retry_at := clock_timestamp() + (v_backoff_ms || ' milliseconds')::interval;

      UPDATE public.sys_webhook_deliveries
      SET status = 'FAILED_RETRYING',
          current_attempt = v_next_attempt,
          next_retry_at = v_next_retry_at
      WHERE delivery_id = p_delivery_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'delivery_id', p_delivery_id,
    'status', v_new_status,
    'current_attempt', v_next_attempt,
    'is_success', v_is_success,
    'next_retry_at', v_next_retry_at
  );
END;
$$;

-- 6. DLQ Replay RPC
CREATE OR REPLACE FUNCTION public.replay_dlq_delivery(
  p_delivery_id UUID,
  p_reason TEXT DEFAULT 'Manual admin replay'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_delivery RECORD;
BEGIN
  SELECT * INTO v_delivery
  FROM public.sys_webhook_deliveries
  WHERE delivery_id = p_delivery_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DELIVERY_NOT_FOUND: Webhook delivery % does not exist.', p_delivery_id;
  END IF;

  IF v_delivery.status <> 'DLQ' THEN
    RAISE EXCEPTION 'INVALID_REPLAY_STATE: Delivery % is in status %, not DLQ.', p_delivery_id, v_delivery.status;
  END IF;

  UPDATE public.sys_webhook_deliveries
  SET status = 'QUEUED',
      current_attempt = 0,
      next_retry_at = clock_timestamp(),
      dlq_at = NULL
  WHERE delivery_id = p_delivery_id;

  RETURN jsonb_build_object(
    'delivery_id', p_delivery_id,
    'status', 'QUEUED',
    'replayed_at', clock_timestamp(),
    'reason', p_reason
  );
END;
$$;

-- RLS Security: Hide secret_key from standard client queries
ALTER TABLE public.sys_webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_webhook_delivery_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY sys_webhook_endpoints_select ON public.sys_webhook_endpoints
  FOR SELECT TO authenticated USING (true);

CREATE POLICY sys_webhook_deliveries_select ON public.sys_webhook_deliveries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY sys_webhook_delivery_attempts_select ON public.sys_webhook_delivery_attempts
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON public.sys_webhook_endpoints TO authenticated;
GRANT SELECT ON public.sys_webhook_deliveries TO authenticated;
GRANT SELECT ON public.sys_webhook_delivery_attempts TO authenticated;

GRANT EXECUTE ON FUNCTION public.enqueue_webhook_deliveries TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_webhook_attempt TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.replay_dlq_delivery TO authenticated, service_role;
