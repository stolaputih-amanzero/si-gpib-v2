// src/lib/domains/bantuan/bantuan.types.ts
// EIA v0.1.1 — Domain: Bantuan & Workflow (D6)
// Workflow: Pos → KMJ → Admin Mupel → Super User Sinode

// ============================================================
// STATUS & STATE MACHINE
// ============================================================

export const STATUS_BANTUAN = [
  'Draft',
  'Pending_KMJ',
  'Pending_Mupel',
  'Pending_Sinode',
  'Approved',
  'Rejected',
] as const;

export type StatusBantuan = (typeof STATUS_BANTUAN)[number];

/**
 * EIA v0.1.1 §5.1 — Lifecycle State Transitions
 * Setiap status hanya bisa bertransisi ke status tertentu.
 */
export const VALID_TRANSITIONS: Record<StatusBantuan, StatusBantuan[]> = {
  Draft: ['Pending_KMJ'],
  Pending_KMJ: ['Pending_Mupel', 'Rejected'],
  Pending_Mupel: ['Pending_Sinode', 'Rejected'],
  Pending_Sinode: ['Approved', 'Rejected'],
  Approved: [], // terminal — tidak ada transisi lanjutan
  Rejected: ['Draft'], // via "Ajukan Ulang" (membuat record BARU)
};

/**
 * Helper: cek apakah transisi dari satu status ke status lain valid.
 */
export function isValidTransition(
  from: StatusBantuan,
  to: StatusBantuan
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Helper: cek apakah status sudah terminal (tidak bisa diubah lagi).
 */
export function isTerminalStatus(status: StatusBantuan): boolean {
  return status === 'Approved';
}

/**
 * Helper: cek apakah pengajuan bisa diajukan ulang.
 */
export function canResubmit(status: StatusBantuan): boolean {
  return status === 'Rejected';
}

// ============================================================
// URGENSI LEVEL
// ============================================================

export const URGENSI_LEVEL = ['Rendah', 'Sedang', 'Tinggi', 'Darurat'] as const;
export type UrgensiLevel = (typeof URGENSI_LEVEL)[number];

// ============================================================
// ENTITY TYPES
// ============================================================

/**
 * ERD §6 — t_pengajuan_bantuan
 * Termasuk kolom baru `id_pengajuan_sebelumnya` dari EIA v0.1.1
 */
export interface PengajuanBantuan {
  id_ajuan: string;
  id_pos: string;
  id_pengajuan_sebelumnya: string | null; // EIA v0.1.1: referensi record lama saat "Ajukan Ulang"
  jenis_bantuan: string;
  deskripsi: string;
  estimasi_biaya: number;
  urgensi: UrgensiLevel;
  status: StatusBantuan;
  diajukan_oleh: string; // UUID → users.id
  // Referensi aset (nullable — opsional per PRD US-10.1)
  id_aset_tanah: string | null;
  id_aset_bangunan: string | null;
  id_aset_bergerak: string | null;
  // Catatan reviewer per tingkat
  catatan_kmj: string | null;
  catatan_mupel: string | null;
  catatan_sinode: string | null;
  // Timestamp workflow
  tgl_diajukan: string | null; // ISO date
  tgl_review_kmj: string | null;
  tgl_review_mupel: string | null;
  tgl_keputusan_sinode: string | null;
  // Metadata
  created_at: string;
  updated_at: string;
}

/**
 * ERD §6 — t_approval_bantuan
 * Jejak approval per tingkat (audit trail workflow)
 */
export interface ApprovalBantuan {
  id_approval: number;
  id_ajuan: string;
  approver_id: string; // UUID → users.id
  role_approver: 'kmj' | 'admin_mupel' | 'super_user';
  aksi: 'Approved' | 'Rejected';
  catatan: string | null;
  created_at: string;
}

/**
 * Gabungan pengajuan + data terkait untuk tampilan list/detail
 */
export interface PengajuanBantuanWithRelations extends PengajuanBantuan {
  nama_pos: string;
  nama_pemohon: string;
  riwayat_pengajuan_sebelumnya?: {
    id_ajuan: string;
    status: StatusBantuan;
    created_at: string;
  };
  approvals: ApprovalBantuan[];
}

/**
 * Item dalam timeline status (untuk UI tracking — PRD US-10.5)
 */
export interface StatusTimelineItem {
  status: StatusBantuan;
  timestamp: string | null;
  actor: string | null; // nama yang melakukan aksi
  catatan: string | null;
  isCurrent: boolean;
}

// ============================================================
// FILTER & PAGINATION TYPES
// ============================================================

export interface BantuanFilters {
  status?: StatusBantuan;
  id_pos?: string;
  urgensi?: UrgensiLevel;
  diajukan_oleh?: string;
  /** Untuk KMJ: hanya lihat pengajuan di jemaatnya */
  scope_jemaat?: string;
  /** Untuk Admin Mupel: hanya lihat pengajuan di mupel-nya */
  scope_mupel?: string;
  /** Cari berdasarkan jenis/deskripsi */
  search?: string;
  /** Termasuk pengajuan yang ditolak dan sudah diajukan ulang */
  includeHistoris?: boolean;
}

export interface BantuanPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface BantuanListResponse {
  data: PengajuanBantuan[];
  pagination: BantuanPagination;
}

// ============================================================
// ACTION INPUT TYPES
// ============================================================

export type BantuanAction =
  | { type: 'submit'; id_ajuan: string }
  | { type: 'approve_kmj'; id_ajuan: string; catatan?: string }
  | { type: 'reject_kmj'; id_ajuan: string; catatan: string }
  | { type: 'approve_mupel'; id_ajuan: string; catatan?: string }
  | { type: 'reject_mupel'; id_ajuan: string; catatan: string }
  | { type: 'approve_sinode'; id_ajuan: string; catatan?: string }
  | { type: 'reject_sinode'; id_ajuan: string; catatan: string }
  | { type: 'ajukan_ulang'; id_ajuan_lama: string };

// ============================================================
// STATISTICS (untuk dashboard)
// ============================================================

export interface BantuanStats {
  total_draft: number;
  total_pending_kmj: number;
  total_pending_mupel: number;
  total_pending_sinode: number;
  total_approved: number;
  total_rejected: number;
  total_estimasi_approved: number;
}
