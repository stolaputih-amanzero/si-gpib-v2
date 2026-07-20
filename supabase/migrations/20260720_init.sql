-- Migration: 20260720_init.sql
-- Description: Initial schema for SI GPIB v2.2 (Mobile First PWA + Biometric)

BEGIN;

-- 1. Master Tables
CREATE TABLE m_mupel (
    id_mupel VARCHAR(20) PRIMARY KEY,
    nama_mupel VARCHAR(100) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: we need to delay m_jemaat_induk's id_kmj foreign key until m_pendeta exists
CREATE TABLE m_jemaat_induk (
    id_induk VARCHAR(20) PRIMARY KEY,
    id_mupel VARCHAR(20) REFERENCES m_mupel(id_mupel),
    nama_induk VARCHAR(150) NOT NULL,
    alamat TEXT,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    id_kmj VARCHAR(20) UNIQUE, -- FK added later
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE m_pos_pelkes (
    id_pos VARCHAR(20) PRIMARY KEY,
    id_induk VARCHAR(20) REFERENCES m_jemaat_induk(id_induk),
    nama_pos VARCHAR(150) NOT NULL,
    alamat TEXT,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    tgl_berdiri DATE,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE m_pendeta (
    id_pendeta VARCHAR(20) PRIMARY KEY,
    id_induk VARCHAR(20) REFERENCES m_jemaat_induk(id_induk),
    nama_lengkap VARCHAR(150) NOT NULL,
    no_wa VARCHAR(20),
    jabatan VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Aktif',
    tgl_lahir DATE,
    gender VARCHAR(10),
    tgl_tugas DATE,
    is_kmj BOOLEAN DEFAULT FALSE,
    is_pj BOOLEAN DEFAULT FALSE,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add the FK for id_kmj now that m_pendeta exists
ALTER TABLE m_jemaat_induk ADD CONSTRAINT fk_jemaat_kmj FOREIGN KEY (id_kmj) REFERENCES m_pendeta(id_pendeta);

-- 2. Auth & Security Tables
CREATE TABLE users (
    id UUID PRIMARY KEY, -- Matches auth.users
    no_telepon VARCHAR(20) UNIQUE,
    email VARCHAR(150) UNIQUE,
    password_hash TEXT,
    id_pendeta VARCHAR(20) REFERENCES m_pendeta(id_pendeta),
    id_mupel VARCHAR(20) REFERENCES m_mupel(id_mupel),
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Aktif',
    biometric_enabled BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE m_webauthn_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID REFERENCES users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    counter BIGINT DEFAULT 0,
    device_type VARCHAR(50),
    backed_up BOOLEAN DEFAULT FALSE,
    transports TEXT[],
    display_name VARCHAR(100),
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE m_push_subscription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. KMJ & PJ Assignment Tables
CREATE TABLE t_pj_jemaat (
    id SERIAL PRIMARY KEY,
    id_induk VARCHAR(20) REFERENCES m_jemaat_induk(id_induk) ON DELETE CASCADE,
    id_pendeta VARCHAR(20) REFERENCES m_pendeta(id_pendeta) ON DELETE CASCADE,
    tanggal_mulai DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_selesai DATE,
    status VARCHAR(20) DEFAULT 'Aktif',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Transaction Tables
CREATE TABLE t_penugasan_pendeta (
    id_tugas VARCHAR(30) PRIMARY KEY,
    id_pendeta VARCHAR(20) REFERENCES m_pendeta(id_pendeta),
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    tgl_mulai DATE NOT NULL,
    tgl_selesai DATE,
    status_tugas VARCHAR(20) DEFAULT 'Aktif',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_riwayat_mutasi_pendeta (
    id_riwayat VARCHAR(30) PRIMARY KEY,
    id_pendeta VARCHAR(20) REFERENCES m_pendeta(id_pendeta) ON DELETE CASCADE,
    id_induk_lama VARCHAR(20) REFERENCES m_jemaat_induk(id_induk),
    id_induk_baru VARCHAR(20) REFERENCES m_jemaat_induk(id_induk),
    tgl_mutasi DATE NOT NULL,
    jenis_mutasi VARCHAR(30) DEFAULT 'MUTASI',
    alasan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_log_pastoral (
    id_log VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    id_pendeta VARCHAR(20) REFERENCES m_pendeta(id_pendeta),
    tgl DATE NOT NULL,
    kegiatan VARCHAR(200) NOT NULL,
    jml_jiwa INT,
    catatan TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_pelayan (
    id_pelayan VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    nama VARCHAR(150) NOT NULL,
    no_wa VARCHAR(20),
    jabatan VARCHAR(100),
    tgl_lahir DATE,
    gender VARCHAR(10),
    status VARCHAR(50) DEFAULT 'Aktif',
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_jadwal_ibadah (
    id_ibadah VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    jenis VARCHAR(100) NOT NULL,
    hari VARCHAR(20) NOT NULL,
    jam TIME NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_relawan (
    id_relawan VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    nama VARCHAR(150) NOT NULL,
    no_wa VARCHAR(20),
    tgl_lahir DATE,
    gender VARCHAR(10),
    kategori VARCHAR(100),
    pelatihan VARCHAR(200),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_aset_tanah (
    id_tanah VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    luas_m2 DECIMAL(12,2),
    thn_perolehan INT,
    status_hukum VARCHAR(100),
    kondisi VARCHAR(50),
    potensi_sda VARCHAR(200),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_aset_bangunan (
    id_bangunan VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    fungsi VARCHAR(100),
    kondisi VARCHAR(50),
    thn_berdiri INT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_aset_bergerak (
    id_aset_b VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    jenis VARCHAR(100),
    merk_tipe VARCHAR(100),
    thn_perolehan INT,
    no_polisi VARCHAR(20),
    tgl_pajak DATE,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_lampiran_aset (
    id_lampiran VARCHAR(30) PRIMARY KEY,
    id_tanah VARCHAR(30) REFERENCES t_aset_tanah(id_tanah) ON DELETE CASCADE,
    id_bangunan VARCHAR(30) REFERENCES t_aset_bangunan(id_bangunan) ON DELETE CASCADE,
    id_aset_b VARCHAR(30) REFERENCES t_aset_bergerak(id_aset_b) ON DELETE CASCADE,
    nama_file VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    tipe_file VARCHAR(100),
    ukuran_file DECIMAL(10,2),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_pengajuan_bantuan (
    id_ajuan VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    jenis_bantuan VARCHAR(150) NOT NULL,
    id_tanah VARCHAR(30) REFERENCES t_aset_tanah(id_tanah) ON DELETE SET NULL,
    id_bangunan VARCHAR(30) REFERENCES t_aset_bangunan(id_bangunan) ON DELETE SET NULL,
    id_aset_b VARCHAR(30) REFERENCES t_aset_bergerak(id_aset_b) ON DELETE SET NULL,
    biaya DECIMAL(15,2),
    urgensi VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Draft',
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_demografi_pelkat (
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    kategori_pelkat VARCHAR(50),
    jml_kk INT,
    laki INT,
    perempuan INT,
    profesi VARCHAR(200),
    pendidikan VARCHAR(200),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id_pos, kategori_pelkat)
);

CREATE TABLE t_kerawanan_wilayah (
    id_risiko VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    kategori VARCHAR(100),
    jenis_risiko VARCHAR(150),
    frekuensi VARCHAR(50),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_potensi_wilayah (
    id_potensi VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    nama_potensi VARCHAR(150),
    kategori VARCHAR(100),
    deskripsi TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audit & Workflow Tables
CREATE TABLE t_log_aktivitas (
    id_log VARCHAR(50) PRIMARY KEY,
    id_user UUID REFERENCES users(id),
    waktu TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    aktor VARCHAR(50) NOT NULL,
    aksi VARCHAR(30) NOT NULL,
    objek_type VARCHAR(30),
    objek_id VARCHAR(30),
    keterangan TEXT
);

CREATE TABLE t_approval_bantuan (
    id SERIAL PRIMARY KEY,
    id_ajuan VARCHAR(30) REFERENCES t_pengajuan_bantuan(id_ajuan) ON DELETE CASCADE,
    approver_id UUID REFERENCES users(id),
    role_approver VARCHAR(20) NOT NULL,
    aksi VARCHAR(20) NOT NULL,
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_form_draft (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID REFERENCES users(id) ON DELETE CASCADE,
    form_type VARCHAR(30) NOT NULL,
    objek_id VARCHAR(30),
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 6. Indexes
CREATE UNIQUE INDEX idx_pj_aktif_unik ON t_pj_jemaat(id_induk, id_pendeta) WHERE tanggal_selesai IS NULL;
CREATE INDEX idx_pj_aktif ON t_pj_jemaat(id_induk) WHERE tanggal_selesai IS NULL;
CREATE INDEX idx_jemaat_induk_mupel ON m_jemaat_induk(id_mupel);
CREATE INDEX idx_jemaat_kmj ON m_jemaat_induk(id_kmj);
CREATE INDEX idx_pos_pelkes_induk ON m_pos_pelkes(id_induk);
CREATE INDEX idx_pendeta_induk ON m_pendeta(id_induk);
CREATE INDEX idx_webauthn_user ON m_webauthn_credentials(id_user);

-- 7. Functions
CREATE OR REPLACE FUNCTION mutasi_pendeta(
    p_id_pendeta VARCHAR,
    p_id_induk_baru VARCHAR,
    p_alasan TEXT
) RETURNS VOID AS $$
DECLARE
    v_id_induk_lama VARCHAR;
BEGIN
    SELECT id_induk INTO v_id_induk_lama FROM m_pendeta WHERE id_pendeta = p_id_pendeta;
    
    INSERT INTO t_riwayat_mutasi_pendeta(id_riwayat, id_pendeta, id_induk_lama, id_induk_baru, tgl_mutasi, jenis_mutasi, alasan)
    VALUES (gen_random_uuid()::text, p_id_pendeta, v_id_induk_lama, p_id_induk_baru, CURRENT_DATE, 'MUTASI', p_alasan);
    
    UPDATE m_pendeta
    SET id_induk = p_id_induk_baru, is_kmj = FALSE, is_pj = FALSE, updated_at = NOW()
    WHERE id_pendeta = p_id_pendeta;
    
    UPDATE t_pj_jemaat
    SET tanggal_selesai = CURRENT_DATE, status = 'Selesai'
    WHERE id_pendeta = p_id_pendeta AND tanggal_selesai IS NULL;
END;
$$ LANGUAGE plpgsql;

COMMIT;
