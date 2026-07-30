export interface KeluargaPendeta {
  id_keluarga: string;
  id_pendeta: string;
  hubungan: 'Suami' | 'Istri' | 'Anak' | 'Orang Tua' | 'Mertua' | 'Lainnya' | string;
  nama_lengkap: string;
  gender?: 'Laki-Laki' | 'Perempuan' | string | null;
  tgl_lahir?: string | null;
  no_wa?: string | null;
  pendidikan?: string | null;
  pekerjaan?: string | null;
  status_hidup: 'Hidup' | 'Meninggal' | string;
  is_tanggungan: boolean;
  keterangan?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface KompetensiPendeta {
  id_kompetensi: string;
  id_pendeta: string;
  kategori: string; // Pertanian | Perkebunan | Perikanan | Peternakan | Manajemen | Keuangan | Pendidikan | Kesehatan | Teknologi | Musik | Seni | Bahasa | Lainnya
  nama_kompetensi: string;
  jenis: 'Kompetensi' | 'Passion' | 'Karunia' | string;
  tingkat?: 'Pemula' | 'Menengah' | 'Mahir' | 'Ahli' | string | null;
  tahun_mulai?: number | null;
  keterangan?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface KeterlibatanPendeta {
  id_keterlibatan: string;
  id_pendeta: string;
  tingkat: 'Jemaat' | 'Mupel' | 'Sinodal' | 'Eksternal' | string;
  id_mupel?: string | null;
  jenis: 'Panitia' | 'Pokja' | 'Komisi' | 'Tim Kerja' | 'Delegasi' | 'Pengurus' | 'Lainnya' | string;
  nama_kegiatan: string;
  jabatan?: 'Ketua' | 'Sekretaris' | 'Bendahara' | 'Koordinator' | 'Anggota' | 'Peserta' | string | null;
  tgl_mulai?: string | null;
  tgl_selesai?: string | null;
  status: 'Aktif' | 'Selesai' | string;
  keterangan?: string | null;
  created_at?: string;
  updated_at?: string;
}
