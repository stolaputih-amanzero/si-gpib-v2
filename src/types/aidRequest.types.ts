import { PrivacyState } from './person.types';

export type AidRequestStatus = 
  | 'Draft' 
  | 'Pending_KMJ' 
  | 'Pending_Mupel' 
  | 'Pending_Sinode' 
  | 'Approved' 
  | 'Rejected';

export type AidRequestUrgency = 'Mendesak' | 'Tinggi' | 'Normal' | 'Rendah';

export interface AidRequestIdentityNode {
  id_ajuan: string;
  jenis_bantuan: string;
  urgensi: AidRequestUrgency | string;
}

export interface AidRequestOwnershipNode {
  id_pos: string;
  nama_organisasi: string;
  org_level: string;
}

export interface AidRequestWorkflowNode {
  status: AidRequestStatus;
  created_at: string;
}

export interface AidRequestProposalNode {
  biaya: number | null;
  keterangan: string | null;
  id_tanah: string | null;
  id_bangunan: string | null;
  id_aset_b: string | null;
}

export interface AidRequestApprovalItem {
  id: number;
  role_approver: string;
  aksi: 'submit' | 'approve' | 'reject' | string;
  catatan: string | null;
  created_at: string;
}

export interface AidRequestContextNode {
  requester_access_level: 'FULL_ADMIN' | 'RESTRICTED' | 'STANDARD' | 'UNAUTHENTICATED';
  is_same_ancestral_tree: boolean;
}

export interface AidRequestPrivacyMap {
  identity: PrivacyState;
  ownership: PrivacyState;
  workflow: PrivacyState;
  proposal: PrivacyState;
  approval_history: PrivacyState;
}

export interface UnifiedAidRequestData {
  id_ajuan: string;
  identity: AidRequestIdentityNode;
  ownership: AidRequestOwnershipNode;
  workflow: AidRequestWorkflowNode;
  proposal: AidRequestProposalNode | null;
  approval_history: AidRequestApprovalItem[];
  context: AidRequestContextNode;
  _meta: {
    privacy: AidRequestPrivacyMap;
  };
}
