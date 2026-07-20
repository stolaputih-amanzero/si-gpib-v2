-- Create RLS Policies for Pendeta and Assignment tables to allow public read access
-- Since these tables are used in the public frontend (Dashboard, Hierarki)

-- Enable RLS
ALTER TABLE m_pendeta ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_pj_jemaat ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_penugasan_pendeta ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access for m_pendeta" ON m_pendeta;
DROP POLICY IF EXISTS "Allow public read access for t_pj_jemaat" ON t_pj_jemaat;
DROP POLICY IF EXISTS "Allow public read access for t_penugasan_pendeta" ON t_penugasan_pendeta;

-- Create policies for public read access
CREATE POLICY "Allow public read access for m_pendeta" ON m_pendeta FOR SELECT USING (true);
CREATE POLICY "Allow public read access for t_pj_jemaat" ON t_pj_jemaat FOR SELECT USING (true);
CREATE POLICY "Allow public read access for t_penugasan_pendeta" ON t_penugasan_pendeta FOR SELECT USING (true);
