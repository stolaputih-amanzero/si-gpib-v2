-- supabase/migrations/20260902_pastoral_rls_kmj.sql

-- Pastikan RLS diaktifkan
ALTER TABLE t_log_pastoral ENABLE ROW LEVEL SECURITY;

-- KMJ bisa membaca log pastoral dari Pos di jemaatnya
DROP POLICY IF EXISTS "kmj_read_log_pastoral" ON t_log_pastoral;
CREATE POLICY "kmj_read_log_pastoral"
ON t_log_pastoral FOR SELECT TO authenticated
USING (
  id_pos IN (
    SELECT p.id_pos 
    FROM m_pos_pelkes p
    JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
    WHERE j.id_kmj = (
      SELECT id_pendeta FROM users WHERE id = auth.uid()
    )
  )
);
