-- Migration: 20260806120000_create_sys_transaction_logs_and_telemetry.sql

-- 1. Idempotency Table
CREATE TABLE sys_transaction_logs (
  request_id VARCHAR(36) PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  operation_type VARCHAR(10) NOT NULL CHECK (operation_type IN ('insert', 'update', 'delete', 'rpc')),
  record_id VARCHAR(50),
  user_id UUID REFERENCES auth.users(id),
  payload_summary JSONB,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'conflict')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);

CREATE INDEX idx_sys_txn_expires ON sys_transaction_logs(expires_at);
CREATE INDEX idx_sys_txn_table ON sys_transaction_logs(table_name, created_at);
CREATE INDEX idx_sys_txn_user ON sys_transaction_logs(user_id, created_at);

-- RLS: hanya service role yang bisa write secara default, tapi kita pakai SECURITY DEFINER di RPC
ALTER TABLE sys_transaction_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON sys_transaction_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Authenticated read own" ON sys_transaction_logs FOR SELECT USING (user_id = auth.uid());

-- RPC: Check if request already processed
CREATE OR REPLACE FUNCTION check_idempotency(p_request_id VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sys_transaction_logs 
    WHERE request_id = p_request_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION check_idempotency(VARCHAR) TO authenticated;

-- RPC: Record completed transaction
CREATE OR REPLACE FUNCTION record_transaction(
  p_request_id VARCHAR,
  p_table_name VARCHAR,
  p_operation_type VARCHAR,
  p_record_id VARCHAR DEFAULT NULL,
  p_payload_summary JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO sys_transaction_logs (
    request_id, table_name, operation_type, record_id, payload_summary, user_id
  )
  VALUES (
    p_request_id, p_table_name, p_operation_type, p_record_id, p_payload_summary, auth.uid()
  )
  ON CONFLICT (request_id) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION record_transaction(VARCHAR, VARCHAR, VARCHAR, VARCHAR, JSONB) TO authenticated;

-- Cleanup Cron Job (pg_cron)
-- Hapus comment di bawah jika ekstensi pg_cron sudah diaktifkan di Supabase
-- SELECT cron.schedule(
--   'cleanup-expired-transactions',
--   '0 3 * * *',
--   $$DELETE FROM sys_transaction_logs WHERE expires_at < NOW()$$
-- );

-- 2. Telemetry Table
CREATE TABLE sys_telemetry (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'sync_start', 'sync_complete', 'sync_error', 
    'conflict_detected', 'queue_length', 'dlq_moved'
  )),
  device_id VARCHAR(100),
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(20),
  network_type VARCHAR(20),
  duration_ms INTEGER,
  queue_length INTEGER,
  success_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  conflict_count INTEGER DEFAULT 0,
  error_message TEXT,
  error_code VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_telemetry_event ON sys_telemetry(event_type, created_at);
CREATE INDEX idx_telemetry_date ON sys_telemetry(created_at);
CREATE INDEX idx_telemetry_user ON sys_telemetry(user_id, created_at);

-- RLS untuk Telemetry
ALTER TABLE sys_telemetry ENABLE ROW LEVEL SECURITY;
-- Izinkan authenticated users memasukkan data telemetry (karena dual-write dari client)
CREATE POLICY "Authenticated write telemetry" ON sys_telemetry FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Service role write" ON sys_telemetry FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Admin read all" ON sys_telemetry FOR SELECT USING (
  auth.role() = 'service_role' OR 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_user', 'admin_mupel'))
);
CREATE POLICY "User read own" ON sys_telemetry FOR SELECT USING (user_id = auth.uid());

-- Cleanup Cron Job (pg_cron)
-- SELECT cron.schedule(
--   'cleanup-old-telemetry',
--   '0 4 * * *',
--   $$DELETE FROM sys_telemetry WHERE created_at < NOW() - INTERVAL '90 days'$$
-- );
