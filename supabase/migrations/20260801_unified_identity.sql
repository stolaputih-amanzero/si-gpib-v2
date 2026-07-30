-- Migration: 20260801_unified_identity.sql
-- Description: Arsitektur Identitas Terpadu — id_pendeta sebagai Pusat yang Sinkron (Hardened & Data Minimized Edition)

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. INDEX UNIQUE PARTIAL & FK AKUN USER
-- -----------------------------------------------------------------------------
-- 1 pendeta = max 1 akun aktif
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_pendeta_aktif 
ON public.users(id_pendeta) 
WHERE id_pendeta IS NOT NULL;

-- FK users.id_pendeta -> m_pendeta(id_pendeta) ON DELETE SET NULL (Idempotent Drop-Then-Add)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_pendeta_fkey;
ALTER TABLE public.users ADD CONSTRAINT users_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 2. VERIFIKASI & PEMBARUAN FK 11 TABEL TERKAIT (IDEMPOTENT DROP-THEN-ADD)
-- -----------------------------------------------------------------------------

-- A. Tabel Histori Pelayanan & Sejarah (ON DELETE RESTRICT / SET NULL)
ALTER TABLE public.t_pj_jemaat DROP CONSTRAINT IF EXISTS t_pj_jemaat_id_pendeta_fkey;
ALTER TABLE public.t_pj_jemaat ADD CONSTRAINT t_pj_jemaat_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE RESTRICT;

ALTER TABLE public.t_penugasan_pendeta DROP CONSTRAINT IF EXISTS t_penugasan_pendeta_id_pendeta_fkey;
ALTER TABLE public.t_penugasan_pendeta ADD CONSTRAINT t_penugasan_pendeta_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE RESTRICT;

ALTER TABLE public.t_riwayat_mutasi_pendeta DROP CONSTRAINT IF EXISTS t_riwayat_mutasi_pendeta_id_pendeta_fkey;
ALTER TABLE public.t_riwayat_mutasi_pendeta ADD CONSTRAINT t_riwayat_mutasi_pendeta_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE RESTRICT;

ALTER TABLE public.t_log_pastoral DROP CONSTRAINT IF EXISTS t_log_pastoral_id_pendeta_fkey;
ALTER TABLE public.t_log_pastoral ADD CONSTRAINT t_log_pastoral_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE RESTRICT;

ALTER TABLE public.t_jabatan_struktural DROP CONSTRAINT IF EXISTS t_jabatan_struktural_id_pendeta_fkey;
ALTER TABLE public.t_jabatan_struktural ADD CONSTRAINT t_jabatan_struktural_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE RESTRICT;

ALTER TABLE public.m_jemaat_induk DROP CONSTRAINT IF EXISTS fk_jemaat_kmj;
ALTER TABLE public.m_jemaat_induk ADD CONSTRAINT fk_jemaat_kmj 
  FOREIGN KEY (id_kmj) REFERENCES public.m_pendeta(id_pendeta) ON DELETE SET NULL;

-- B. Tabel Data Personal 360° (ON DELETE CASCADE)
ALTER TABLE public.t_keluarga_pendeta DROP CONSTRAINT IF EXISTS t_keluarga_pendeta_id_pendeta_fkey;
ALTER TABLE public.t_keluarga_pendeta ADD CONSTRAINT t_keluarga_pendeta_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE CASCADE;

ALTER TABLE public.t_kompetensi_pendeta DROP CONSTRAINT IF EXISTS t_kompetensi_pendeta_id_pendeta_fkey;
ALTER TABLE public.t_kompetensi_pendeta ADD CONSTRAINT t_kompetensi_pendeta_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE CASCADE;

ALTER TABLE public.t_keterlibatan_pendeta DROP CONSTRAINT IF EXISTS t_keterlibatan_pendeta_id_pendeta_fkey;
ALTER TABLE public.t_keterlibatan_pendeta ADD CONSTRAINT t_keterlibatan_pendeta_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE CASCADE;

-- -----------------------------------------------------------------------------
-- 3. TRIGGERS SINKRONISASI AUTOMATIS (EKSPLISIT CASE MAPPING)
-- -----------------------------------------------------------------------------

