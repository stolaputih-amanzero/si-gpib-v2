export type UserRoleType =
  | 'superadmin'
  | 'super_user'
  | 'admin_mupel'
  | 'admin_jemaat'
  | 'kmj'
  | 'pj_pos'
  | 'pj'
  | 'pendeta'
  | 'pelayan'
  | 'relawan'
  | 'read_only'
  | 'user';

export interface ProfileAkun {
  id: string;
  email: string;
  nama_lengkap: string;
  role: UserRoleType;
  id_mupel?: string | null;
  id_induk?: string | null;
  id_pos?: string | null;
  id_pendeta?: string | null;
  status: 'Active' | 'Inactive' | 'Pending';
  last_login_at?: string | null;
  created_at?: string | null;
  no_hp?: string | null;
  no_telepon?: string | null;
  avatar_url?: string | null;
  foto_url?: string | null;
  biometric_enabled?: boolean;
  pendeta?: {
    id_pendeta?: string;
    jabatan?: string | null;
    tgl_lahir?: string | null;
    no_wa?: string | null;
    foto_url?: string | null;
  } | null;
  jemaat?: {
    id_induk?: string;
    nama_induk?: string;
  } | null;
  mupel?: {
    id_mupel?: string;
    nama_mupel?: string;
  } | null;
  mutasi?: any[];
  keluarga?: any[];
  kompetensi?: any[];
  keterlibatan?: any[];
}

export interface ProfilePelayanan {
  id_pendeta: string;
  nama_pendeta: string;
  gelar_depan?: string | null;
  gelar_belakang?: string | null;
  foto_url?: string | null;
  nip?: string | null;
  nik?: string | null;
  tempat_lahir?: string | null;
  tgl_lahir?: string | null;
  jenis_kelamin?: string | null;
  no_telepon?: string | null;
  email?: string | null;
  tgl_tugas_awal?: string | null;
  jenis_pendeta?: string | null;
  status_aktif: boolean;
  id_induk?: string | null;
  id_mupel?: string | null;
  id_pos?: string | null;
  is_kmj: boolean;
  is_pj: boolean;
  jemaat_induk_nama?: string | null;
  mupel_nama?: string | null;
  pos_pelkes_nama?: string | null;
}

export interface ProfileStats {
  total_log: number;
  total_jiwa: number;
  pos_aktif: number;
  log_bulan_ini: number;
  lama_melayani_bulan: number;
}

export interface RiwayatMutasiItem {
  id_mutasi: string;
  id_pendeta: string;
  tgl_mutasi: string;
  jenis_mutasi: string;
  id_induk_lama?: string | null;
  id_induk_baru?: string | null;
  nama_induk_lama?: string | null;
  nama_induk_baru?: string | null;
  id_mupel_lama?: string | null;
  nama_mupel_lama?: string | null;
  id_mupel_baru?: string | null;
  nama_mupel_baru?: string | null;
  alasan?: string | null;
  catatan?: string | null;
}

export interface PenugasanPjItem {
  id_penugasan: string;
  id_pendeta: string;
  id_pos: string;
  nama_pos?: string | null;
  id_induk?: string | null;
  nama_induk?: string | null;
  tgl_mulai?: string | null;
  tgl_selesai?: string | null;
  status_aktif: boolean;
}

export interface LogPastoralRingkasItem {
  id_log: string;
  id_pendeta: string;
  id_pos?: string | null;
  nama_pos?: string | null;
  kegiatan: string;
  tgl_kegiatan: string;
  jumlah_jiwa: number;
  catatan?: string | null;
}

export interface AktivitasUserItem {
  id: string;
  user_id: string;
  aksi: string;
  fitur?: string | null;
  detail?: string | null;
  created_at: string;
  ip_address?: string | null;
}

export interface DeviceBiometricItem {
  id: string;
  user_id: string;
  credential_id: string;
  device_type?: string | null;
  created_at: string;
  last_used_at?: string | null;
  friendly_name?: string | null;
}

export interface DraftUserItem {
  id: string;
  form_type: string;
  key_name: string;
  updated_at: string;
  data_preview?: string | null;
}
