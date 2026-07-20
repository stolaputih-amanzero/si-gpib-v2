export const KATEGORI_PELKAT = [
  { 
    kode: 'PA', 
    nama: 'Pelayanan Anak', 
    deskripsi: 'Anak-anak (Usia 0-12 Tahun)',
    icon: '🧸',
    warna: '#F59E0B' // Amber/Gold
  },
  { 
    kode: 'PT', 
    nama: 'Persekutuan Teruna', 
    deskripsi: 'Remaja (Usia 13-17 Tahun)',
    icon: '🧑‍🎓',
    warna: '#10B981' // Emerald
  },
  { 
    kode: 'GP', 
    nama: 'Gerakan Pemuda', 
    deskripsi: 'Pemuda (Usia 18-35 Tahun)',
    icon: '🏃',
    warna: '#3B82F6' // Blue
  },
  { 
    kode: 'PKP', 
    nama: 'Persekutuan Kaum Perempuan', 
    deskripsi: 'Wanita (Usia 35+ Tahun / Menikah)',
    icon: '👩',
    warna: '#EC4899' // Pink
  },
  { 
    kode: 'PKB', 
    nama: 'Persekutuan Kaum Bapak', 
    deskripsi: 'Pria (Usia 35+ Tahun / Menikah)',
    icon: '👨',
    warna: '#06B6D4' // Cyan
  },
  { 
    kode: 'PKLU', 
    nama: 'Persekutuan Kaum Lanjut Usia', 
    deskripsi: 'Lansia (Usia 60+ Tahun)',
    icon: '👴',
    warna: '#78716C' // Stone
  },
] as const;

export type KategoriPelkatKode = typeof KATEGORI_PELKAT[number]['kode'];

export function getKategoriInfo(kode: string) {
  return KATEGORI_PELKAT.find(k => k.kode === kode);
}
