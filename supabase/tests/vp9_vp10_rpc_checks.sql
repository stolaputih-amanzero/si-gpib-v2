CREATE TEMP TABLE IF NOT EXISTS vp_results (test_id TEXT, status TEXT, detail TEXT);

DO $$
DECLARE
  v_pen      RECORD;
  v_user_id  UUID;
  v_req_id   TEXT := gen_random_uuid()::text;
  v_id_log   TEXT := 'LOG-' || (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT::TEXT || '-777';
  v_cnt      INT;
  v_err      TEXT;
BEGIN
  SELECT tp.id_pendeta, tp.id_pos INTO v_pen
  FROM t_penugasan_pendeta tp
  WHERE tp.status_tugas = 'Aktif' AND tp.tgl_selesai IS NULL
  LIMIT 1;

  SELECT id INTO v_user_id FROM users LIMIT 1;

  IF v_pen.id_pendeta IS NULL OR v_user_id IS NULL THEN
    INSERT INTO vp_results VALUES ('PRECONDITION', 'FAIL', 'Butuh min. 1 penugasan aktif & 1 user');
  ELSE
    PERFORM create_log_pastoral_atomic(v_id_log, v_pen.id_pos, v_pen.id_pendeta,
      CURRENT_DATE, 'VP-9 Idempotency Test', NULL, 'Automated', NULL, v_req_id, v_user_id);
    PERFORM create_log_pastoral_atomic(v_id_log, v_pen.id_pos, v_pen.id_pendeta,
      CURRENT_DATE, 'VP-9 Idempotency Test', NULL, 'Automated', NULL, v_req_id, v_user_id);

    SELECT COUNT(*) INTO v_cnt FROM t_log_pastoral WHERE id_log = v_id_log;
    INSERT INTO vp_results
    SELECT 'VP-9a log_pastoral', CASE WHEN v_cnt = 1 THEN 'PASS' ELSE 'FAIL' END,
           'baris t_log_pastoral = ' || v_cnt || ' (harus 1)';

    SELECT COUNT(*) INTO v_cnt FROM sys_transaction_logs WHERE request_id::text = v_req_id;
    INSERT INTO vp_results
    SELECT 'VP-9b txn_logs', CASE WHEN v_cnt = 1 THEN 'PASS' ELSE 'FAIL' END,
           'baris sys_transaction_logs = ' || v_cnt || ' (harus 1)';

    DELETE FROM sys_transaction_logs WHERE request_id::text = v_req_id;
    DELETE FROM t_log_pastoral WHERE id_log = v_id_log;

    BEGIN
      PERFORM create_log_pastoral_atomic(
        'LOG-' || (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT::TEXT || '-778',
        'POS-99999',
        v_pen.id_pendeta, CURRENT_DATE, 'VP-10 RBAC Test', NULL, NULL, NULL,
        gen_random_uuid()::text, v_user_id);
      INSERT INTO vp_results VALUES ('VP-10 rbac_rpc', 'FAIL', 'RPC TIDAK memblokir akses tanpa penugasan');
    EXCEPTION WHEN OTHERS THEN
      v_err := SQLERRM;
      IF v_err LIKE '%RBAC_VIOLATION%' THEN
        INSERT INTO vp_results VALUES ('VP-10 rbac_rpc', 'PASS', 'Exception tertangkap: ' || v_err);
      ELSE
        INSERT INTO vp_results VALUES ('VP-10 rbac_rpc', 'FAIL', 'Error tak terduga: ' || v_err);
      END IF;
    END;
  END IF;
END $$;

SELECT * FROM vp_results ORDER BY test_id;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM vp_results WHERE status = 'FAIL') THEN
    RAISE EXCEPTION 'ADA UJI YANG GAGAL — lihat tabel vp_results di atas';
  END IF;
END $$;
