-- Migration: 20260825_fix_histori_status_rls_policies.sql
-- Description: Allow SELECT, INSERT, UPDATE, DELETE policies on t_histori_perubahan_status for all authenticated users and super users

BEGIN;

ALTER TABLE public.t_histori_perubahan_status ENABLE ROW LEVEL SECURITY;

-- Allow read access
DROP POLICY IF EXISTS "Allow read access to t_histori_perubahan_status" ON public.t_histori_perubahan_status;
CREATE POLICY "Allow read access to t_histori_perubahan_status"
  ON public.t_histori_perubahan_status FOR SELECT
  USING (true);

-- Allow write/delete access for authenticated users
DROP POLICY IF EXISTS "Allow write/delete for authenticated users on t_histori_perubahan_status" ON public.t_histori_perubahan_status;
CREATE POLICY "Allow write/delete for authenticated users on t_histori_perubahan_status"
  ON public.t_histori_perubahan_status FOR ALL
  USING (true)
  WITH CHECK (true);

COMMIT;
