-- Migration: 20260805_fix_aset_rls.sql
-- Description: Fix Row Level Security (RLS) policies for t_aset_tanah, t_aset_bangunan, t_aset_bergerak, and t_lampiran_aset tables to allow CRUD operations.

BEGIN;

-- 1. Setup RLS policies for t_aset_tanah
ALTER TABLE t_aset_tanah ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_aset_tanah" ON t_aset_tanah;
DROP POLICY IF EXISTS "Allow insert for t_aset_tanah" ON t_aset_tanah;
DROP POLICY IF EXISTS "Allow update for t_aset_tanah" ON t_aset_tanah;
DROP POLICY IF EXISTS "Allow delete for t_aset_tanah" ON t_aset_tanah;

CREATE POLICY "Allow read for t_aset_tanah" ON t_aset_tanah FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_aset_tanah" ON t_aset_tanah FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_aset_tanah" ON t_aset_tanah FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_aset_tanah" ON t_aset_tanah FOR DELETE USING (true);

-- 2. Setup RLS policies for t_aset_bangunan
ALTER TABLE t_aset_bangunan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_aset_bangunan" ON t_aset_bangunan;
DROP POLICY IF EXISTS "Allow insert for t_aset_bangunan" ON t_aset_bangunan;
DROP POLICY IF EXISTS "Allow update for t_aset_bangunan" ON t_aset_bangunan;
DROP POLICY IF EXISTS "Allow delete for t_aset_bangunan" ON t_aset_bangunan;

CREATE POLICY "Allow read for t_aset_bangunan" ON t_aset_bangunan FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_aset_bangunan" ON t_aset_bangunan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_aset_bangunan" ON t_aset_bangunan FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_aset_bangunan" ON t_aset_bangunan FOR DELETE USING (true);

-- 3. Setup RLS policies for t_aset_bergerak
ALTER TABLE t_aset_bergerak ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_aset_bergerak" ON t_aset_bergerak;
DROP POLICY IF EXISTS "Allow insert for t_aset_bergerak" ON t_aset_bergerak;
DROP POLICY IF EXISTS "Allow update for t_aset_bergerak" ON t_aset_bergerak;
DROP POLICY IF EXISTS "Allow delete for t_aset_bergerak" ON t_aset_bergerak;

CREATE POLICY "Allow read for t_aset_bergerak" ON t_aset_bergerak FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_aset_bergerak" ON t_aset_bergerak FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_aset_bergerak" ON t_aset_bergerak FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_aset_bergerak" ON t_aset_bergerak FOR DELETE USING (true);

-- 4. Setup RLS policies for t_lampiran_aset
ALTER TABLE t_lampiran_aset ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_lampiran_aset" ON t_lampiran_aset;
DROP POLICY IF EXISTS "Allow insert for t_lampiran_aset" ON t_lampiran_aset;
DROP POLICY IF EXISTS "Allow update for t_lampiran_aset" ON t_lampiran_aset;
DROP POLICY IF EXISTS "Allow delete for t_lampiran_aset" ON t_lampiran_aset;

CREATE POLICY "Allow read for t_lampiran_aset" ON t_lampiran_aset FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_lampiran_aset" ON t_lampiran_aset FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_lampiran_aset" ON t_lampiran_aset FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_lampiran_aset" ON t_lampiran_aset FOR DELETE USING (true);

COMMIT;
