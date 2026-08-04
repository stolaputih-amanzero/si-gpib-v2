export interface Pendeta {
  id_pendeta: string;
  id_induk: string;
  nama_lengkap: string;
  no_wa: string | null;
  jabatan: string | null;
  status: 'Aktif' | 'Emeritus' | 'Cuti' | 'Mutasi' | 'Nonaktif';
  tgl_lahir: string | null;
  gender: 'Laki-laki' | 'Perempuan' | null;
  tgl_tugas: string | null;
  is_kmj: boolean;
  is_pj: boolean;
  keterangan: string | null;
  
  // Organik / Non-Organik Contract Details
  jenis_pendeta?: 'Organik' | 'Non-Organik';
  tgl_mulai_kontrak?: string | null;
  tgl_akhir_kontrak?: string | null;
  sumber_pembiayaan?: string | null;
  eligible_rotasi?: boolean;
  gereja_asal?: string | null;
  
  created_at?: string;
  updated_at?: string;
  
  // Relations
  jemaat_induk?: {
    id_induk: string;
    nama_induk: string;
    mupel?: {
      id_mupel: string;
      nama_mupel: string;
    };
  };
  penugasan_aktif?: {
    id_pos: string;
    nama_pos: string;
  }[];
}

export type JenisMutasi = 'MUTASI' | 'PENGANGKATAN_KMJ' | 'PENGANGKATAN_PJ' | 'PENUGASAN_POS_PELKES';

export interface RiwayatMutasi {
  id_riwayat: string;
  id_pendeta: string;
  id_induk_lama?: string | null;
  id_induk_baru?: string | null;
  tgl_mutasi: string;
  jenis_mutasi: JenisMutasi | string;
  alasan?: string | null;
  file_sk?: string | null;
  created_at?: string;
  jemaat_lama?: {
    id_induk: string;
    nama_induk: string;
  } | null;
  jemaat_baru?: {
    id_induk: string;
    nama_induk: string;
  } | null;
}

export interface PenugasanPendeta {
  id_tugas: string;
  id_pendeta: string;
  id_pos: string;
  tgl_mulai: string;
  tgl_selesai?: string | null;
  status_tugas: 'Aktif' | 'Selesai';
  created_at?: string;
  updated_at?: string;
  pos_pelkes?: {
    id_pos: string;
    nama_pos: string;
  };
  pendeta?: {
    id_pendeta: string;
    nama_lengkap: string;
  };
}

export interface MutasiFormData {
  id_pendeta: string;
  id_induk_baru: string;
  alasan: string;
  jenis_mutasi: JenisMutasi;
  peran_tugas?: 'KMJ' | 'PJ';
  id_pos_baru?: string | null;
  tgl_mutasi?: string | null;
  file_sk?: string | null;
}
