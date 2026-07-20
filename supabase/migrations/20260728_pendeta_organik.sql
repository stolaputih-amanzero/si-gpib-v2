-- Tambah kolom untuk membedakan Organik vs Non-Organik
ALTER TABLE m_pendeta 
ADD COLUMN IF NOT EXISTS jenis_pendeta VARCHAR(20) DEFAULT 'Organik' 
  CHECK (jenis_pendeta IN ('Organik', 'Non-Organik')),
ADD COLUMN IF NOT EXISTS tgl_mulai_kontrak DATE,
ADD COLUMN IF NOT EXISTS tgl_akhir_kontrak DATE,
ADD COLUMN IF NOT EXISTS sumber_pembiayaan VARCHAR(100),
ADD COLUMN IF NOT EXISTS eligible_rotasi BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS gereja_asal VARCHAR(150); -- Untuk Non-Organik yang berafiliasi dengan gereja lain

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_pendeta_jenis ON m_pendeta(jenis_pendeta);
CREATE INDEX IF NOT EXISTS idx_pendeta_kontrak ON m_pendeta(tgl_akhir_kontrak) 
  WHERE jenis_pendeta = 'Non-Organik' AND tgl_akhir_kontrak IS NOT NULL;

-- Asumsi: Data existing dari GPIB.xlsx adalah Pendeta Organik. 
-- Admin dapat mengubahnya secara manual jika diperlukan.
UPDATE m_pendeta SET jenis_pendeta = 'Organik' WHERE jenis_pendeta IS NULL;

-- Tabel untuk mencatat jabatan struktural di luar Jemaat
CREATE TABLE IF NOT EXISTS t_jabatan_struktural (
    id_jabatan VARCHAR(30) PRIMARY KEY, -- Format: JBT-{timestamp}-{random}
    id_pendeta VARCHAR(20) NOT NULL REFERENCES m_pendeta(id_pendeta) ON DELETE CASCADE,
    
    -- Kategori Jabatan
    kategori VARCHAR(50) NOT NULL CHECK (kategori IN (
        'BP Mupel', 
        'Kepanitiaan Sinode', 
        'Kepanitiaan Mupel', 
        'Kepanitiaan Jemaat',
        'Unit Misioner', 
        'Pokja', 
        'Lainnya'
    )),
    
    -- Nama Jabatan Spesifik
    nama_jabatan VARCHAR(100) NOT NULL,
    
    -- Tingkat Organisasi
    tingkat VARCHAR(20) NOT NULL CHECK (tingkat IN ('Sinode', 'Mupel', 'Jemaat')),
    
    -- Periode Jabatan
    tgl_mulai DATE NOT NULL DEFAULT CURRENT_DATE,
    tgl_selesai DATE,
    
    -- Legalitas
    no_sk VARCHAR(100),
    tgl_sk DATE,
    
    -- Status & Keterangan
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Selesai', 'Nonaktif')),
    keterangan TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_jabatan_pendeta ON t_jabatan_struktural(id_pendeta);
CREATE INDEX IF NOT EXISTS idx_jabatan_aktif ON t_jabatan_struktural(id_pendeta, kategori) 
  WHERE status = 'Aktif';
CREATE INDEX IF NOT EXISTS idx_jabatan_kategori ON t_jabatan_struktural(kategori, tingkat);

-- RLS Policies
ALTER TABLE t_jabatan_struktural ENABLE ROW LEVEL SECURITY;

-- 1. SEMUA user terautentikasi boleh MELIHAT (Read) jabatan struktural 
-- (Transparansi internal organisasi gereja)
CREATE POLICY "Authenticated users can view structural positions"
ON t_jabatan_struktural FOR SELECT
TO authenticated
USING (true);

-- 2. SUPER USER boleh mengelola (CRUD) SEMUA jabatan struktural
CREATE POLICY "Super User can manage all structural positions"
ON t_jabatan_struktural FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'super_user'
    )
);

-- 3. ADMIN MUPEL hanya boleh mengelola (CRUD) jabatan struktural 
-- untuk pendeta yang terdaftar di Jemaat within Mupel mereka
CREATE POLICY "Admin Mupel can manage structural positions in their Mupel"
ON t_jabatan_struktural FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u
        JOIN m_pendeta p ON p.id_pendeta = t_jabatan_struktural.id_pendeta
        JOIN m_jemaat_induk j ON j.id_induk = p.id_induk
        WHERE u.id = auth.uid() 
        AND u.role = 'admin_mupel'
        AND j.id_mupel = u.id_mupel
    )
);
