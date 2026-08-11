/**
 * F2 Universal Person Workspace - Interface Types
 * 
 * Dokumen tipe ini di-*generate* dari F2 UnifiedPersonData Interface Contract.
 * SELALU gunakan tipe dari file ini untuk menerima payload dari RPC `get_person_360()`.
 * JANGAN PERNAH menambahkan mekanisme otorisasi di *frontend*.
 * SYSTEM_ONLY tidak ada di dalam kontrak ini karena secara absolut tidak boleh masuk ke JSONB *response*.
 */

export type VisibilityClass = 
  | 'ORG_WIDE' 
  | 'PUBLIC_WITHIN_CONTEXT' 
  | 'RESTRICTED' 
  | 'PRIVATE';

export type PrivacyReason =
  | 'INSUFFICIENT_PERMISSION'
  | 'OUTSIDE_CONTEXT'
  | 'PRIVATE_SCOPE'
  | 'SELF_ONLY';

export interface PrivacyState {
  accessible: boolean; // True jika user memiliki hak akses (data ditampilkan)
  visibility: VisibilityClass; // Level otorisasi intrinsik dari data
  reason?: PrivacyReason; // Terisi jika `accessible` false (dikunci oleh backend)
}

/**
 * Root Struktur Data F2
 */
export interface UnifiedPersonData {
  id_person: string;
  identity: PersonIdentity;
  overview: PersonOverview;
  profile: PersonProfile;
  roles: PersonRoles;
  competencies: PersonCompetencies;
  pastoral: PersonPastoral;
}

/**
 * A. Identity (ORG_WIDE)
 * Identitas dasar kanonikal, selalu terbuka untuk discovery.
 */
export interface PersonIdentity {
  nama_lengkap: string;
  gelar_depan: string | null;
  gelar_belakang: string | null;
  foto_url: string | null;
}

/**
 * B. Overview (Read-Model Agregat)
 * Ringkasan untuk kartu profil utama.
 */
export interface PersonOverview {
  current_role_label: string | null;
  current_organization_name: string | null;
  is_active: boolean | null;
  recent_pastoral_count: number | null;
  affiliation_origin: string | null; // e.g., 'Organik GPIB'
  
  _meta: {
    is_active: PrivacyState;
    recent_pastoral_count: PrivacyState;
  };
}

/**
 * C. Profile (Intrinsic & Sensitive Data)
 * Data pribadi dan kontak, termasuk relasi keluarga & kredensial privat.
 */
export interface PersonFamilyMember {
  id_keluarga: string;
  nama_anggota: string;
  hubungan: string;
  tgl_lahir?: string | null;
}

export interface PersonEmergencyContact {
  nama: string;
  hubungan: string;
  no_telp: string;
}

export interface PersonBiometricDevice {
  id: string;
  friendly_name: string | null;
  last_used_at: string | null;
}

export interface PersonProfile {
  data: {
    tempat_lahir: string | null;
    tanggal_lahir: string | null;
    no_hp: string | null;
    email: string | null;
    alamat_tinggal: string | null;
    
    keluarga: PersonFamilyMember[] | null;
    kontak_darurat: PersonEmergencyContact[] | null;
    biometric_devices: PersonBiometricDevice[] | null;
  };
  
  _meta: {
    tempat_lahir: PrivacyState;
    tanggal_lahir: PrivacyState;
    no_hp: PrivacyState;
    email: PrivacyState;
    alamat_tinggal: PrivacyState;
    keluarga: PrivacyState;
    kontak_darurat: PrivacyState;
    biometric_devices: PrivacyState;
  };
}

/**
 * D. Roles (Keterikatan Relasional)
 * Tidak ada cabang khusus "Pendeta" / "Pelayan". Semua penugasan direpresentasikan sebagai array generik.
 * `role_type` murni sebagai penanda metadata visual, bukan otorisasi.
 */
export interface PersonAssignment {
  id_assignment: string;
  role_type: 'PENDETA' | 'PELAYAN' | 'RELAWAN' | 'OTHER';
  jabatan: string; 
  organization_name: string; 
  status: 'ACTIVE' | 'INACTIVE';
  start_date: string | null;
  end_date: string | null;
}

export interface PersonMutationHistory {
  id_mutasi: string;
  tanggal_mutasi: string;
  asal_organisasi: string;
  tujuan_organisasi: string;
  jenis_mutasi: string;
}

export interface PersonRoles {
  data: {
    assignments: PersonAssignment[];
    mutations: PersonMutationHistory[] | null; 
  };
  
  _meta: {
    assignments: PrivacyState;
    mutations: PrivacyState; 
  };
}

/**
 * E. Competencies (Kapasitas SDM)
 */
export interface PersonEducation {
  institusi: string;
  jenjang: string;
  jurusan: string | null;
  tahun_lulus: string | null;
}

export interface PersonCertification {
  nama_sertifikasi: string;
  penerbit: string;
  tahun: string;
}

export interface PersonCompetencies {
  data: {
    skills: string[] | null;
    education: PersonEducation[] | null;
    certifications: PersonCertification[] | null;
  };
  
  _meta: {
    skills: PrivacyState;
    education: PrivacyState;
    certifications: PrivacyState;
  };
}

/**
 * F. Pastoral (Aktivitas Layanan)
 * Termasuk metadata paginasi.
 */
export interface PastoralSchedule {
  id_jadwal: string;
  tanggal: string;
  nama_kegiatan: string;
  lokasi: string;
}

export interface PastoralLogEntry {
  id_log: string;
  tanggal: string;
  tipe_layanan: string;
  status: string | null;
  
  // SANGAT RAHASIA (Strictly PRIVATE/SELF_ONLY)
  notes: string | null; 
  
  _meta: {
    notes: PrivacyState; 
  };
}

export interface PastoralPaginationMeta {
  limit: number;
  offset: number;
  has_more: boolean;
  total?: number | null;
}

export interface PersonPastoral {
  data: {
    upcoming_schedules: PastoralSchedule[] | null;
    pastoral_logs: PastoralLogEntry[] | null;
  };
  
  pagination: {
    pastoral_logs: PastoralPaginationMeta;
  };
  
  _meta: {
    upcoming_schedules: PrivacyState;
    pastoral_logs: PrivacyState; 
  };
}
