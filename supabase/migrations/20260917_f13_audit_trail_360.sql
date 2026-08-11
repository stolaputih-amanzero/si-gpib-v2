-- Migration: F13 Immutable Audit Trail & Compliance Reconstruction Engine (360)
-- Description: Immutable Evidence Store, Cryptographic Hash-Chaining (prev_hash -> curr_hash), Append-Only Physical Triggers, and Verification RPCs.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Stream Lock Registry for Concurrent Chain Protection
CREATE TABLE IF NOT EXISTS public.sys_audit_stream_locks (
  topic TEXT PRIMARY KEY,
  last_sequence BIGINT NOT NULL DEFAULT 0,
  last_hash TEXT NOT NULL DEFAULT '0000000000000000000000000000000000000000000000000000000000000000',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Physical Immutable Audit Evidence Store
CREATE TABLE IF NOT EXISTS public.sys_audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  sequence_number BIGINT NOT NULL,
  prev_hash TEXT NOT NULL,
  curr_hash TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('HUMAN', 'SERVICE', 'SYSTEM', 'CRON')),
  org_context_id TEXT NOT NULL,
  session_id TEXT,
  policy_id TEXT,
  policy_version TEXT NOT NULL DEFAULT '1.0.0',
  decision TEXT NOT NULL CHECK (decision IN ('ALLOW', 'DENY')),
  reason_code TEXT NOT NULL,
  granted_scope TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  state_before JSONB,
  state_after JSONB,
  changed_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  request_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT sys_audit_logs_topic_seq_key UNIQUE (topic, sequence_number)
);

CREATE INDEX IF NOT EXISTS idx_sys_audit_logs_topic_seq ON public.sys_audit_logs(topic, sequence_number);
CREATE INDEX IF NOT EXISTS idx_sys_audit_logs_entity ON public.sys_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sys_audit_logs_org_context ON public.sys_audit_logs(org_context_id);

-- 3. Physical Immutability Enforcement Trigger Function
CREATE OR REPLACE FUNCTION public.enforce_audit_logs_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'IMMUTABLE_LOG_VIOLATION: UPDATE and DELETE operations on committed sys_audit_logs entries are strictly prohibited by security contract.';
END;
$$;

DROP TRIGGER IF EXISTS sys_audit_logs_immutability_tg ON public.sys_audit_logs;
CREATE TRIGGER sys_audit_logs_immutability_tg
  BEFORE UPDATE OR DELETE ON public.sys_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_audit_logs_immutability();

