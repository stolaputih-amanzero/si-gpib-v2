-- Migration: 20260809_fix_wilayah_rls.sql
-- Description: Fix RLS policies for t_kerawanan_wilayah and t_potensi_wilayah tables

BEGIN;

-- 1. Setup RLS policies for t_kerawanan_wilayah
ALTER TABLE t_kerawanan_wilayah ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_kerawanan_wilayah" ON t_kerawanan_wilayah;
DROP POLICY IF EXISTS "Allow insert for t_kerawanan_wilayah" ON t_kerawanan_wilayah;
DROP POLICY IF EXISTS "Allow update for t_kerawanan_wilayah" ON t_kerawanan_wilayah;
DROP POLICY IF EXISTS "Allow delete for t_kerawanan_wilayah" ON t_kerawanan_wilayah;

CREATE POLICY "Allow read for t_kerawanan_wilayah" ON t_kerawanan_wilayah FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_kerawanan_wilayah" ON t_kerawanan_wilayah FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_kerawanan_wilayah" ON t_kerawanan_wilayah FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_kerawanan_wilayah" ON t_kerawanan_wilayah FOR DELETE USING (true);

-- 2. Setup RLS policies for t_potensi_wilayah
ALTER TABLE t_potensi_wilayah ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_potensi_wilayah" ON t_potensi_wilayah;
DROP POLICY IF EXISTS "Allow insert for t_potensi_wilayah" ON t_potensi_wilayah;
DROP POLICY IF EXISTS "Allow update for t_potensi_wilayah" ON t_potensi_wilayah;
DROP POLICY IF EXISTS "Allow delete for t_potensi_wilayah" ON t_potensi_wilayah;

CREATE POLICY "Allow read for t_potensi_wilayah" ON t_potensi_wilayah FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_potensi_wilayah" ON t_potensi_wilayah FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_potensi_wilayah" ON t_potensi_wilayah FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_potensi_wilayah" ON t_potensi_wilayah FOR DELETE USING (true);

COMMIT;
