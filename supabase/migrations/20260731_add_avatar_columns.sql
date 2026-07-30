-- Migration: 20260731_add_avatar_columns.sql
-- Description: Add avatar_url, foto_url, nama_lengkap, no_hp columns & complete RLS policies for users & m_pendeta

BEGIN;

-- 1. Tambah kolom penyimpan foto profil & kontak
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(150),
  ADD COLUMN IF NOT EXISTS no_hp VARCHAR(30),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS foto_url TEXT;

ALTER TABLE public.m_pendeta 
  ADD COLUMN IF NOT EXISTS foto_url TEXT,
  ADD COLUMN IF NOT EXISTS email VARCHAR(150);

-- 2. Kebijakan RLS SELECT (Izin MEMBACA Profil Pengguna - Publik/Autentikasi)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view profile policy" ON public.users;
DROP POLICY IF EXISTS "Enable read access for users table" ON public.users;

CREATE POLICY "Enable read access for users table"
ON public.users FOR SELECT
USING (true);

-- 3. Kebijakan RLS UPDATE (Izin MENGUBAH Profil Sendiri / Super User)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can update their own profile"
ON public.users FOR ALL
USING (
  id = auth.uid() 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
)
WITH CHECK (
  id = auth.uid() 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
);

-- 4. Kebijakan RLS m_pendeta SELECT & UPDATE
DROP POLICY IF EXISTS "Enable read access for m_pendeta table" ON public.m_pendeta;
CREATE POLICY "Enable read access for m_pendeta table"
ON public.m_pendeta FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Pendeta can update their own profile" ON public.m_pendeta;
CREATE POLICY "Pendeta can update their own profile"
ON public.m_pendeta FOR ALL
USING (
  id_pendeta IN (SELECT id_pendeta FROM public.users WHERE id = auth.uid())
  OR (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
)
WITH CHECK (
  id_pendeta IN (SELECT id_pendeta FROM public.users WHERE id = auth.uid())
  OR (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
);

COMMIT;
