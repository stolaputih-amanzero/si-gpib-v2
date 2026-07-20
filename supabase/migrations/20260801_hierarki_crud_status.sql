-- Migration: 20260801_hierarki_crud_status.sql
-- Description: Table t_histori_perubahan_status & Atomic RPC process_status_elevation for SI GPIB v2.2

-- 1. Tambah kolom kategori di m_pos_pelkes jika belum ada
ALTER TABLE m_pos_pelkes 
ADD COLUMN IF NOT EXISTS kategori VARCHAR(50) DEFAULT 'Pos Pelkes' CHECK (kategori IN ('Pos Pelkes', 'Bajem'));

-- 2. Buat tabel histori perubahan status
CREATE TABLE IF NOT EXISTS t_histori_perubahan_status (
    id_histori VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos) ON DELETE CASCADE,
    id_induk_baru VARCHAR(20) REFERENCES m_jemaat_induk(id_induk),
    status_lama VARCHAR(50) NOT NULL,
    status_baru VARCHAR(50) NOT NULL,
    tanggal_perubahan DATE NOT NULL,
    keterangan_perubahan TEXT NOT NULL,
    diubah_oleh UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for t_histori_perubahan_status
ALTER TABLE t_histori_perubahan_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for t_histori_perubahan_status" ON t_histori_perubahan_status FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert t_histori_perubahan_status" ON t_histori_perubahan_status FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update t_histori_perubahan_status" ON t_histori_perubahan_status FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. Atomic RPC untuk Peningkatan Status (Pos Pelkes -> Bajem -> Jemaat Induk)
CREATE OR REPLACE FUNCTION process_status_elevation(
  p_id_pos VARCHAR,
  p_target_status VARCHAR, -- 'BAJEM' atau 'JEMAAT_INDUK'
  p_tanggal_perubahan DATE,
  p_keterangan TEXT,
  p_id_induk_baru VARCHAR DEFAULT NULL,
  p_nama_induk_baru VARCHAR DEFAULT NULL,
  p_id_mupel_baru VARCHAR DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_status_lama VARCHAR;
  v_id_induk_lama VARCHAR;
  v_id_mupel VARCHAR;
  v_nama_pos VARCHAR;
  v_histori_id VARCHAR;
BEGIN
  -- Ambil data pos saat ini
  SELECT COALESCE(kategori, 'Pos Pelkes'), id_induk, nama_pos 
  INTO v_status_lama, v_id_induk_lama, v_nama_pos
  FROM m_pos_pelkes WHERE id_pos = p_id_pos;
  
  IF v_status_lama IS NULL THEN
    RAISE EXCEPTION 'Pos Pelkes dengan ID % tidak ditemukan', p_id_pos;
  END IF;

  -- Ambil id_mupel dari jemaat induk pengampu
  SELECT id_mupel INTO v_id_mupel FROM m_jemaat_induk WHERE id_induk = v_id_induk_lama;

  IF p_id_mupel_baru IS NOT NULL THEN
    v_id_mupel := p_id_mupel_baru;
  END IF;

  v_histori_id := 'HIS-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || FLOOR(RANDOM() * 1000)::TEXT;

  IF p_target_status = 'BAJEM' THEN
    -- Update Pos menjadi Bajem
    UPDATE m_pos_pelkes 
    SET kategori = 'Bajem', 
        updated_at = NOW() 
    WHERE id_pos = p_id_pos;
    
    -- Catat log histori
    INSERT INTO t_histori_perubahan_status (
      id_histori, id_pos, status_lama, status_baru, tanggal_perubahan, keterangan_perubahan, diubah_oleh
    ) VALUES (
      v_histori_id, p_id_pos, v_status_lama, 'Bajem', p_tanggal_perubahan, p_keterangan, auth.uid()
    );

  ELSIF p_target_status = 'JEMAAT_INDUK' THEN
    IF p_id_induk_baru IS NULL OR p_nama_induk_baru IS NULL THEN
      RAISE EXCEPTION 'ID dan Nama Jemaat Induk baru wajib diisi untuk elevasi ke Jemaat Induk';
    END IF;

    -- 1. Buat Record Jemaat Induk Mandiri Baru
    INSERT INTO m_jemaat_induk (
      id_induk, id_mupel, nama_induk, keterangan, created_at, updated_at
    ) VALUES (
      p_id_induk_baru, v_id_mupel, p_nama_induk_baru, 
      'Ditingkatkan dari ' || v_status_lama || ' (' || v_nama_pos || '). SK/Ket: ' || p_keterangan,
      NOW(), NOW()
    ) ON CONFLICT (id_induk) DO UPDATE SET 
      nama_induk = EXCLUDED.nama_induk,
      id_mupel = EXCLUDED.id_mupel,
      updated_at = NOW();

    -- 2. Update Pos Pelkes agar mengarah ke Jemaat Induk baru ini
    UPDATE m_pos_pelkes 
    SET id_induk = p_id_induk_baru,
        kategori = 'Bajem',
        updated_at = NOW() 
    WHERE id_pos = p_id_pos;

    -- 3. Catat log histori
    INSERT INTO t_histori_perubahan_status (
      id_histori, id_pos, id_induk_baru, status_lama, status_baru, tanggal_perubahan, keterangan_perubahan, diubah_oleh
    ) VALUES (
      v_histori_id, p_id_pos, p_id_induk_baru, v_status_lama, 'Jemaat Induk', p_tanggal_perubahan, p_keterangan, auth.uid()
    );

  ELSE
    RAISE EXCEPTION 'Target status tidak valid: %', p_target_status;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
