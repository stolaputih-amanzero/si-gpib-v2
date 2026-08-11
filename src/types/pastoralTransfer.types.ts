export type TransferStatus = 
  | 'PROPOSED' 
  | 'APPROVED_SINODE' 
  | 'REJECTED' 
  | 'DEPLOYED' 
  | 'CANCELLED';

export type AssignmentStatus = 
  | 'ACTIVE' 
  | 'TRANSFERRED' 
  | 'INACTIVE';

export interface PastoralTransferMetadata {
  id_mutasi: string;
  id_person: string;
  nama_lengkap: string;
  id_org_asal: string;
  nama_org_asal: string;
  id_org_tujuan: string;
  nama_org_tujuan: string;
  status_mutasi: TransferStatus;
  tanggal_efektif: string | null;
  catatan: string | null;
  created_at: string;
}

export interface PastoralAssignmentRecord {
  id_penugasan: string;
  id_person: string;
  id_pos: string;
  nama_organisasi: string;
  jabatan: string;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  status_penugasan: AssignmentStatus;
}

export interface UnifiedPastoralTransferData {
  id_mutasi: string;
  transfer: PastoralTransferMetadata;
  current_assignment: PastoralAssignmentRecord | null;
  assignment_history: PastoralAssignmentRecord[];
}
