-- Migration: 20260823_update_ekklesia_jemaat_id.sql
-- Description: Update Jemaat Induk Ekklesia (Nanga Silat, Mupel Kalbar) ID from 25-01-EK to 20-25-EK

BEGIN;

-- 1. Insert/Update m_jemaat_induk record with new ID 20-25-EK
INSERT INTO public.m_jemaat_induk (
  id_induk, id_mupel, nama_induk, alamat, latitude, longitude, keterangan, id_kmj, jumlah_sektor, jumlah_kk, jumlah_jiwa, created_at, updated_at
)
SELECT 
  '20-25-EK', id_mupel, nama_induk, alamat, latitude, longitude, keterangan, id_kmj, jumlah_sektor, jumlah_kk, jumlah_jiwa, created_at, NOW()
FROM public.m_jemaat_induk
WHERE id_induk = '25-01-EK'
ON CONFLICT (id_induk) DO UPDATE SET 
  id_mupel = EXCLUDED.id_mupel,
  nama_induk = EXCLUDED.nama_induk,
  updated_at = NOW();

-- 2. Update foreign keys in dependent tables
UPDATE public.m_pos_pelkes SET id_induk = '20-25-EK' WHERE id_induk = '25-01-EK';
UPDATE public.m_pendeta SET id_induk = '20-25-EK' WHERE id_induk = '25-01-EK';
UPDATE public.users SET id_induk = '20-25-EK' WHERE id_induk = '25-01-EK';
UPDATE public.t_histori_perubahan_status SET id_induk_baru = '20-25-EK' WHERE id_induk_baru = '25-01-EK';

-- 3. Delete old Jemaat Induk record
DELETE FROM public.m_jemaat_induk WHERE id_induk = '25-01-EK';

COMMIT;
