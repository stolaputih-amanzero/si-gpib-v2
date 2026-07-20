-- Migration: Atomic approval processing function for Pengajuan Bantuan
CREATE OR REPLACE FUNCTION process_pengajuan_bantuan(
  p_id_ajuan VARCHAR,
  p_aksi VARCHAR, -- 'approve', 'reject', 'revision'
  p_catatan TEXT
) RETURNS VOID AS $$
DECLARE
  v_current_status VARCHAR;
  v_next_status VARCHAR;
  v_user_role VARCHAR;
  v_user_id UUID;
  v_actor_phone VARCHAR;
BEGIN
  -- 1. Get current authenticated user
  v_user_id := auth.uid();
  SELECT role, no_telepon INTO v_user_role, v_actor_phone 
  FROM users WHERE id = v_user_id;

  -- Default to 'super_user' if user role is not explicitly set in table
  IF v_user_role IS NULL THEN
    v_user_role := 'super_user';
  END IF;

  -- 2. Get current status of pengajuan
  SELECT status INTO v_current_status 
  FROM t_pengajuan_bantuan WHERE id_ajuan = p_id_ajuan;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Pengajuan bantuan tidak ditemukan: %', p_id_ajuan;
  END IF;

  -- 3. Validate workflow step transitions
  IF p_aksi = 'approve' THEN
    IF v_current_status = 'Pending_KMJ' AND v_user_role IN ('kmj', 'super_user', 'admin_mupel', 'admin') THEN 
      v_next_status := 'Pending_Mupel';
    ELSIF v_current_status = 'Pending_Mupel' AND v_user_role IN ('admin_mupel', 'super_user', 'admin') THEN 
      v_next_status := 'Pending_Sinode';
    ELSIF v_current_status = 'Pending_Sinode' AND v_user_role IN ('super_user', 'admin') THEN 
      v_next_status := 'Approved';
    ELSIF v_user_role IN ('super_user', 'admin') THEN
      -- Super user force approve fallback
      v_next_status := CASE 
        WHEN v_current_status = 'Pending_KMJ' THEN 'Pending_Mupel'
        WHEN v_current_status = 'Pending_Mupel' THEN 'Pending_Sinode'
        ELSE 'Approved'
      END;
    ELSE
      RAISE EXCEPTION 'Aksi approve tidak diizinkan untuk status (%) atau role (%)', v_current_status, v_user_role;
    END IF;
  ELSIF p_aksi IN ('reject', 'revision') THEN
    v_next_status := CASE WHEN p_aksi = 'revision' THEN 'Draft' ELSE 'Rejected' END;
  ELSE
    RAISE EXCEPTION 'Aksi approval tidak valid: %', p_aksi;
  END IF;

  -- 4. ATOMIC EXECUTION: Insert audit log entry
  INSERT INTO t_approval_bantuan (id_ajuan, approver_id, role_approver, aksi, catatan)
  VALUES (p_id_ajuan, v_user_id, v_user_role, p_aksi, p_catatan);

  -- 5. ATOMIC EXECUTION: Update status in t_pengajuan_bantuan
  UPDATE t_pengajuan_bantuan 
  SET status = v_next_status, updated_at = NOW() 
  WHERE id_ajuan = p_id_ajuan;

  -- 6. ATOMIC EXECUTION: Record activity log if t_log_aktivitas exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 't_log_aktivitas') THEN
    INSERT INTO t_log_aktivitas (id_log, id_user, aktor, aksi, objek_type, objek_id, keterangan)
    VALUES (
      'LOG-' || gen_random_uuid()::text,
      v_user_id,
      COALESCE(v_actor_phone, 'System User'),
      'APPROVE',
      'bantuan',
      p_id_ajuan,
      p_aksi || ': ' || p_catatan
    );
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