-- Trigger A: Sinkronisasi Status Pendeta -> Status User Akun
CREATE OR REPLACE FUNCTION public.fn_sync_pendeta_status_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    UPDATE public.users
    SET status = CASE 
                   WHEN NEW.status IN ('Aktif', 'Active') THEN 'Aktif' 
                   ELSE 'Nonaktif' 
                 END,
        updated_at = NOW()
    WHERE id_pendeta = NEW.id_pendeta;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_pendeta_status_to_user ON public.m_pendeta;
CREATE TRIGGER trg_sync_pendeta_status_to_user
  AFTER UPDATE OF status ON public.m_pendeta
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_sync_pendeta_status_to_user();

-- Trigger B: Deaktivasi Akun Sebelum Pendeta Dihapus
CREATE OR REPLACE FUNCTION public.fn_on_pendeta_deleted_deactivate_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET status = 'Nonaktif',
      updated_at = NOW()
  WHERE id_pendeta = OLD.id_pendeta;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_pendeta_deleted_deactivate_user ON public.m_pendeta;
CREATE TRIGGER trg_on_pendeta_deleted_deactivate_user
  BEFORE DELETE ON public.m_pendeta
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_on_pendeta_deleted_deactivate_user();

-- -----------------------------------------------------------------------------
-- 4. RPC UNIFIED: link_user_to_pendeta & get_pendeta_360 (DATA MINIMIZATION EDITION)
-- -----------------------------------------------------------------------------

