-- supabase/migrations/20260903_pendeta_360_rpc.sql

CREATE OR REPLACE FUNCTION get_pendeta_360(
  p_id_pendeta VARCHAR,
  p_requester_role VARCHAR,
  p_requester_scope_mupel VARCHAR DEFAULT NULL,
  p_requester_scope_jemaat VARCHAR DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  can_see_private BOOLEAN;
  can_see_audit BOOLEAN;
BEGIN
  -- 1. RBAC hard-check (gagal cepat jika unauthorized)
  IF p_requester_role = 'super_user' THEN
    can_see_private := TRUE;
    can_see_audit := TRUE;
  ELSIF p_requester_role = 'admin_mupel' THEN
    -- Admin Mupel: hanya pendeta di Mupel-nya
    IF NOT EXISTS (
      SELECT 1 FROM m_pendeta p
      JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
      WHERE p.id_pendeta = p_id_pendeta
        AND j.id_mupel = p_requester_scope_mupel
    ) THEN
      RAISE EXCEPTION 'RBAC_VIOLATION: Pendeta tidak berada di Mupel Anda';
    END IF;
    can_see_private := FALSE; -- Admin Mupel tidak boleh lihat Keluarga/Biometrik
    can_see_audit := TRUE;
  ELSIF p_requester_role = 'kmj' THEN
    -- KMJ: hanya pendeta di Jemaat-nya
    IF NOT EXISTS (
      SELECT 1 FROM m_pendeta
      WHERE id_pendeta = p_id_pendeta
        AND id_induk = p_requester_scope_jemaat
    ) THEN
      RAISE EXCEPTION 'RBAC_VIOLATION: Pendeta tidak berada di Jemaat Anda';
    END IF;
    can_see_private := FALSE;
    can_see_audit := TRUE;
  ELSIF p_requester_role IN ('pj', 'user') THEN
    -- PJ/User: hanya diri sendiri
    IF NOT EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND id_pendeta = p_id_pendeta
    ) THEN
      RAISE EXCEPTION 'RBAC_VIOLATION: Anda hanya bisa melihat profil sendiri';
    END IF;
    can_see_private := TRUE; -- Diri sendiri bisa lihat semua
    can_see_audit := TRUE;
  ELSE
    RAISE EXCEPTION 'RBAC_VIOLATION: Role tidak diizinkan';
  END IF;

  -- 2. Agregasi data (baru setelah RBAC lolos)
  SELECT jsonb_build_object(
    'pendeta', (
      SELECT row_to_json(p.*) FROM m_pendeta p WHERE p.id_pendeta = p_id_pendeta
    ),
    'stats', (
      SELECT jsonb_build_object(
        'total_log', COUNT(DISTINCT lp.id_log),
        'total_jiwa', COALESCE(SUM(lp.jml_jiwa), 0),
        'pos_aktif', COUNT(DISTINCT tp.id_pos),
        'log_bulan_ini', COUNT(DISTINCT lp.id_log) FILTER (WHERE lp.tgl >= DATE_TRUNC('month', CURRENT_DATE)),
        'lama_melayani_bulan', EXTRACT(YEAR FROM AGE(CURRENT_DATE, MIN(p.tgl_tugas))) * 12 + EXTRACT(MONTH FROM AGE(CURRENT_DATE, MIN(p.tgl_tugas)))
      )
      FROM m_pendeta p
      LEFT JOIN t_log_pastoral lp ON p.id_pendeta = lp.id_pendeta
      LEFT JOIN t_penugasan_pendeta tp ON p.id_pendeta = tp.id_pendeta AND tp.status_tugas = 'Aktif'
      WHERE p.id_pendeta = p_id_pendeta
    ),
    'keluarga', CASE WHEN can_see_private THEN (
      SELECT jsonb_agg(row_to_json(k.*)) FROM t_keluarga_pendeta k WHERE k.id_pendeta = p_id_pendeta
    ) ELSE NULL END,
    'kompetensi', (
      SELECT jsonb_agg(row_to_json(k.*)) FROM t_kompetensi_pendeta k WHERE k.id_pendeta = p_id_pendeta
    ),
    'keterlibatan', (
      SELECT jsonb_agg(row_to_json(k.*) ORDER BY k.tgl_mulai DESC) 
      FROM t_keterlibatan_pendeta k WHERE k.id_pendeta = p_id_pendeta
    ),
    'mutasi', (
      SELECT jsonb_agg(row_to_json(m.*) ORDER BY m.tanggal_mutasi DESC) 
      FROM t_riwayat_mutasi_pendeta m WHERE m.id_pendeta = p_id_pendeta
    ),
    'jabatan', (
      SELECT jsonb_agg(row_to_json(j.*) ORDER BY j.tgl_mulai DESC) 
      FROM t_jabatan_struktural j WHERE j.id_pendeta = p_id_pendeta
    ),
    'biometric', CASE WHEN can_see_private THEN (
      SELECT jsonb_agg(jsonb_build_object(
        'id', w.id,
        'device_type', w.device_type,
        'display_name', w.display_name,
        'last_used_at', w.last_used_at,
        'created_at', w.created_at
      )) 
      FROM m_webauthn_credentials w 
      JOIN users u ON w.id_user = u.id 
      WHERE u.id_pendeta = p_id_pendeta
    ) ELSE NULL END,
    'audit_log', CASE WHEN can_see_audit THEN (
      SELECT jsonb_agg(jsonb_build_object(
        'id', l.id,
        'aksi', l.aksi,
        'target_table', l.target_table,
        'target_id', l.target_id,
        'created_at', l.created_at
      ) ORDER BY l.created_at DESC) 
      FROM t_log_aktivitas l 
      WHERE l.id_user = (SELECT id FROM users WHERE id_pendeta = p_id_pendeta)
      LIMIT 50
    ) ELSE NULL END
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION get_pendeta_360(VARCHAR, VARCHAR, VARCHAR, VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_pendeta_360(VARCHAR, VARCHAR, VARCHAR, VARCHAR) TO authenticated;
