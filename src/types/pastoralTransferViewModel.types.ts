import { TransferStatus, AssignmentStatus } from './pastoralTransfer.types';

export interface PastoralTransferItemViewModel {
  id_mutasi: string;
  id_person: string;
  nama_lengkap: string;
  id_org_asal: string;
  nama_org_asal: string;
  id_org_tujuan: string;
  nama_org_tujuan: string;
  status_mutasi: TransferStatus;
  statusLabel: string;
  statusBadgeColor: string;
  effectiveDateFormatted: string;
  createdDateFormatted: string;
  catatan: string | null;
}

export interface PastoralAssignmentItemViewModel {
  id_penugasan: string;
  id_person: string;
  id_pos: string;
  nama_organisasi: string;
  jabatan: string;
  startDateFormatted: string;
  endDateFormatted: string;
  durationFormatted: string;
  status_penugasan: AssignmentStatus;
  statusLabel: string;
  statusBadgeColor: string;
}

export interface PastoralTransferWorkspaceViewModel {
  transfer: PastoralTransferItemViewModel;
  currentAssignment: PastoralAssignmentItemViewModel | null;
  assignmentHistory: PastoralAssignmentItemViewModel[];
  summaryMetrics: {
    totalAssignments: number;
    completedAssignmentsCount: number;
    activeAssignmentOrg: string;
  };
}
