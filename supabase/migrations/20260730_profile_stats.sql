-- Migration: RPC get_profile_stats Security Hardening & Strict RLS Audit Policies for Profile 360°
-- RPC ini didokumentasikan di: documentation/master/SI GPIB v2.2 — ERD.md §8
-- dan Blueprint v2.2 §5. Ubah keduanya jika signature/behavior berubah.

-- 1. SECURITY DEFINER Guard for get_profile_stats
CREATE OR REPLACE FUNCTION get_profile_stats(p_id_pendeta text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_total_log bigint := 0;
  v_total_jiwa bigint := 0;
  v_pos_aktif bigint := 0;
  v_log_bulan_ini bigint := 0;
  v_lama_melayani_bulan integer := 0;
  v_tgl_tugas timestamptz;
  v_caller_role text;
  v_caller_pendeta text;
  v_result json;
BEGIN
  IF p_id_pendeta IS NULL OR p_id_pendeta = '' THEN
    RETURN json_build_object(
      'total_log', 0,
      'total_jiwa', 0,
      'pos_aktif', 0,
      'log_bulan_ini', 0,
      'lama_melayani_bulan', 0
    );
  END IF;

  -- Security Guard: Verify caller authorization
  v_caller_role := COALESCE(auth.jwt() ->> 'role', 'authenticated');

  SELECT id_pendeta INTO v_caller_pendeta
  FROM users
  WHERE id = auth.uid();

  IF v_caller_role NOT IN ('super_user', 'superadmin', 'sinode', 'admin_mupel', 'kmj')
     AND (v_caller_pendeta IS NULL OR v_caller_pendeta IS DISTINCT FROM p_id_pendeta) THEN
    RETURN json_build_object(
      'total_log', 0,
      'total_jiwa', 0,
      'pos_aktif', 0,
      'log_bulan_ini', 0,
      'lama_melayani_bulan', 0
    );
  END IF;

  -- 1. Count logs and jiwa from t_log_pastoral
  SELECT 
    COALESCE(COUNT(*), 0),
    COALESCE(SUM(jumlah_jiwa), 0),
    COALESCE(COUNT(*) FILTER (WHERE date_trunc('month', tgl_kegiatan) = date_trunc('month', CURRENT_DATE)), 0)
  INTO v_total_log, v_total_jiwa, v_log_bulan_ini
  FROM t_log_pastoral
  WHERE id_pendeta = p_id_pendeta;

  -- 2. Count active assigned pos from t_penugasan_pj
  SELECT COALESCE(COUNT(*), 0)
  INTO v_pos_aktif
  FROM t_penugasan_pj
  WHERE id_pendeta = p_id_pendeta AND (status_aktif = true OR status_aktif IS NULL);

  -- 3. Calculate months serving from m_pendeta.tgl_tugas_awal
  SELECT tgl_tugas_awal INTO v_tgl_tugas
  FROM m_pendeta
  WHERE id_pendeta = p_id_pendeta;

  IF v_tgl_tugas IS NOT NULL THEN
    v_lama_melayani_bulan := (
      (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM v_tgl_tugas)) * 12 +
      (EXTRACT(MONTH FROM CURRENT_DATE) - EXTRACT(MONTH FROM v_tgl_tugas))
    )::integer;
    IF v_lama_melayani_bulan < 0 THEN
      v_lama_melayani_bulan := 0;
    END IF;
  END IF;

  v_result := json_build_object(
    'total_log', v_total_log,
    'total_jiwa', v_total_jiwa,
    'pos_aktif', v_pos_aktif,
    'log_bulan_ini', v_log_bulan_ini,
    'lama_melayani_bulan', v_lama_melayani_bulan
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_profile_stats(text) TO authenticated;

-- 2. Enable RLS & Strict Private Policies for Audit Logs (t_log_aktivitas)
ALTER TABLE IF EXISTS t_log_aktivitas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "aktivitas_privat_read" ON t_log_aktivitas;
CREATE POLICY "aktivitas_privat_read" ON t_log_aktivitas
FOR SELECT
USING (
  id_user = auth.uid()
  OR (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_user', 'superadmin', 'sinode')
  )
);

-- 3. Enable RLS & Strict Private Policies for Biometric Devices (m_webauthn_credentials)
ALTER TABLE IF EXISTS m_webauthn_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "webauthn_privat_read" ON m_webauthn_credentials;
CREATE POLICY "webauthn_privat_read" ON m_webauthn_credentials
FOR SELECT
USING (
  id_user = auth.uid()
  OR (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_user', 'superadmin', 'sinode')
  )
);
