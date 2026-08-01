export const KATEGORI_PELKAT = [
  { 
    kode: 'PA', 
    nama: 'Pelayanan Anak', 
    deskripsi: 'Anak-anak (Usia 0-12 Tahun)',
    icon: '🧸',
    warna: '#22C55E' // Hijau Muda (Green-500)
  },
  { 
    kode: 'PT', 
    nama: 'Persekutuan Teruna', 
    deskripsi: 'Remaja (Usia 13-17 Tahun)',
    icon: '🧑‍🎓',
    warna: '#EAB308' // Kuning (Yellow-500)
  },
  { 
    kode: 'GP', 
    nama: 'Gerakan Pemuda', 
    deskripsi: 'Pemuda (Usia 18-35 Tahun)',
    icon: '🏃',
    warna: '#1D4ED8' // Biru Benhur (Blue-700)
  },
  { 
    kode: 'PKP', 
    nama: 'Persekutuan Kaum Perempuan', 
    deskripsi: 'Wanita (Usia 35+ Tahun / Menikah)',
    icon: '👩',
    warna: '#9333EA' // Ungu (Purple-600)
  },
  { 
    kode: 'PKB', 
    nama: 'Persekutuan Kaum Bapak', 
    deskripsi: 'Pria (Usia 35+ Tahun / Menikah)',
    icon: '👨',
    warna: '#64748B' // Abu-abu (Slate-500)
  },
  { 
    kode: 'PKLU', 
    nama: 'Persekutuan Kaum Lanjut Usia', 
    deskripsi: 'Lansia (Usia 60+ Tahun)',
    icon: '👴',
    warna: '#F97316' // Orange (Orange-500)
  },
] as const;

export type KategoriPelkatKode = typeof KATEGORI_PELKAT[number]['kode'];

export function getKategoriInfo(kode: string) {
  return KATEGORI_PELKAT.find(k => k.kode === kode);
}
