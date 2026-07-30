-- Migration: 20260731_add_avatar_columns.sql
-- Description: Add avatar_url, foto_url, nama_lengkap, no_hp columns & RLS update policies for users & m_pendeta

BEGIN;

-- 1. Add missing columns
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(150),
  ADD COLUMN IF NOT EXISTS no_hp VARCHAR(30),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS foto_url TEXT;

ALTER TABLE public.m_pendeta 
  ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 2. Add missing RLS policies allowing users to update their own profile
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

DROP POLICY IF EXISTS "Pendeta can update their own profile" ON public.m_pendeta;
CREATE POLICY "Pendeta can update their own profile"
ON public.m_pendeta FOR ALL
USING (
  id_pendeta IN (SELECT id_pendeta FROM public.users WHERE id = auth.uid())
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
)
WITH CHECK (
  id_pendeta IN (SELECT id_pendeta FROM public.users WHERE id = auth.uid())
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
);

COMMIT;
