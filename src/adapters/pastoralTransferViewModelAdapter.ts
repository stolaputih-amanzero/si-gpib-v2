import { 
  UnifiedPastoralTransferData, 
  PastoralAssignmentRecord, 
  TransferStatus, 
  AssignmentStatus 
} from '@/types/pastoralTransfer.types';
import { 
  PastoralTransferWorkspaceViewModel, 
  PastoralTransferItemViewModel, 
  PastoralAssignmentItemViewModel 
} from '@/types/pastoralTransferViewModel.types';

function getTransferStatusLabel(status: TransferStatus): string {
  switch (status) {
    case 'PROPOSED':
      return 'Diusulkan (Menunggu Keputusan Sinode)';
    case 'APPROVED_SINODE':
      return 'Disetujui Sinode (Menunggu Penempatan SK)';
    case 'DEPLOYED':
      return 'Resmi Ditempatkan (SK Aktif)';
    case 'REJECTED':
      return 'Ditolak Sinode';
    case 'CANCELLED':
      return 'Dibatalkan';
    default:
      return 'Status Tidak Diketahui';
  }
}

function getTransferBadgeColor(status: TransferStatus): string {
  switch (status) {
    case 'PROPOSED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'APPROVED_SINODE':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'DEPLOYED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'REJECTED':
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function getAssignmentStatusLabel(status: AssignmentStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Penugasan Aktif Saat Ini';
    case 'TRANSFERRED':
      return 'Telah Dimutasi (Historis)';
    case 'INACTIVE':
      return 'Non-Aktif / Pensiun';
    default:
      return 'Status Penugasan Tidak Diketahui';
  }
}

function getAssignmentBadgeColor(status: AssignmentStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'TRANSFERRED':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'INACTIVE':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function calculateDurationFormatted(startDateStr: string, endDateStr: string | null): string {
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0 && months === 0) return 'Kurang dari 1 bulan';
  if (years === 0) return `${months} Bulan`;
  if (months === 0) return `${years} Tahun`;
  return `${years} Tahun ${months} Bulan`;
}

function mapAssignmentToViewModel(rec: PastoralAssignmentRecord): PastoralAssignmentItemViewModel {
  return {
    id_penugasan: rec.id_penugasan,
    id_person: rec.id_person,
    id_pos: rec.id_pos,
    nama_organisasi: rec.nama_organisasi,
    jabatan: rec.jabatan,
    startDateFormatted: rec.tanggal_mulai ? new Date(rec.tanggal_mulai).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
    endDateFormatted: rec.tanggal_selesai ? new Date(rec.tanggal_selesai).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Sekarang (Aktif)',
    durationFormatted: calculateDurationFormatted(rec.tanggal_mulai, rec.tanggal_selesai),
    status_penugasan: rec.status_penugasan,
    statusLabel: getAssignmentStatusLabel(rec.status_penugasan),
    statusBadgeColor: getAssignmentBadgeColor(rec.status_penugasan)
  };
}

export function adaptPastoralTransferToViewModel(
  data: UnifiedPastoralTransferData
): PastoralTransferWorkspaceViewModel {
  const transferVM: PastoralTransferItemViewModel = {
    id_mutasi: data.transfer.id_mutasi,
    id_person: data.transfer.id_person,
    nama_lengkap: data.transfer.nama_lengkap,
    id_org_asal: data.transfer.id_org_asal,
    nama_org_asal: data.transfer.nama_org_asal,
    id_org_tujuan: data.transfer.id_org_tujuan,
    nama_org_tujuan: data.transfer.nama_org_tujuan,
    status_mutasi: data.transfer.status_mutasi,
    statusLabel: getTransferStatusLabel(data.transfer.status_mutasi),
    statusBadgeColor: getTransferBadgeColor(data.transfer.status_mutasi),
    effectiveDateFormatted: data.transfer.tanggal_efektif ? new Date(data.transfer.tanggal_efektif).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
    createdDateFormatted: data.transfer.created_at ? new Date(data.transfer.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
    catatan: data.transfer.catatan
  };

  const currentVM = data.current_assignment ? mapAssignmentToViewModel(data.current_assignment) : null;
  const historyVMs = data.assignment_history.map(mapAssignmentToViewModel);

  const completedCount = data.assignment_history.filter(a => a.status_penugasan === 'TRANSFERRED').length;

  return {
    transfer: transferVM,
    currentAssignment: currentVM,
    assignmentHistory: historyVMs,
    summaryMetrics: {
      totalAssignments: data.assignment_history.length,
      completedAssignmentsCount: completedCount,
      activeAssignmentOrg: data.current_assignment ? data.current_assignment.nama_organisasi : 'Tidak Ada Penugasan Aktif'
    }
  };
}
