-- Migration: 20260814_fix_jadwal_relawan_pelayan_rls.sql
-- Description: Fix Row Level Security (RLS) policies for t_jadwal_ibadah, t_relawan, and t_pelayan tables to allow CRUD operations.

BEGIN;

-- 1. Setup RLS policies for t_jadwal_ibadah
ALTER TABLE t_jadwal_ibadah ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_jadwal_ibadah" ON t_jadwal_ibadah;
DROP POLICY IF EXISTS "Allow insert for t_jadwal_ibadah" ON t_jadwal_ibadah;
DROP POLICY IF EXISTS "Allow update for t_jadwal_ibadah" ON t_jadwal_ibadah;
DROP POLICY IF EXISTS "Allow delete for t_jadwal_ibadah" ON t_jadwal_ibadah;

CREATE POLICY "Allow read for t_jadwal_ibadah" ON t_jadwal_ibadah FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_jadwal_ibadah" ON t_jadwal_ibadah FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_jadwal_ibadah" ON t_jadwal_ibadah FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_jadwal_ibadah" ON t_jadwal_ibadah FOR DELETE USING (true);

-- 2. Setup RLS policies for t_relawan
ALTER TABLE t_relawan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_relawan" ON t_relawan;
DROP POLICY IF EXISTS "Allow insert for t_relawan" ON t_relawan;
DROP POLICY IF EXISTS "Allow update for t_relawan" ON t_relawan;
DROP POLICY IF EXISTS "Allow delete for t_relawan" ON t_relawan;

CREATE POLICY "Allow read for t_relawan" ON t_relawan FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_relawan" ON t_relawan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_relawan" ON t_relawan FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_relawan" ON t_relawan FOR DELETE USING (true);

-- 3. Setup RLS policies for t_pelayan
ALTER TABLE t_pelayan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_pelayan" ON t_pelayan;
DROP POLICY IF EXISTS "Allow insert for t_pelayan" ON t_pelayan;
DROP POLICY IF EXISTS "Allow update for t_pelayan" ON t_pelayan;
DROP POLICY IF EXISTS "Allow delete for t_pelayan" ON t_pelayan;

CREATE POLICY "Allow read for t_pelayan" ON t_pelayan FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_pelayan" ON t_pelayan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_pelayan" ON t_pelayan FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_pelayan" ON t_pelayan FOR DELETE USING (true);

COMMIT;