-- RPC 1: link_user_to_pendeta
CREATE OR REPLACE FUNCTION public.link_user_to_pendeta(
  p_user_id UUID,
  p_id_pendeta VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role VARCHAR;
  v_exists_pendeta BOOLEAN;
  v_linked_user UUID;
BEGIN
  v_caller_role := auth.jwt() ->> 'role';
  
  -- Role guard: hanya super_user, admin_mupel, atau user yang mengaitkan dirinya sendiri
  IF v_caller_role NOT IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
     AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden: anda tidak memiliki wewenang mengaitkan akun ini';
  END IF;

  -- 1. Validasi keberadaan Pendeta
  SELECT EXISTS(SELECT 1 FROM public.m_pendeta WHERE id_pendeta = p_id_pendeta) INTO v_exists_pendeta;
  IF NOT v_exists_pendeta THEN
    RAISE EXCEPTION 'Pendeta dengan ID % tidak ditemukan', p_id_pendeta;
  END IF;

  -- 2. Validasi keunikan akun (1 pendeta max 1 user aktif)
  SELECT id INTO v_linked_user 
  FROM public.users 
  WHERE id_pendeta = p_id_pendeta AND id <> p_user_id;

  IF v_linked_user IS NOT NULL THEN
    RAISE EXCEPTION 'Pendeta % sudah terhubung ke akun user lain', p_id_pendeta;
  END IF;

  -- 3. Update pengaitan user
  UPDATE public.users
  SET id_pendeta = p_id_pendeta,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'id_pendeta', p_id_pendeta,
    'message', 'Berhasil mengaitkan user ke pendeta'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_user_to_pendeta(UUID, VARCHAR) TO authenticated;

-- RPC 2: get_pendeta_360 (Data Minimization & Anti-Enumeration Edition)
CREATE OR REPLACE FUNCTION public.get_pendeta_360(p_id_pendeta VARCHAR)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id       UUID;
  v_caller_pendeta  VARCHAR;
  v_caller_role     VARCHAR;
  v_caller_mupel   VARCHAR;
  v_target_mupel   VARCHAR;
  v_can_keluarga   BOOLEAN := FALSE;
  v_result          JSONB;
  v_pendeta_data    JSONB;
  v_user_data       JSONB;
  v_hierarki_data   JSONB;
  v_jabatan_data    JSONB;
  v_kompetensi_data JSONB;
  v_keterlibatan_data JSONB;
  v_keluarga_data   JSONB := '[]'::jsonb;
BEGIN
  v_caller_id := auth.uid();
  
  -- Real-time lookup pemanggil dari public.users
  SELECT role, id_pendeta, id_mupel 
  INTO v_caller_role, v_caller_pendeta, v_caller_mupel
  FROM public.users
  WHERE id = v_caller_id;

  IF v_caller_role IS NULL THEN
    v_caller_role := auth.jwt() ->> 'role';
  END IF;

  -- Target validation & lookup mupel pendeta target (real-time join ke m_jemaat_induk)
  SELECT ji.id_mupel INTO v_target_mupel
  FROM public.m_pendeta p
  LEFT JOIN public.m_jemaat_induk ji ON ji.id_induk = p.id_induk
  WHERE p.id_pendeta = p_id_pendeta;

  -- Anti-enumeration check
  IF NOT EXISTS (SELECT 1 FROM public.m_pendeta WHERE id_pendeta = p_id_pendeta) THEN
    RAISE EXCEPTION 'forbidden: anda tidak memiliki hak akses ke profil pendeta ini';
  END IF;

  -- 🔴 GUARD BERTINGKAT & SCOPE VALIDATION (DEFAULT DENY)
  IF v_caller_role IN ('super_user', 'superadmin', 'sinode') THEN
    v_can_keluarga := TRUE;                       -- Super User: Akses penuh (termasuk keluarga)
  ELSIF v_caller_pendeta IS NOT NULL AND v_caller_pendeta = p_id_pendeta THEN
    v_can_keluarga := TRUE;                       -- Pemilik Data: Akses penuh (termasuk keluarga)
  ELSIF v_caller_role = 'admin_mupel' 
        AND v_caller_mupel IS NOT NULL 
        AND v_target_mupel IS NOT NULL
        AND v_caller_mupel = v_target_mupel THEN
    v_can_keluarga := FALSE;                      -- Admin Mupel Se-Scope: Akses non-keluarga
  ELSE
    RAISE EXCEPTION 'forbidden: anda tidak memiliki hak akses ke profil pendeta ini'; -- Default Deny (termasuk Admin Mupel lintas Mupel & target mupel NULL)
  END IF;

  -- 1. Master Pendeta
  SELECT to_jsonb(p.*) INTO v_pendeta_data
  FROM public.m_pendeta p
  WHERE p.id_pendeta = p_id_pendeta;

  -- 2. User account (Data Minimization: omit biometric & last_login_at untuk Admin Mupel)
  IF v_caller_role = 'admin_mupel' AND (v_caller_pendeta IS NULL OR v_caller_pendeta <> p_id_pendeta) THEN
    SELECT jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'no_telepon', u.no_telepon,
      'role', u.role,
      'status', u.status
    ) INTO v_user_data
    FROM public.users u
    WHERE u.id_pendeta = p_id_pendeta;
  ELSE
    SELECT jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'no_telepon', u.no_telepon,
      'role', u.role,
      'status', u.status,
      'biometric_enabled', u.biometric_enabled,
      'last_login_at', u.last_login_at
    ) INTO v_user_data
    FROM public.users u
    WHERE u.id_pendeta = p_id_pendeta;
  END IF;

  -- 3. Hierarki
  SELECT jsonb_build_object(
    'id_induk', j.id_induk,
    'nama_induk', j.nama_induk,
    'id_mupel', m.id_mupel,
    'nama_mupel', m.nama_mupel
  ) INTO v_hierarki_data
  FROM public.m_jemaat_induk j
  LEFT JOIN public.m_mupel m ON m.id_mupel = j.id_mupel
  WHERE j.id_induk = (v_pendeta_data ->> 'id_induk');

  -- 4. Jabatan Struktural
  SELECT COALESCE(jsonb_agg(to_jsonb(js)), '[]'::jsonb) INTO v_jabatan_data
  FROM public.t_jabatan_struktural js
  WHERE js.id_pendeta = p_id_pendeta;

  -- 5. Kompetensi & Karunia
  SELECT COALESCE(jsonb_agg(to_jsonb(kp)), '[]'::jsonb) INTO v_kompetensi_data
  FROM public.t_kompetensi_pendeta kp
  WHERE kp.id_pendeta = p_id_pendeta;

  -- 6. Keterlibatan Sinodal/Mupel/Jemaat
  SELECT COALESCE(jsonb_agg(to_jsonb(kt)), '[]'::jsonb) INTO v_keterlibatan_data
  FROM public.t_keterlibatan_pendeta kt
  WHERE kt.id_pendeta = p_id_pendeta;

  -- 7. 🔴 KELUARGA: HANYA jika v_can_keluarga = TRUE (Pemilik Data / Super User)
  IF v_can_keluarga THEN
    SELECT COALESCE(jsonb_agg(to_jsonb(k)), '[]'::jsonb) INTO v_keluarga_data
    FROM public.t_keluarga_pendeta k
    WHERE k.id_pendeta = p_id_pendeta;
  END IF;

  v_result := jsonb_build_object(
    'pendeta', v_pendeta_data,
    'user', v_user_data,
    'hierarki', v_hierarki_data,
    'jabatan', v_jabatan_data,
    'kompetensi', v_kompetensi_data,
    'keterlibatan', v_keterlibatan_data,
    'keluarga', v_keluarga_data
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_pendeta_360(VARCHAR) TO authenticated;

-- -----------------------------------------------------------------------------
-- 5. AUDIT & KONSISTENSI RLS POLICIES (REAL-TIME LOOKUP)
-- -----------------------------------------------------------------------------

-- Policy m_pendeta: Update hanya pemilik atau super_user
DROP POLICY IF EXISTS "Pendeta can update their own profile" ON public.m_pendeta;
CREATE POLICY "Pendeta can update their own profile"
ON public.m_pendeta FOR ALL
USING (
  id_pendeta IN (SELECT id_pendeta FROM public.users WHERE id = auth.uid())
  OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('super_user', 'superadmin', 'sinode')
)
WITH CHECK (
  id_pendeta IN (SELECT id_pendeta FROM public.users WHERE id = auth.uid())
  OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('super_user', 'superadmin', 'sinode')
);

-- Policy t_keluarga_pendeta: Real-time lookup (Pemilik + Super User SAJA)
ALTER TABLE public.t_keluarga_pendeta ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "keluarga_privat_policy" ON public.t_keluarga_pendeta;
CREATE POLICY "keluarga_privat_policy" ON public.t_keluarga_pendeta
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (
      u.role IN ('super_user', 'superadmin', 'sinode')
      OR u.id_pendeta = t_keluarga_pendeta.id_pendeta
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (
      u.role IN ('super_user', 'superadmin', 'sinode')
      OR u.id_pendeta = t_keluarga_pendeta.id_pendeta
    )
  )
);

