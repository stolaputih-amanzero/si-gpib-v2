-- Migration: 20260803_fix_demografi_rls.sql
-- Description: Fix Row Level Security (RLS) policies for t_demografi_pelkat and m_pos_pelkes tables to allow CRUD operations.

BEGIN;

-- 1. Setup RLS policies for t_demografi_pelkat
ALTER TABLE t_demografi_pelkat ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_demografi_pelkat" ON t_demografi_pelkat;
DROP POLICY IF EXISTS "Allow insert for t_demografi_pelkat" ON t_demografi_pelkat;
DROP POLICY IF EXISTS "Allow update for t_demografi_pelkat" ON t_demografi_pelkat;
DROP POLICY IF EXISTS "Allow delete for t_demografi_pelkat" ON t_demografi_pelkat;

CREATE POLICY "Allow read for t_demografi_pelkat"
ON t_demografi_pelkat FOR SELECT
USING (true);

CREATE POLICY "Allow insert for t_demografi_pelkat"
ON t_demografi_pelkat FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update for t_demografi_pelkat"
ON t_demografi_pelkat FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete for t_demografi_pelkat"
ON t_demografi_pelkat FOR DELETE
USING (true);

-- 2. Setup RLS policies for m_pos_pelkes (supporting auto-create for Jemaat scope)
ALTER TABLE m_pos_pelkes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert for m_pos_pelkes" ON m_pos_pelkes;
DROP POLICY IF EXISTS "Allow update for m_pos_pelkes" ON m_pos_pelkes;

CREATE POLICY "Allow insert for m_pos_pelkes"
ON m_pos_pelkes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update for m_pos_pelkes"
ON m_pos_pelkes FOR UPDATE
USING (true)
WITH CHECK (true);

COMMIT;
