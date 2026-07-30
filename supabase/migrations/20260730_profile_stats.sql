-- Migration: RPC get_profile_stats and RLS Policy Updates for Profile 360°

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