-- Policy t_kompetensi_pendeta: Real-time lookup (Pemilik + Super User + Admin Mupel Se-Scope)
ALTER TABLE public.t_kompetensi_pendeta ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kompetensi_policy" ON public.t_kompetensi_pendeta;
CREATE POLICY "kompetensi_policy" ON public.t_kompetensi_pendeta
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.m_pendeta p ON p.id_pendeta = t_kompetensi_pendeta.id_pendeta
    JOIN public.m_jemaat_induk j ON j.id_induk = p.id_induk
    WHERE u.id = auth.uid()
    AND (
      u.role IN ('super_user', 'superadmin', 'sinode')
      OR u.id_pendeta = t_kompetensi_pendeta.id_pendeta
      OR (u.role = 'admin_mupel' AND u.id_mupel = j.id_mupel)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.m_pendeta p ON p.id_pendeta = t_kompetensi_pendeta.id_pendeta
    JOIN public.m_jemaat_induk j ON j.id_induk = p.id_induk
    WHERE u.id = auth.uid()
    AND (
      u.role IN ('super_user', 'superadmin', 'sinode')
      OR u.id_pendeta = t_kompetensi_pendeta.id_pendeta
      OR (u.role = 'admin_mupel' AND u.id_mupel = j.id_mupel)
    )
  )
);

-- Policy t_keterlibatan_pendeta: Real-time lookup (Pemilik + Super User + Admin Mupel Se-Scope)
ALTER TABLE public.t_keterlibatan_pendeta ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "keterlibatan_policy" ON public.t_keterlibatan_pendeta;
CREATE POLICY "keterlibatan_policy" ON public.t_keterlibatan_pendeta
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.m_pendeta p ON p.id_pendeta = t_keterlibatan_pendeta.id_pendeta
    JOIN public.m_jemaat_induk j ON j.id_induk = p.id_induk
    WHERE u.id = auth.uid()
    AND (
      u.role IN ('super_user', 'superadmin', 'sinode')
      OR u.id_pendeta = t_keterlibatan_pendeta.id_pendeta
      OR (u.role = 'admin_mupel' AND u.id_mupel = j.id_mupel)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.m_pendeta p ON p.id_pendeta = t_keterlibatan_pendeta.id_pendeta
    JOIN public.m_jemaat_induk j ON j.id_induk = p.id_induk
    WHERE u.id = auth.uid()
    AND (
      u.role IN ('super_user', 'superadmin', 'sinode')
      OR u.id_pendeta = t_keterlibatan_pendeta.id_pendeta
      OR (u.role = 'admin_mupel' AND u.id_mupel = j.id_mupel)
    )
  )
);

COMMIT;