-- 4. Evidentiary Append RPC (Atomic & Concurrency-Safe)
CREATE OR REPLACE FUNCTION public.append_audit_evidence(
  p_topic TEXT,
  p_actor_type TEXT,
  p_org_context_id TEXT,
  p_policy_id TEXT,
  p_policy_version TEXT,
  p_decision TEXT,
  p_reason_code TEXT,
  p_granted_scope TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_action TEXT,
  p_state_before JSONB DEFAULT NULL,
  p_state_after JSONB DEFAULT NULL,
  p_changed_fields JSONB DEFAULT '[]'::jsonb,
  p_request_id TEXT DEFAULT 'REQ-GENERIC',
  p_transaction_id TEXT DEFAULT 'TX-GENERIC',
  p_correlation_id TEXT DEFAULT 'CORR-GENERIC'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_actor_id TEXT;
  v_lock_seq BIGINT;
  v_lock_hash TEXT;
  v_next_seq BIGINT;
  v_occurred_at TIMESTAMPTZ;
  v_canonical_string TEXT;
  v_curr_hash TEXT;
  v_log_id UUID;
BEGIN
  -- Reconstruct actor_id from authenticated context for HUMAN actor
  IF p_actor_type = 'HUMAN' THEN
    v_actor_id := auth.uid()::text;
    IF v_actor_id IS NULL THEN
      RAISE EXCEPTION 'DENIED_UNAUTHENTICATED: Unauthenticated human actor cannot generate audit evidence.';
    END IF;
  ELSE
    v_actor_id := COALESCE(auth.uid()::text, 'SYSTEM_SERVICE');
  END IF;

  v_occurred_at := clock_timestamp();
  v_log_id := gen_random_uuid();

  -- Lock stream row to prevent concurrent chain forks
  INSERT INTO public.sys_audit_stream_locks (topic, last_sequence, last_hash, updated_at)
  VALUES (p_topic, 0, '0000000000000000000000000000000000000000000000000000000000000000', v_occurred_at)
  ON CONFLICT (topic) DO NOTHING;

  SELECT last_sequence, last_hash
  INTO v_lock_seq, v_lock_hash
  FROM public.sys_audit_stream_locks
  WHERE topic = p_topic
  FOR UPDATE;

  v_next_seq := v_lock_seq + 1;

  -- Canonical JSON payload string for deterministic SHA-256 hash chaining
  v_canonical_string := concat_ws('|',
    v_log_id::text,
    p_topic,
    v_next_seq::text,
    v_lock_hash,
    v_occurred_at::text,
    v_actor_id,
    p_actor_type,
    p_org_context_id,
    COALESCE(p_policy_id, ''),
    p_policy_version,
    p_decision,
    p_reason_code,
    COALESCE(p_granted_scope, ''),
    p_entity_type,
    p_entity_id,
    p_action,
    COALESCE(p_state_before::text, ''),
    COALESCE(p_state_after::text, ''),
    p_changed_fields::text,
    p_request_id,
    p_transaction_id,
    p_correlation_id
  );

  v_curr_hash := encode(digest(v_canonical_string, 'sha256'), 'hex');

  -- Insert atomic audit log entry
  INSERT INTO public.sys_audit_logs (
    log_id, topic, sequence_number, prev_hash, curr_hash,
    actor_id, actor_type, org_context_id, session_id,
    policy_id, policy_version, decision, reason_code, granted_scope,
    entity_type, entity_id, action, state_before, state_after, changed_fields,
    request_id, transaction_id, correlation_id, occurred_at
  ) VALUES (
    v_log_id, p_topic, v_next_seq, v_lock_hash, v_curr_hash,
    v_actor_id, p_actor_type, p_org_context_id, NULL,
    p_policy_id, p_policy_version, p_decision, p_reason_code, p_granted_scope,
    p_entity_type, p_entity_id, p_action, p_state_before, p_state_after, p_changed_fields,
    p_request_id, p_transaction_id, p_correlation_id, v_occurred_at
  );

  -- Update stream lock state
  UPDATE public.sys_audit_stream_locks
  SET last_sequence = v_next_seq,
      last_hash = v_curr_hash,
      updated_at = v_occurred_at
  WHERE topic = p_topic;

  RETURN jsonb_build_object(
    'log_id', v_log_id,
    'topic', p_topic,
    'sequence_number', v_next_seq,
    'prev_hash', v_lock_hash,
    'curr_hash', v_curr_hash,
    'occurred_at', v_occurred_at
  );
END;
$$;

-- 5. Timeline Reconstruction RPC
CREATE OR REPLACE FUNCTION public.reconstruct_entity_timeline(
  p_entity_type TEXT,
  p_entity_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_timeline JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'log_id', l.log_id,
      'topic', l.topic,
      'sequence_number', l.sequence_number,
      'prev_hash', l.prev_hash,
      'curr_hash', l.curr_hash,
      'actor_id', l.actor_id,
      'actor_type', l.actor_type,
      'org_context_id', l.org_context_id,
      'policy_id', l.policy_id,
      'policy_version', l.policy_version,
      'decision', l.decision,
      'reason_code', l.reason_code,
      'entity_type', l.entity_type,
      'entity_id', l.entity_id,
      'action', l.action,
      'state_before', l.state_before,
      'state_after', l.state_after,
      'changed_fields', l.changed_fields,
      'request_id', l.request_id,
      'occurred_at', l.occurred_at
    ) ORDER BY l.occurred_at ASC, l.sequence_number ASC
  ) INTO v_timeline
  FROM public.sys_audit_logs l
  WHERE l.entity_type = p_entity_type
    AND l.entity_id = p_entity_id;

  RETURN COALESCE(v_timeline, '[]'::jsonb);
