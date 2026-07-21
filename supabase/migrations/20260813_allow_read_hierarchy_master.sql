-- Migration: 20260813_allow_read_hierarchy_master.sql
-- Description: Allow read/select access for m_mupel, m_jemaat_induk, and m_pos_pelkes to resolve empty data on lists

BEGIN;

-- 1. Allow read for m_mupel
DROP POLICY IF EXISTS "Allow read for m_mupel" ON m_mupel;
CREATE POLICY "Allow read for m_mupel" ON m_mupel FOR SELECT USING (true);

-- 2. Allow read for m_jemaat_induk
DROP POLICY IF EXISTS "Allow read for m_jemaat_induk" ON m_jemaat_induk;
CREATE POLICY "Allow read for m_jemaat_induk" ON m_jemaat_induk FOR SELECT USING (true);

-- 3. Allow read for m_pos_pelkes
DROP POLICY IF EXISTS "Allow read for m_pos_pelkes" ON m_pos_pelkes;
CREATE POLICY "Allow read for m_pos_pelkes" ON m_pos_pelkes FOR SELECT USING (true);

-- Also ensure INSERT/UPDATE/DELETE policies exist for m_jemaat_induk and m_mupel for administration
DROP POLICY IF EXISTS "Allow insert for m_jemaat_induk" ON m_jemaat_induk;
CREATE POLICY "Allow insert for m_jemaat_induk" ON m_jemaat_induk FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for m_jemaat_induk" ON m_jemaat_induk;
CREATE POLICY "Allow update for m_jemaat_induk" ON m_jemaat_induk FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for m_jemaat_induk" ON m_jemaat_induk;
CREATE POLICY "Allow delete for m_jemaat_induk" ON m_jemaat_induk FOR DELETE USING (true);


DROP POLICY IF EXISTS "Allow insert for m_mupel" ON m_mupel;
CREATE POLICY "Allow insert for m_mupel" ON m_mupel FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for m_mupel" ON m_mupel;
CREATE POLICY "Allow update for m_mupel" ON m_mupel FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for m_mupel" ON m_mupel;
CREATE POLICY "Allow delete for m_mupel" ON m_mupel FOR DELETE USING (true);

COMMIT;
