-- =============================================================================
-- PROOF TEST: RESTRICT Deletion Behavior (SQLSTATE 23503)
-- Membuktikan pendeta ber-riwayat DITOLAK saat dihapus (FK RESTRICT)
-- Jalankan: SELECT * FROM test_proof_restrict_delete();
-- =============================================================================
CREATE OR REPLACE FUNCTION test_proof_restrict_delete()
RETURNS TABLE (skenario TEXT, harapan TEXT, hasil TEXT, status TEXT)
LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_test_pdt VARCHAR := 'PDT-99999999';
  v_test_pos VARCHAR := 'POS-99999';
  v_test_log VARCHAR := 'LOG-9999999999999-999';
  v_test_induk VARCHAR;
  v_sqlerrm TEXT;
BEGIN
  -- ===== Pre-cleanup (idempotency: child -> parent) =====
  DELETE FROM public.t_log_pastoral WHERE id_log = v_test_log;
  DELETE FROM public.m_pos_pelkes WHERE id_pos = v_test_pos;
  DELETE FROM public.m_pendeta WHERE id_pendeta = v_test_pdt;

  -- Ambil jemaat induk acak untuk FK m_pos_pelkes & m_pendeta
  SELECT id_induk INTO v_test_induk FROM m_jemaat_induk LIMIT 1;
  IF v_test_induk IS NULL THEN v_test_induk := '23-03-ET'; END IF;

  -- 1. Setup Test Data (Pendeta + Pos + Log Pastoral)
  INSERT INTO public.m_pendeta (id_pendeta, id_induk, nama_lengkap, status)
  VALUES (v_test_pdt, v_test_induk, 'Pendeta Uji RESTRICT', 'Aktif')
  ON CONFLICT (id_pendeta) DO NOTHING;

  INSERT INTO public.m_pos_pelkes (id_pos, id_induk, nama_pos)
  VALUES (v_test_pos, v_test_induk, 'Pos Uji RESTRICT')
  ON CONFLICT (id_pos) DO NOTHING;

  INSERT INTO public.t_log_pastoral (id_log, id_pos, id_pendeta, tgl, kegiatan)
  VALUES (v_test_log, v_test_pos, v_test_pdt, CURRENT_DATE, 'Kunjungan Uji RESTRICT')
  ON CONFLICT (id_log) DO NOTHING;

  -- 2. Action: Coba Hapus Pendeta ber-riwayat
  BEGIN
    DELETE FROM public.m_pendeta WHERE id_pendeta = v_test_pdt;
    hasil := 'GAGAL: Pendeta ber-riwayat terhapus!';
    status := 'FAIL';
  EXCEPTION WHEN foreign_key_violation THEN
    v_sqlerrm := SQLERRM;
    hasil := '23503 RESTRICT DITOLAK DENGAN BENAR: ' || left(v_sqlerrm, 60);
    status := 'PASS';
  WHEN OTHERS THEN
    v_sqlerrm := SQLERRM;
    hasil := 'ERROR LAIN: ' || SQLERRM;
    status := 'FAIL';
  END;

  skenario := 'Penghapusan m_pendeta yang memiliki riwayat di t_log_pastoral';
  harapan := 'DITOLAK dengan SQLSTATE 23503 (foreign_key_violation)';
  RETURN NEXT;

  -- 3. Post-teardown (Urutan Child -> Parent)
  DELETE FROM public.t_log_pastoral WHERE id_log = v_test_log;
  DELETE FROM public.m_pos_pelkes WHERE id_pos = v_test_pos;
  DELETE FROM public.m_pendeta WHERE id_pendeta = v_test_pdt;

  RETURN;
END;
$$;
