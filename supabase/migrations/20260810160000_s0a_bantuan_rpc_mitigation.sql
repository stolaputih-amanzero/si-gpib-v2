-- Migration: S0a Mitigation for process_pengajuan_bantuan RPC
-- Description: Closes the p_role_approver override vulnerability.

CREATE OR REPLACE FUNCTION process_pengajuan_bantuan(
  p_id_ajuan VARCHAR,
  p_aksi VARCHAR, -- 'approve', 'reject', 'revision'
  p_catatan TEXT,
  p_role_approver VARCHAR DEFAULT NULL -- 'kmj', 'admin_mupel', 'super_user'
) RETURNS VOID AS $$
DECLARE
  v_current_status VARCHAR;
  v_next_status VARCHAR;
  v_user_role VARCHAR;
  v_user_id UUID;
  v_aktor VARCHAR;
BEGIN
  -- 1. Dapatkan info user yang sedang login
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User session missing';
  END IF;

  -- S0a MITIGATION: Derive role ONLY from public.users using auth.uid().
  -- Ignore p_role_approver parameter completely.
  SELECT role, COALESCE(no_telepon, email, 'User') INTO v_user_role, v_aktor 
  FROM public.users WHERE id = v_user_id;

  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User role not found in database';
  END IF;

  -- 2. Dapatkan status saat ini
  SELECT status INTO v_current_status 
  FROM public.t_pengajuan_bantuan WHERE id_ajuan = p_id_ajuan;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Pengajuan bantuan tidak ditemukan: %', p_id_ajuan;
  END IF;

  -- 3. Tentukan status berikutnya berdasarkan alur workflow
  IF p_aksi = 'approve' THEN
    IF v_current_status = 'Draft' OR v_current_status = 'Pending_KMJ' THEN 
      v_next_status := 'Pending_Mupel';
    ELSIF v_current_status = 'Pending_Mupel' THEN 
      v_next_status := 'Pending_Sinode';
    ELSIF v_current_status = 'Pending_Sinode' THEN 
      v_next_status := 'Approved';
    ELSE
      RAISE EXCEPTION 'Aksi approve tidak diizinkan untuk status saat ini: %', v_current_status;
    END IF;
  ELSIF p_aksi IN ('reject', 'revision') THEN
    v_next_status := CASE WHEN p_aksi = 'revision' THEN 'Draft' ELSE 'Rejected' END;
  ELSE
    RAISE EXCEPTION 'Aksi tidak valid: %', p_aksi;
  END IF;

  -- 4. EKSEKUSI ATOMIK: Insert audit log ke t_approval_bantuan
  INSERT INTO public.t_approval_bantuan (id_ajuan, approver_id, role_approver, aksi, catatan)
  VALUES (p_id_ajuan, v_user_id, v_user_role, p_aksi, p_catatan);

  -- 5. EKSEKUSI ATOMIK: Update status pengajuan
  UPDATE public.t_pengajuan_bantuan 
  SET status = v_next_status, updated_at = NOW() 
  WHERE id_ajuan = p_id_ajuan;

  -- 6. EKSEKUSI ATOMIK: Catat di log aktivitas jika tabel t_log_aktivitas ada
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 't_log_aktivitas') THEN
    INSERT INTO public.t_log_aktivitas (id_log, id_user, waktu, aktor, aksi, objek_type, objek_id, keterangan)
    VALUES (
      'LOG-' || public.gen_random_uuid()::text,
      v_user_id,
      NOW(),
      v_aktor,
      UPPER(p_aksi),
      'bantuan',
      p_id_ajuan,
      p_aksi || ': ' || p_catatan
    );
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Restrict exposure: Revoke from PUBLIC and anon, grant only to authenticated
REVOKE EXECUTE ON FUNCTION process_pengajuan_bantuan(VARCHAR, VARCHAR, TEXT, VARCHAR) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION process_pengajuan_bantuan(VARCHAR, VARCHAR, TEXT, VARCHAR) FROM anon;
GRANT EXECUTE ON FUNCTION process_pengajuan_bantuan(VARCHAR, VARCHAR, TEXT, VARCHAR) TO authenticated;
