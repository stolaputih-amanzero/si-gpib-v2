export interface Pendeta360 {
  pendeta: {
    id_pendeta: string;
    id_induk: string;
    nama_lengkap: string;
    no_wa: string;
    email: string | null;
    jabatan: string;
    status: string;
    tgl_lahir: string;
    gender: string;
    tgl_tugas: string;
    is_kmj: boolean;
    is_pj: boolean;
    foto_url: string | null;
  };
  stats: {
    total_log: number;
    total_jiwa: number;
    pos_aktif: number;
    log_bulan_ini: number;
    lama_melayani_bulan: number;
  };
  keluarga: KeluargaPendeta[] | null; // null = tidak authorized
  kompetensi: KompetensiPendeta[] | null;
  keterlibatan: KeterlibatanPendeta[] | null;
  mutasi: RiwayatMutasi[] | null;
  jabatan: JabatanStruktural[] | null;
  biometric: BiometricDevice[] | null; // null = tidak authorized
  audit_log: AuditLog[] | null;
}

export interface KeluargaPendeta {
  id_keluarga: string;
  nama: string;
  hubungan: string;
  tgl_lahir: string;
  foto_url: string | null;
}

export interface KompetensiPendeta {
  id_kompetensi: string;
  kategori: string;
  nama: string;
  tingkat: string;
  dokumen_url: string | null;
}

export interface KeterlibatanPendeta {
  id_keterlibatan: string;
  jenis: string;
  nama: string;
  tingkat: string;
  tgl_mulai: string;
  tgl_selesai: string | null;
  status: string;
}

export interface RiwayatMutasi {
  id_mutasi: string;
  id_induk_asal: string;
  id_induk_tujuan: string;
  tanggal_mutasi: string;
  alasan: string;
  jenis_mutasi: string;
}

export interface JabatanStruktural {
  id_jabatan: string;
  kategori: string;
  nama_jabatan: string;
  tingkat: string;
  tgl_mulai: string;
  tgl_selesai: string | null;
  status: string;
}

export interface BiometricDevice {
  id: string;
  device_type: string;
  display_name: string;
  last_used_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  aksi: string;
  target_table: string;
  target_id: string;
  created_at: string;
}
