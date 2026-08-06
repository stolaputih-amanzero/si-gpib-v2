-- supabase/migrations/20260808_create_log_pastoral_atomic.sql
-- Migration 6a: Idempotency table constraints & Log Pastoral RPC

-- (a) sys_transaction_logs is already created in a previous migration, 
-- but we need to ensure the unique constraint (request_id, user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_sys_txn_logs_request'
    ) THEN
        ALTER TABLE sys_transaction_logs 
        ADD CONSTRAINT uq_sys_txn_logs_request UNIQUE (request_id, user_id);
    END IF;
END $$;

-- (b) RLS for t_penugasan_pendeta to allow RBAC checks
ALTER TABLE t_penugasan_pendeta ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "baca_penugasan_sendiri" ON t_penugasan_pendeta;
CREATE POLICY "baca_penugasan_sendiri"
ON t_penugasan_pendeta FOR SELECT TO authenticated
USING (id_pendeta = (SELECT id_pendeta FROM users WHERE id = auth.uid()));

-- (c) Partial index to block double-assign
CREATE UNIQUE INDEX IF NOT EXISTS uq_penugasan_pendeta_aktif 
ON t_penugasan_pendeta (id_pendeta, id_pos) 
WHERE status_tugas = 'Aktif' AND tgl_selesai IS NULL;

-- (d) RPC for Atomic Insert
CREATE OR REPLACE FUNCTION create_log_pastoral_atomic(
  p_id_log VARCHAR,
  p_id_pos VARCHAR,
  p_id_pendeta VARCHAR,
  p_tgl DATE,
  p_kegiatan VARCHAR,
  p_jml_jiwa INT,
  p_catatan TEXT,
  p_foto_url TEXT,
  p_request_id VARCHAR,
  p_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Defense-in-depth RBAC (F-4c)
  IF NOT EXISTS (SELECT 1 FROM t_penugasan_pendeta
                 WHERE id_pendeta = p_id_pendeta AND id_pos = p_id_pos
                   AND status_tugas = 'Aktif' AND tgl_selesai IS NULL)
  THEN 
    RAISE EXCEPTION 'RBAC_VIOLATION: penugasan aktif tidak ditemukan';
  END IF;

  -- Idempotency check (double-lock)
  IF EXISTS (
    SELECT 1 FROM sys_transaction_logs 
    WHERE request_id = p_request_id AND user_id = p_user_id
  ) THEN
    RETURN; -- sudah diproses, skip
  END IF;

  -- Insert log pastoral
  INSERT INTO t_log_pastoral (
    id_log, id_pos, id_pendeta, tgl, kegiatan, 
    jml_jiwa, catatan, foto_url
  ) VALUES (
    p_id_log, p_id_pos, p_id_pendeta, p_tgl, p_kegiatan,
    p_jml_jiwa, p_catatan, p_foto_url
  );

  -- Catat di sys_transaction_logs (idempotency record)
  INSERT INTO sys_transaction_logs (
    request_id, user_id, operation_type, table_name,
    record_id, payload_summary, created_at
  ) VALUES (
    p_request_id, p_user_id, 'insert', 't_log_pastoral',
    p_id_log, jsonb_build_object('id_pos', p_id_pos, 'kegiatan', p_kegiatan),
    NOW()
  );
END;
$$;

-- RLS: hanya authenticated + via RPC
REVOKE ALL ON FUNCTION create_log_pastoral_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_log_pastoral_atomic TO authenticated;
