-- Migration: 20260830_fix_t_log_pastoral_rls.sql
-- Description: Enable public/authenticated select RLS policy on t_log_pastoral table

BEGIN;

-- Enable RLS if not enabled
ALTER TABLE public.t_log_pastoral ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Select t_log_pastoral" ON public.t_log_pastoral;
DROP POLICY IF EXISTS "Authenticated Select t_log_pastoral" ON public.t_log_pastoral;

CREATE POLICY "Public Select t_log_pastoral"
ON public.t_log_pastoral FOR SELECT
USING (true);

COMMIT;
