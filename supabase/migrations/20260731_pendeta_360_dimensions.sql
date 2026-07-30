-- Migration: 3 Dimensi Baru Profile 360° (Keluarga, Kompetensi & Karunia, Keterlibatan Sinodal)
-- RPC & RLS Security Hardening for SI GPIB v2.2

-- 1. TABEL t_keluarga_pendeta
CREATE TABLE IF NOT EXISTS t_keluarga_pendeta (
  id_keluarga   VARCHAR(20) PRIMARY KEY,
  id_pendeta    VARCHAR(20) NOT NULL REFERENCES m_pendeta(id_pendeta) ON DELETE CASCADE,
  hubungan      VARCHAR(20) NOT NULL,      -- Suami|Istri|Anak|Orang Tua|Mertua|Lainnya
  nama_lengkap  VARCHAR(150) NOT NULL,
  gender        VARCHAR(10),
  tgl_lahir     DATE,
  no_wa         VARCHAR(20),
  pendidikan    VARCHAR(100),
  pekerjaan     VARCHAR(100),
  status_hidup  VARCHAR(20) DEFAULT 'Hidup',  -- Hidup|Meninggal
  is_tanggungan BOOLEAN DEFAULT FALSE,
  keterangan    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keluarga_pendeta ON t_keluarga_pendeta(id_pendeta);

-- 2. TABEL t_kompetensi_pendeta
CREATE TABLE IF NOT EXISTS t_kompetensi_pendeta (
  id_kompetensi   VARCHAR(20) PRIMARY KEY,
  id_pendeta      VARCHAR(20) NOT NULL REFERENCES m_pendeta(id_pendeta) ON DELETE CASCADE,
  kategori        VARCHAR(50) NOT NULL,   -- Pertanian|Perkebunan|Perikanan|Peternakan|Manajemen|Keuangan|Pendidikan|Kesehatan|Teknologi|Musik|Seni|Bahasa|Lainnya
  nama_kompetensi VARCHAR(150) NOT NULL,
  jenis           VARCHAR(20) DEFAULT 'Kompetensi',  -- Kompetensi|Passion|Karunia
  tingkat         VARCHAR(20),            -- Pemula|Menengah|Mahir|Ahli
  tahun_mulai     INT,
  keterangan      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kompetensi_pendeta ON t_kompetensi_pendeta(id_pendeta);
CREATE INDEX IF NOT EXISTS idx_kompetensi_kategori ON t_kompetensi_pendeta(kategori);

-- 3. TABEL t_keterlibatan_pendeta
CREATE TABLE IF NOT EXISTS t_keterlibatan_pendeta (
  id_keterlibatan VARCHAR(20) PRIMARY KEY,
  id_pendeta      VARCHAR(20) NOT NULL REFERENCES m_pendeta(id_pendeta) ON DELETE CASCADE,
  tingkat         VARCHAR(20) NOT NULL,   -- Jemaat|Mupel|Sinodal|Eksternal
  id_mupel        VARCHAR(20) REFERENCES m_mupel(id_mupel),  -- nullable, isi jika tingkat=Mupel
  jenis           VARCHAR(50) NOT NULL,   -- Panitia|Pokja|Komisi|Tim Kerja|Delegasi|Pengurus|Lainnya
  nama_kegiatan   VARCHAR(200) NOT NULL,
  jabatan         VARCHAR(100),           -- Ketua|Sekretaris|Bendahara|Koordinator|Anggota|Peserta
  tgl_mulai       DATE,
  tgl_selesai     DATE,                   -- NULL = aktif
  status          VARCHAR(20) DEFAULT 'Aktif',  -- Aktif|Selesai
  keterangan      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keterlibatan_pendeta ON t_keterlibatan_pendeta(id_pendeta);
CREATE INDEX IF NOT EXISTS idx_keterlibatan_tingkat ON t_keterlibatan_pendeta(tingkat);
CREATE INDEX IF NOT EXISTS idx_keterlibatan_aktif ON t_keterlibatan_pendeta(id_pendeta, status) WHERE tgl_selesai IS NULL;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES

-- 4a. RLS t_keluarga_pendeta: Privat (Diri Sendiri + Super User SAJA, KMJ/Admin Mupel TIDAK BOLEH)
ALTER TABLE t_keluarga_pendeta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "keluarga_privat_policy" ON t_keluarga_pendeta;
CREATE POLICY "keluarga_privat_policy" ON t_keluarga_pendeta
FOR ALL
USING (
  (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.role IN ('super_user', 'superadmin', 'sinode')
      OR users.id_pendeta = t_keluarga_pendeta.id_pendeta
    )
  )
)
WITH CHECK (
  (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.role IN ('super_user', 'superadmin', 'sinode')
      OR users.id_pendeta = t_keluarga_pendeta.id_pendeta
    )
  )
);

-- 4b. RLS t_kompetensi_pendeta: Diri sendiri + Super User + Admin Mupel
ALTER TABLE t_kompetensi_pendeta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kompetensi_policy" ON t_kompetensi_pendeta;
CREATE POLICY "kompetensi_policy" ON t_kompetensi_pendeta
FOR ALL
USING (
  (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.role IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
      OR users.id_pendeta = t_kompetensi_pendeta.id_pendeta
    )
  )
)
WITH CHECK (
  (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.role IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
      OR users.id_pendeta = t_kompetensi_pendeta.id_pendeta
    )
  )
);

-- 4c. RLS t_keterlibatan_pendeta: Diri sendiri + Super User + Admin Mupel
ALTER TABLE t_keterlibatan_pendeta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "keterlibatan_policy" ON t_keterlibatan_pendeta;
CREATE POLICY "keterlibatan_policy" ON t_keterlibatan_pendeta
FOR ALL
USING (
  (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.role IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
      OR users.id_pendeta = t_keterlibatan_pendeta.id_pendeta
    )
  )
)
WITH CHECK (
  (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.role IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
      OR users.id_pendeta = t_keterlibatan_pendeta.id_pendeta
    )
  )
);

-- 5. GRANTS TO authenticated
GRANT ALL ON t_keluarga_pendeta TO authenticated;
GRANT ALL ON t_kompetensi_pendeta TO authenticated;
GRANT ALL ON t_keterlibatan_pendeta TO authenticated;
