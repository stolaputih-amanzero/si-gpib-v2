-- =============================================================================
-- PROOF TEST: get_pendeta_360 — Scope & Privacy Guard
-- Membuktikan guard bekerja di level database (bukan asumsi).
-- Jalankan Canary (Skenario #1 saja): SELECT * FROM test_proof_get_pendeta_360(1);
-- Jalankan Semua (1–8):                SELECT * FROM test_proof_get_pendeta_360();
-- =============================================================================
CREATE OR REPLACE FUNCTION test_proof_get_pendeta_360(p_scenario_no INT DEFAULT NULL)
RETURNS TABLE (no INT, skenario TEXT, harapan TEXT, hasil TEXT, status TEXT)
LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_pdt_m01 VARCHAR; v_pdt_m23 VARCHAR; v_pdt_null VARCHAR;
  v_su UUID := '11111111-1111-1111-1111-111111111111';
  v_am01 UUID := '22222222-2222-2222-2222-222222222222';
  v_am23 UUID := '33333333-3333-3333-3333-333333333333';
  v_amno UUID := '44444444-4444-4444-4444-444444444444';
  v_own  UUID := '55555555-5555-5555-5555-555555555555';
  v_other UUID := '66666666-6666-6666-6666-666666666666';
  v_res JSONB; v_hasil TEXT; v_status TEXT; v_n INT := 0;
BEGIN
  -- ===== Pre-cleanup (idempotency) =====
  DELETE FROM public.users WHERE id IN (v_su, v_am01, v_am23, v_amno, v_own, v_other);

  -- ===== Ambil target dari data aktual (fallback ke ID known) =====
  SELECT p.id_pendeta INTO v_pdt_m01 FROM m_pendeta p
    JOIN m_jemaat_induk j ON j.id_induk = p.id_induk WHERE j.id_mupel = 'M-01' LIMIT 1;
  SELECT p.id_pendeta INTO v_pdt_m23 FROM m_pendeta p
    JOIN m_jemaat_induk j ON j.id_induk = p.id_induk WHERE j.id_mupel = 'M-23' LIMIT 1;
  SELECT p.id_pendeta INTO v_pdt_null FROM m_pendeta p WHERE p.id_induk IS NULL LIMIT 1;
  IF v_pdt_m01 IS NULL THEN v_pdt_m01 := 'PDT-70501119'; END IF;
  IF v_pdt_m23 IS NULL THEN v_pdt_m23 := 'PDT-41915346'; END IF;

  -- ===== Setup test users =====
  INSERT INTO public.users (id, no_telepon, role, status, id_mupel, id_pendeta) VALUES
    (v_su,   '+629999000001', 'super_user',  'Aktif', NULL,   NULL),
    (v_am01, '+629999000002', 'admin_mupel', 'Aktif', 'M-01', NULL),
    (v_am23, '+629999000003', 'admin_mupel', 'Aktif', 'M-23', NULL),
    (v_amno, '+629999000004', 'admin_mupel', 'Aktif', NULL,   NULL),
    (v_own,  '+629999000005', 'user',        'Aktif', NULL,   v_pdt_m23),
    (v_other,'+629999000006', 'user',        'Aktif', NULL,   NULL)
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role, id_mupel = EXCLUDED.id_mupel, id_pendeta = EXCLUDED.id_pendeta;

  -- ===== Skenario 1: Super User → M-23 → SUCCESS + keluarga =====
  v_n := v_n + 1;
  IF p_scenario_no IS NULL OR p_scenario_no = v_n THEN
    BEGIN
      PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', v_su, 'role', 'super_user')::text, true);
      v_res := get_pendeta_360(v_pdt_m23);
      v_hasil := CASE WHEN v_res ? 'keluarga' AND jsonb_array_length(v_res->'keluarga') >= 0 THEN 'SUCCESS + keluarga' ELSE 'SUCCESS tanpa keluarga' END;
      v_status := CASE WHEN v_res ? 'keluarga' THEN 'PASS' ELSE 'FAIL' END;
    EXCEPTION WHEN OTHERS THEN v_hasil := 'ERROR: ' || SQLERRM; v_status := 'FAIL';
    END;
    no := v_n; skenario := 'Super User → pendeta M-23 (CANARY TEST)'; harapan := 'SUCCESS + keluarga';
    hasil := v_hasil; status := v_status; RETURN NEXT;
  END IF;

  -- ===== Skenario 2: Pemilik → dirinya → SUCCESS + keluarga =====
  v_n := v_n + 1;
  IF p_scenario_no IS NULL OR p_scenario_no = v_n THEN
    BEGIN
      PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', v_own, 'role', 'user')::text, true);
      v_res := get_pendeta_360(v_pdt_m23);
      v_hasil := CASE WHEN v_res ? 'keluarga' THEN 'SUCCESS + keluarga' ELSE 'SUCCESS tanpa keluarga' END;
      v_status := CASE WHEN v_res ? 'keluarga' THEN 'PASS' ELSE 'FAIL' END;
    EXCEPTION WHEN OTHERS THEN v_hasil := 'ERROR: ' || SQLERRM; v_status := 'FAIL';
    END;
    no := v_n; skenario := 'Pemilik → dirinya sendiri'; harapan := 'SUCCESS + keluarga';
    hasil := v_hasil; status := v_status; RETURN NEXT;
  END IF;

  -- ===== Skenario 3: Admin M-23 (se-scope) → M-23 → SUCCESS TANPA keluarga =====
  v_n := v_n + 1;
  IF p_scenario_no IS NULL OR p_scenario_no = v_n THEN
    BEGIN
      PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', v_am23, 'role', 'admin_mupel')::text, true);
      v_res := get_pendeta_360(v_pdt_m23);
      v_hasil := CASE WHEN (v_res->'keluarga') = '[]'::jsonb OR (NOT (v_res ? 'keluarga')) THEN 'SUCCESS tanpa keluarga' ELSE 'BOCOR: keluarga terlihat!' END;
      v_status := CASE WHEN (v_res->'keluarga') = '[]'::jsonb OR (NOT (v_res ? 'keluarga')) THEN 'PASS' ELSE 'FAIL' END;
    EXCEPTION WHEN OTHERS THEN v_hasil := 'ERROR: ' || SQLERRM; v_status := 'FAIL';
    END;
    no := v_n; skenario := 'Admin M-23 (se-scope) → pendeta M-23'; harapan := 'SUCCESS tanpa keluarga';
    hasil := v_hasil; status := v_status; RETURN NEXT;
  END IF;

  -- ===== Skenario 4 (#7 KRITIS): Admin M-01 → M-23 (lintas scope) → FORBIDDEN =====
  v_n := v_n + 1;
  IF p_scenario_no IS NULL OR p_scenario_no = v_n THEN
    BEGIN
      PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', v_am01, 'role', 'admin_mupel')::text, true);
      v_res := get_pendeta_360(v_pdt_m23);
      v_hasil := 'BOCOR! Data kembali: ' || left(v_res::text, 80); v_status := 'FAIL';
    EXCEPTION WHEN OTHERS THEN
      v_hasil := CASE WHEN SQLERRM ILIKE '%forbidden%' THEN 'FORBIDDEN (ditolak)' ELSE 'ERROR lain: ' || SQLERRM END;
      v_status := CASE WHEN SQLERRM ILIKE '%forbidden%' THEN 'PASS' ELSE 'FAIL' END;
    END;
    no := v_n; skenario := '#7 Admin M-01 → pendeta M-23 (LINTAS SCOPE)'; harapan := 'FORBIDDEN';
    hasil := v_hasil; status := v_status; RETURN NEXT;
  END IF;

  -- ===== Skenario 5: Admin tanpa id_mupel → FORBIDDEN =====
  v_n := v_n + 1;
  IF p_scenario_no IS NULL OR p_scenario_no = v_n THEN
    BEGIN
      PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', v_amno, 'role', 'admin_mupel')::text, true);
      v_res := get_pendeta_360(v_pdt_m23);
      v_hasil := 'BOCOR!'; v_status := 'FAIL';
    EXCEPTION WHEN OTHERS THEN
      v_hasil := CASE WHEN SQLERRM ILIKE '%forbidden%' THEN 'FORBIDDEN' ELSE 'ERROR: ' || SQLERRM END;
      v_status := CASE WHEN SQLERRM ILIKE '%forbidden%' THEN 'PASS' ELSE 'FAIL' END;
    END;
    no := v_n; skenario := 'Admin tanpa id_mupel → pendeta M-23'; harapan := 'FORBIDDEN';
    hasil := v_hasil; status := v_status; RETURN NEXT;
  END IF;

  -- ===== Skenario 6: User biasa (bukan pemilik) → FORBIDDEN =====
  v_n := v_n + 1;
  IF p_scenario_no IS NULL OR p_scenario_no = v_n THEN
    BEGIN
      PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', v_other, 'role', 'user')::text, true);
      v_res := get_pendeta_360(v_pdt_m23);
      v_hasil := 'BOCOR!'; v_status := 'FAIL';
    EXCEPTION WHEN OTHERS THEN
      v_hasil := CASE WHEN SQLERRM ILIKE '%forbidden%' THEN 'FORBIDDEN' ELSE 'ERROR: ' || SQLERRM END;
      v_status := CASE WHEN SQLERRM ILIKE '%forbidden%' THEN 'PASS' ELSE 'FAIL' END;
    END;
    no := v_n; skenario := 'User biasa (bukan pemilik) → pendeta M-23'; harapan := 'FORBIDDEN';
    hasil := v_hasil; status := v_status; RETURN NEXT;
  END IF;

  -- ===== Skenario 7: Anonymous (tanpa JWT) → FORBIDDEN =====
  v_n := v_n + 1;
  IF p_scenario_no IS NULL OR p_scenario_no = v_n THEN
    BEGIN
      PERFORM set_config('request.jwt.claims', '{}'::text, true);
      v_res := get_pendeta_360(v_pdt_m23);
      v_hasil := 'BOCOR!'; v_status := 'FAIL';
    EXCEPTION WHEN OTHERS THEN
      v_hasil := CASE WHEN SQLERRM ILIKE '%forbidden%' THEN 'FORBIDDEN' ELSE 'ERROR: ' || SQLERRM END;
      v_status := CASE WHEN SQLERRM ILIKE '%forbidden%' THEN 'PASS' ELSE 'FAIL' END;
    END;
    no := v_n; skenario := 'Anonymous (tanpa JWT) → pendeta M-23'; harapan := 'FORBIDDEN';
    hasil := v_hasil; status := v_status; RETURN NEXT;
  END IF;

  -- ===== Skenario 8: Admin M-23 → pendeta unassigned (NULL) → FORBIDDEN (default deny) =====
  IF v_pdt_null IS NOT NULL THEN
    v_n := v_n + 1;
    IF p_scenario_no IS NULL OR p_scenario_no = v_n THEN
      BEGIN
        PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', v_am23, 'role', 'admin_mupel')::text, true);
        v_res := get_pendeta_360(v_pdt_null);
        v_hasil := 'BOCOR!'; v_status := 'FAIL';
      EXCEPTION WHEN OTHERS THEN
        v_hasil := CASE WHEN SQLERRM ILIKE '%forbidden%' THEN 'FORBIDDEN' ELSE 'ERROR: ' || SQLERRM END;
        v_status := CASE WHEN SQLERRM ILIKE '%forbidden%' THEN 'PASS' ELSE 'FAIL' END;
      END;
      no := v_n; skenario := 'Admin M-23 → pendeta unassigned (id_induk NULL)'; harapan := 'FORBIDDEN';
      hasil := v_hasil; status := v_status; RETURN NEXT;
    END IF;
  END IF;

  -- ===== Teardown =====
  DELETE FROM public.users WHERE id IN (v_su, v_am01, v_am23, v_amno, v_own, v_other);
  RETURN;
END;
$$;
