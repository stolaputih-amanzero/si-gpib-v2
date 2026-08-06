-- ============================================================
-- Migration: 20260831_bantuan_rls_policies.sql
-- Tujuan: Implementasi RLS untuk t_pengajuan_bantuan & t_approval_bantuan
-- Referensi: EIA v0.1.1 §6.2 (Permission × State), rules.md §Security
-- ============================================================

-- ============================================================
-- BAGIAN 1: SCHEMA MIGRATION (Kolom tambahan untuk Workflow)
-- ============================================================
ALTER TABLE t_pengajuan_bantuan
  ADD COLUMN IF NOT EXISTS diajukan_oleh UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS deskripsi TEXT,
  ADD COLUMN IF NOT EXISTS estimasi_biaya DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS tgl_diajukan TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tgl_review_kmj TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS catatan_kmj TEXT,
  ADD COLUMN IF NOT EXISTS tgl_review_mupel TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS catatan_mupel TEXT,
  ADD COLUMN IF NOT EXISTS tgl_keputusan_sinode TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS catatan_sinode TEXT;

-- ============================================================
-- BAGIAN 2: t_pengajuan_bantuan RLS
-- ============================================================

-- Aktifkan RLS (jika belum)
ALTER TABLE t_pengajuan_bantuan ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama yang mungkin ada (untuk idempotency)
DROP POLICY IF EXISTS "Super User full access bantuan" ON t_pengajuan_bantuan;
DROP POLICY IF EXISTS "Admin Mupel akses bantuan di Mupel-nya" ON t_pengajuan_bantuan;
DROP POLICY IF EXISTS "KMJ akses bantuan di Jemaat-nya" ON t_pengajuan_bantuan;
DROP POLICY IF EXISTS "PJ/User akses pengajuan sendiri" ON t_pengajuan_bantuan;
DROP POLICY IF EXISTS "PJ/User buat pengajuan di Pos tugas" ON t_pengajuan_bantuan;
DROP POLICY IF EXISTS "PJ/User update pengajuan sendiri" ON t_pengajuan_bantuan;
DROP POLICY IF EXISTS "PJ/User hapus pengajuan sendiri" ON t_pengajuan_bantuan;

-- Policy 1: Super User — full access
CREATE POLICY "Super User full access bantuan"
ON t_pengajuan_bantuan FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'super_user'
  )
);

-- Policy 2: Admin Mupel — lihat & approve pengajuan di Mupel-nya
-- Scope: Pos → Jemaat → Mupel (via users.id_mupel)
CREATE POLICY "Admin Mupel akses bantuan di Mupel-nya"
ON t_pengajuan_bantuan FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN m_pos_pelkes p ON p.id_induk IN (
      SELECT id_induk FROM m_jemaat_induk WHERE id_mupel = u.id_mupel
    )
    WHERE u.id = auth.uid() 
      AND u.role = 'admin_mupel'
      AND p.id_pos = t_pengajuan_bantuan.id_pos
  )
);

-- Policy 3: KMJ — lihat pengajuan di Jemaat yang dipimpinnya
-- Scope: Pos → Jemaat (via users.id_induk)
CREATE POLICY "KMJ akses bantuan di Jemaat-nya"
ON t_pengajuan_bantuan FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN m_pos_pelkes p ON p.id_induk = u.id_induk
    WHERE u.id = auth.uid() 
      AND u.role = 'kmj'
      AND p.id_pos = t_pengajuan_bantuan.id_pos
  )
);

-- Policy 4: PJ/User — lihat pengajuan yang mereka buat
CREATE POLICY "PJ/User akses pengajuan sendiri"
ON t_pengajuan_bantuan FOR SELECT
TO authenticated
USING (
  diajukan_oleh = auth.uid()
);

-- Policy 5: PJ/User — buat pengajuan baru (INSERT)
-- Hanya untuk Pos yang mereka tugaskan (via users.id_pos)
CREATE POLICY "PJ/User buat pengajuan di Pos tugas"
ON t_pengajuan_bantuan FOR INSERT
TO authenticated
WITH CHECK (
  diajukan_oleh = auth.uid()
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
      AND u.id_pos = t_pengajuan_bantuan.id_pos
  )
);

