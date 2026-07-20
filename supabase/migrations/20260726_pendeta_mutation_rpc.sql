-- Migration: Atomic mutation & KMJ assignment RPC functions for Pendeta
-- File: 20260726_pendeta_mutation_rpc.sql

-- 1. Fungsi Mutasi Pendeta (Atomic Lintas Mupel / Jemaat)
CREATE OR REPLACE FUNCTION mutasi_pendeta(
  p_id_pendeta VARCHAR,
  p_id_induk_baru VARCHAR,
  p_alasan TEXT
) RETURNS VOID AS $$
DECLARE
  v_old_id_induk VARCHAR;
  v_is_kmj BOOLEAN;
  v_is_pj BOOLEAN;
  v_id_riwayat VARCHAR;
BEGIN
  -- Ambil data lama
  SELECT id_induk, is_kmj, is_pj INTO v_old_id_induk, v_is_kmj, v_is_pj
  FROM m_pendeta WHERE id_pendeta = p_id_pendeta;

  IF v_old_id_induk IS NULL THEN
    RAISE EXCEPTION 'Pendeta dengan ID % tidak ditemukan', p_id_pendeta;
  END IF;

  IF v_old_id_induk = p_id_induk_baru THEN
    RAISE EXCEPTION 'Jemaat Induk tujuan tidak boleh sama dengan Jemaat Induk asal';
  END IF;

  -- Generate ID Riwayat unik dengan pola MUT-{timestamp}-{random}
  v_id_riwayat := 'MUT-' || floor(extract(epoch from now()))::text || '-' || floor(random() * 1000)::text;

  -- 1. Insert ke riwayat mutasi
  INSERT INTO t_riwayat_mutasi_pendeta (id_riwayat, id_pendeta, id_induk_lama, id_induk_baru, tgl_mutasi, jenis_mutasi, alasan)
  VALUES (v_id_riwayat, p_id_pendeta, v_old_id_induk, p_id_induk_baru, CURRENT_DATE, 'MUTASI', p_alasan);

  -- 2. Reset flag KMJ/PJ di jemaat lama (mencegah hantu data visual)
  UPDATE m_pendeta SET is_kmj = FALSE, is_pj = FALSE WHERE id_pendeta = p_id_pendeta;

  -- Reset id_kmj di jemaat lama jika pendeta ini adalah KMJ-nya
  UPDATE m_jemaat_induk SET id_kmj = NULL WHERE id_induk = v_old_id_induk AND id_kmj = p_id_pendeta;

  -- 3. Tutup penugasan PJ lama di t_pj_jemaat (jika ada)
  UPDATE t_pj_jemaat 
  SET tanggal_selesai = CURRENT_DATE, status = 'Selesai'
  WHERE id_pendeta = p_id_pendeta AND (tanggal_selesai IS NULL OR status = 'Aktif');

  -- 4. Tutup penugasan ke Pos Pelkes lama di t_penugasan_pendeta (jika ada)
  UPDATE t_penugasan_pendeta 
  SET tgl_selesai = CURRENT_DATE, status_tugas = 'Selesai'
  WHERE id_pendeta = p_id_pendeta AND (tgl_selesai IS NULL OR status_tugas = 'Aktif');

  -- 5. Update jemaat induk pendeta ke jemaat tujuan
  UPDATE m_pendeta 
  SET id_induk = p_id_induk_baru, updated_at = NOW() 
  WHERE id_pendeta = p_id_pendeta;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Fungsi Set KMJ (Atomic - Mendukung Promosi PJ -> KMJ & Lintas Mupel/Jemaat)
CREATE OR REPLACE FUNCTION set_kmj(
  p_id_induk VARCHAR,
  p_id_pendeta VARCHAR
) RETURNS VOID AS $$
DECLARE
  v_old_kmj VARCHAR;
  v_old_id_induk VARCHAR;
  v_id_riwayat VARCHAR;
