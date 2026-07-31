-- Migration: 20260824_add_jemaat_ke_and_catatan_to_elevation.sql
-- Description: Add jemaat_ke & catatan to t_histori_perubahan_status and m_jemaat_induk, update process_status_elevation RPC

BEGIN;

-- 1. Tambah kolom jemaat_ke & catatan pada t_histori_perubahan_status jika belum ada
ALTER TABLE public.t_histori_perubahan_status
ADD COLUMN IF NOT EXISTS jemaat_ke INTEGER,
ADD COLUMN IF NOT EXISTS catatan TEXT;

-- 2. Tambah kolom jemaat_ke pada m_jemaat_induk jika belum ada
ALTER TABLE public.m_jemaat_induk
ADD COLUMN IF NOT EXISTS jemaat_ke INTEGER;

-- 3. Perbarui RPC process_status_elevation dengan parameter p_jemaat_ke & p_catatan
CREATE OR REPLACE FUNCTION process_status_elevation(
  p_id_pos VARCHAR,
  p_target_status VARCHAR, -- 'BAJEM' atau 'JEMAAT_INDUK'
  p_tanggal_perubahan DATE,
  p_keterangan TEXT,
  p_id_induk_baru VARCHAR DEFAULT NULL,
  p_nama_induk_baru VARCHAR DEFAULT NULL,
  p_id_mupel_baru VARCHAR DEFAULT NULL,
  p_jemaat_ke INTEGER DEFAULT NULL,
  p_catatan TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_status_lama VARCHAR;
  v_id_induk_lama VARCHAR;
  v_id_mupel VARCHAR;
  v_nama_pos VARCHAR;
  v_alamat TEXT;
  v_lat NUMERIC;
  v_lng NUMERIC;
  v_histori_id VARCHAR;
BEGIN
  -- Ambil data pos saat ini beserta alamat dan koordinat GPS
  SELECT COALESCE(kategori, 'Pos Pelkes'), id_induk, nama_pos, alamat, latitude, longitude 
  INTO v_status_lama, v_id_induk_lama, v_nama_pos, v_alamat, v_lat, v_lng
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
      id_histori, id_pos, status_lama, status_baru, tanggal_perubahan, keterangan_perubahan, jemaat_ke, catatan, diubah_oleh
    ) VALUES (
      v_histori_id, p_id_pos, v_status_lama, 'Bajem', p_tanggal_perubahan, p_keterangan, p_jemaat_ke, p_catatan, auth.uid()
    );

  ELSIF p_target_status = 'JEMAAT_INDUK' THEN
    IF p_id_induk_baru IS NULL OR p_nama_induk_baru IS NULL THEN
      RAISE EXCEPTION 'ID dan Nama Jemaat Induk baru wajib diisi untuk elevasi ke Jemaat Induk';
    END IF;

    -- 1. Buat Record Jemaat Induk Mandiri Baru (warisi alamat, lat, lng & jemaat_ke)
    INSERT INTO m_jemaat_induk (
      id_induk, id_mupel, nama_induk, alamat, latitude, longitude, jemaat_ke, keterangan, created_at, updated_at
    ) VALUES (
      p_id_induk_baru, v_id_mupel, p_nama_induk_baru, v_alamat, COALESCE(v_lat, 0), COALESCE(v_lng, 0), p_jemaat_ke,
      'Ditingkatkan dari ' || v_status_lama || ' (' || v_nama_pos || '). SK/Ket: ' || p_keterangan,
      NOW(), NOW()
    ) ON CONFLICT (id_induk) DO UPDATE SET 
      nama_induk = EXCLUDED.nama_induk,
      id_mupel = EXCLUDED.id_mupel,
      jemaat_ke = COALESCE(EXCLUDED.jemaat_ke, m_jemaat_induk.jemaat_ke),
      alamat = COALESCE(EXCLUDED.alamat, m_jemaat_induk.alamat),
      latitude = COALESCE(EXCLUDED.latitude, m_jemaat_induk.latitude),
      longitude = COALESCE(EXCLUDED.longitude, m_jemaat_induk.longitude),
      updated_at = NOW();

    -- 2. Update Pos Pelkes agar mengarah ke Jemaat Induk baru ini
    UPDATE m_pos_pelkes 
    SET id_induk = p_id_induk_baru,
        kategori = 'Bajem',
        updated_at = NOW() 
    WHERE id_pos = p_id_pos;

    -- 3. Catat log histori
    INSERT INTO t_histori_perubahan_status (
      id_histori, id_pos, id_induk_baru, status_lama, status_baru, tanggal_perubahan, keterangan_perubahan, jemaat_ke, catatan, diubah_oleh
    ) VALUES (
      v_histori_id, p_id_pos, p_id_induk_baru, v_status_lama, 'Jemaat Induk', p_tanggal_perubahan, p_keterangan, p_jemaat_ke, p_catatan, auth.uid()
    );

  ELSE
    RAISE EXCEPTION 'Target status tidak valid: %', p_target_status;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