-- Policy 6: PJ/User — update pengajuan milik sendiri
-- Catatan: validasi "hanya Draft yang bisa diupdate" dilakukan di application layer
CREATE POLICY "PJ/User update pengajuan sendiri"
ON t_pengajuan_bantuan FOR UPDATE
TO authenticated
USING (
  diajukan_oleh = auth.uid()
)
WITH CHECK (
  diajukan_oleh = auth.uid()
);

-- Policy 7: PJ/User — hapus pengajuan milik sendiri
-- Catatan: validasi "hanya Draft yang bisa dihapus" dilakukan di application layer
CREATE POLICY "PJ/User hapus pengajuan sendiri"
ON t_pengajuan_bantuan FOR DELETE
TO authenticated
USING (
  diajukan_oleh = auth.uid()
);

-- ============================================================
-- BAGIAN 2: t_approval_bantuan
-- ============================================================

ALTER TABLE t_approval_bantuan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super User full access approval" ON t_approval_bantuan;
DROP POLICY IF EXISTS "Admin Mupel akses approval di Mupel-nya" ON t_approval_bantuan;
DROP POLICY IF EXISTS "KMJ akses approval di Jemaat-nya" ON t_approval_bantuan;
DROP POLICY IF EXISTS "Pemohon lihat approval pengajuannya" ON t_approval_bantuan;
DROP POLICY IF EXISTS "Reviewer insert approval" ON t_approval_bantuan;

-- Policy 1: Super User — full access
CREATE POLICY "Super User full access approval"
ON t_approval_bantuan FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'super_user'
  )
);

-- Policy 2: Admin Mupel — lihat approval untuk pengajuan di Mupel-nya
CREATE POLICY "Admin Mupel akses approval di Mupel-nya"
ON t_approval_bantuan FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM t_pengajuan_bantuan pb
    JOIN users u ON u.id = auth.uid()
    JOIN m_pos_pelkes p ON p.id_induk IN (
      SELECT id_induk FROM m_jemaat_induk WHERE id_mupel = u.id_mupel
    )
    WHERE pb.id_ajuan = t_approval_bantuan.id_ajuan
      AND p.id_pos = pb.id_pos
      AND u.role = 'admin_mupel'
  )
);

-- Policy 3: KMJ — lihat approval untuk pengajuan di Jemaat-nya
CREATE POLICY "KMJ akses approval di Jemaat-nya"
ON t_approval_bantuan FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM t_pengajuan_bantuan pb
    JOIN users u ON u.id = auth.uid()
    JOIN m_pos_pelkes p ON p.id_induk = u.id_induk
    WHERE pb.id_ajuan = t_approval_bantuan.id_ajuan
      AND p.id_pos = pb.id_pos
      AND u.role = 'kmj'
  )
);

-- Policy 4: Pemohon — lihat approval untuk pengajuannya sendiri
CREATE POLICY "Pemohon lihat approval pengajuannya"
ON t_approval_bantuan FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM t_pengajuan_bantuan pb
    WHERE pb.id_ajuan = t_approval_bantuan.id_ajuan
      AND pb.diajukan_oleh = auth.uid()
  )
);

-- Policy 5: Reviewer — insert approval
-- Validasi role & status dilakukan di application layer (service)
-- RLS hanya memastikan user yang authenticated bisa insert
CREATE POLICY "Reviewer insert approval"
ON t_approval_bantuan FOR INSERT
TO authenticated
WITH CHECK (
  approver_id = auth.uid()
);

-- ============================================================
-- BAGIAN 3: Index untuk performa RLS subqueries
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_pengajuan_bantuan_id_pos 
  ON t_pengajuan_bantuan(id_pos);
CREATE INDEX IF NOT EXISTS idx_pengajuan_bantuan_diajukan_oleh 
  ON t_pengajuan_bantuan(diajukan_oleh);
CREATE INDEX IF NOT EXISTS idx_approval_bantuan_id_ajuan 
  ON t_approval_bantuan(id_ajuan);