BEGIN
  -- Ambil data jemaat induk lama pendeta
  SELECT id_induk INTO v_old_id_induk FROM m_pendeta WHERE id_pendeta = p_id_pendeta;

  -- Reset KMJ lama di jemaat tujuan jika ada
  SELECT id_kmj INTO v_old_kmj FROM m_jemaat_induk WHERE id_induk = p_id_induk;
  IF v_old_kmj IS NOT NULL AND v_old_kmj <> p_id_pendeta THEN
    UPDATE m_pendeta SET is_kmj = FALSE WHERE id_pendeta = v_old_kmj;
  END IF;

  -- Jika pendeta ini sebelumnya KMJ di jemaat asal, kosongkan id_kmj jemaat asal
  IF v_old_id_induk IS NOT NULL AND v_old_id_induk <> p_id_induk THEN
    UPDATE m_jemaat_induk SET id_kmj = NULL WHERE id_induk = v_old_id_induk AND id_kmj = p_id_pendeta;
  END IF;

  -- Tutup penugasan PJ lama jika sebelumnya pendeta ini bertugas sebagai PJ
  UPDATE t_pj_jemaat 
  SET tanggal_selesai = CURRENT_DATE, status = 'Selesai'
  WHERE id_pendeta = p_id_pendeta AND (tanggal_selesai IS NULL OR status = 'Aktif');

  UPDATE t_penugasan_pendeta 
  SET tgl_selesai = CURRENT_DATE, status_tugas = 'Selesai'
  WHERE id_pendeta = p_id_pendeta AND (tgl_selesai IS NULL OR status_tugas = 'Aktif');

  -- Set KMJ baru pada m_jemaat_induk dan m_pendeta
  UPDATE m_jemaat_induk SET id_kmj = p_id_pendeta, updated_at = NOW() WHERE id_induk = p_id_induk;
  UPDATE m_pendeta SET is_kmj = TRUE, is_pj = FALSE, id_induk = p_id_induk, updated_at = NOW() WHERE id_pendeta = p_id_pendeta;
  
  -- Generate ID Riwayat unik dengan pola MUT-{timestamp}-{random}
  v_id_riwayat := 'MUT-' || floor(extract(epoch from now()))::text || '-' || floor(random() * 1000)::text;

  -- Catat ke riwayat mutasi
  INSERT INTO t_riwayat_mutasi_pendeta (id_riwayat, id_pendeta, id_induk_lama, id_induk_baru, tgl_mutasi, jenis_mutasi, alasan)
  VALUES (v_id_riwayat, p_id_pendeta, COALESCE(v_old_id_induk, p_id_induk), p_id_induk, CURRENT_DATE, 'PENGANGKATAN_KMJ', 'Penetapan sebagai Ketua Majelis Jemaat (KMJ)');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Fungsi Assign PJ (Atomic - Mendukung Mutasi KMJ -> PJ & Lintas Mupel/Jemaat)
CREATE OR REPLACE FUNCTION assign_pj(
  p_id_induk VARCHAR,
  p_id_pendeta VARCHAR
) RETURNS VOID AS $$
DECLARE
  v_old_id_induk VARCHAR;
  v_id_riwayat VARCHAR;
BEGIN
  -- Ambil data jemaat induk lama pendeta
  SELECT id_induk INTO v_old_id_induk FROM m_pendeta WHERE id_pendeta = p_id_pendeta;

  -- Jika pendeta ini sebelumnya KMJ di jemaat asal, kosongkan id_kmj jemaat asal
  IF v_old_id_induk IS NOT NULL THEN
    UPDATE m_jemaat_induk SET id_kmj = NULL WHERE id_induk = v_old_id_induk AND id_kmj = p_id_pendeta;
  END IF;

  -- Tutup penugasan PJ lama jika ada
  UPDATE t_pj_jemaat 
  SET tanggal_selesai = CURRENT_DATE, status = 'Selesai'
  WHERE id_pendeta = p_id_pendeta AND (tanggal_selesai IS NULL OR status = 'Aktif');

  -- Buat penugasan PJ baru di jemaat tujuan
  INSERT INTO t_pj_jemaat (id_induk, id_pendeta, tanggal_mulai, status)
  VALUES (p_id_induk, p_id_pendeta, CURRENT_DATE, 'Aktif');

  -- Set status pendeta sebagai PJ
  UPDATE m_pendeta SET is_pj = TRUE, is_kmj = FALSE, id_induk = p_id_induk, updated_at = NOW() WHERE id_pendeta = p_id_pendeta;

  -- Generate ID Riwayat unik dengan pola MUT-{timestamp}-{random}
  v_id_riwayat := 'MUT-' || floor(extract(epoch from now()))::text || '-' || floor(random() * 1000)::text;

  -- Catat ke riwayat mutasi
  INSERT INTO t_riwayat_mutasi_pendeta (id_riwayat, id_pendeta, id_induk_lama, id_induk_baru, tgl_mutasi, jenis_mutasi, alasan)
  VALUES (v_id_riwayat, p_id_pendeta, COALESCE(v_old_id_induk, p_id_induk), p_id_induk, CURRENT_DATE, 'PENGANGKATAN_PJ', 'Penetapan sebagai Pendeta Jemaat (PJ)');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