END;
$$;

-- 6. Chain Integrity Verification RPC
CREATE OR REPLACE FUNCTION public.verify_audit_chain_integrity(
  p_topic TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  rec RECORD;
  v_expected_prev_hash TEXT := '0000000000000000000000000000000000000000000000000000000000000000';
  v_expected_seq BIGINT := 1;
  v_total_records INT := 0;
  v_canonical_string TEXT;
  v_computed_hash TEXT;
BEGIN
  FOR rec IN
    SELECT * FROM public.sys_audit_logs
    WHERE topic = p_topic
    ORDER BY sequence_number ASC
  LOOP
    v_total_records := v_total_records + 1;

    -- Verify sequence continuity
    IF rec.sequence_number <> v_expected_seq THEN
      RETURN jsonb_build_object(
        'topic', p_topic,
        'is_valid', false,
        'total_records', v_total_records,
        'verified_at', clock_timestamp(),
        'failed_at_sequence', rec.sequence_number,
        'failure_reason', concat('Sequence gap detected. Expected ', v_expected_seq, ', got ', rec.sequence_number)
      );
    END IF;

    -- Verify prev_hash continuity
    IF rec.prev_hash <> v_expected_prev_hash THEN
      RETURN jsonb_build_object(
        'topic', p_topic,
        'is_valid', false,
        'total_records', v_total_records,
        'verified_at', clock_timestamp(),
        'failed_at_sequence', rec.sequence_number,
        'failure_reason', 'Prev hash mismatch in chain link.'
      );
    END IF;

    -- Recompute SHA-256 hash
    v_canonical_string := concat_ws('|',
      rec.log_id::text,
      rec.topic,
      rec.sequence_number::text,
      rec.prev_hash,
      rec.occurred_at::text,
      rec.actor_id,
      rec.actor_type,
      rec.org_context_id,
      COALESCE(rec.policy_id, ''),
      rec.policy_version,
      rec.decision,
      rec.reason_code,
      COALESCE(rec.granted_scope, ''),
      rec.entity_type,
      rec.entity_id,
      rec.action,
      COALESCE(rec.state_before::text, ''),
      COALESCE(rec.state_after::text, ''),
      rec.changed_fields::text,
      rec.request_id,
      rec.transaction_id,
      rec.correlation_id
    );

    v_computed_hash := encode(digest(v_canonical_string, 'sha256'), 'hex');

    IF rec.curr_hash <> v_computed_hash THEN
      RETURN jsonb_build_object(
        'topic', p_topic,
        'is_valid', false,
        'total_records', v_total_records,
        'verified_at', clock_timestamp(),
        'failed_at_sequence', rec.sequence_number,
        'failure_reason', 'Unalterable evidence record has been tampered with! Computed hash does not match stored curr_hash.'
      );
    END IF;

    v_expected_prev_hash := rec.curr_hash;
    v_expected_seq := v_expected_seq + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'topic', p_topic,
    'is_valid', true,
    'total_records', v_total_records,
    'verified_at', clock_timestamp()
  );
END;
$$;

-- RLS Enforcement Policy on sys_audit_logs
ALTER TABLE public.sys_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY sys_audit_logs_read_policy ON public.sys_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    org_context_id IN (
      SELECT unnest(string_to_array(coalesce(auth.jwt()->>'org_scope', ''), ','))
    )
    OR auth.jwt()->>'role' = 'DEVELOPER_ADMIN'
  );

GRANT SELECT ON public.sys_audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.append_audit_evidence TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reconstruct_entity_timeline TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_audit_chain_integrity TO authenticated;
