export const KATEGORI_ASET = [
  { 
    kode: 'TANAH', 
    nama: 'Tanah', 
    deskripsi: 'Aset Tanah & Lahan Pos Pelkes',
    icon: '🌍',
    warna: '#F59E0B' // Amber/Gold
  },
  { 
    kode: 'BANGUNAN', 
    nama: 'Bangunan', 
    deskripsi: 'Gereja, Pastori & Gedung Serbaguna',
    icon: '🏢',
    warna: '#3B82F6' // Blue
  },
  { 
    kode: 'BERGERAK', 
    nama: 'Bergerak', 
    deskripsi: 'Kendaraan Dinas (Mobil/Motor) & Peralatan Utama',
    icon: '🚗',
    warna: '#EC4899' // Pink
  },
] as const;

export type KategoriAsetKode = typeof KATEGORI_ASET[number]['kode'];

export function getKategoriInfo(kode: string) {
  return KATEGORI_ASET.find(k => k.kode.toUpperCase() === kode.toUpperCase());
}

export const KONDISI_ASET_OPTIONS = [
  { value: 'Sangat Baik', label: 'Sangat Baik (100%)' },
  { value: 'Baik', label: 'Baik (80-99%)' },
  { value: 'Rusak Ringan', label: 'Rusak Ringan (60-79%)' },
  { value: 'Rusak Berat', label: 'Rusak Berat (< 60%)' },
] as const;

export const STATUS_HUKUM_TANAH_OPTIONS = [
  { value: 'Sertifikat Hak Milik (SHM)', label: 'Sertifikat Hak Milik (SHM) GPIB' },
  { value: 'Hak Guna Bangunan (HGB)', label: 'Hak Guna Bangunan (HGB)' },
  { value: 'Girik / Akta Jual Beli (AJB)', label: 'Girik / Akta Jual Beli (AJB)' },
  { value: 'Hibah / Adat', label: 'Tanah Hibah / Adat Masyarakat' },
  { value: 'Dalam Proses Sertifikasi', label: 'Dalam Proses Sertifikasi' },
  { value: 'Sewa / Pinjam Pakai', label: 'Sewa / Pinjam Pakai' },
] as const;
