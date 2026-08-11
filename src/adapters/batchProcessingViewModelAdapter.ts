import { 
  UnifiedBatchData, 
  BatchStagingRowRecord, 
  BatchRowStatus, 
  BatchAtomicityPolicy, 
  BatchLifecycleStatus 
} from '@/types/batchProcessing.types';
import { 
  BatchProcessingWorkspaceViewModel, 
  BatchRowItemViewModel, 
  BatchSummaryMetrics 
} from '@/types/batchProcessingViewModel.types';

function getRowStatusLabel(status: BatchRowStatus): string {
  switch (status) {
    case 'STAGED':
      return 'Menunggu Dry-Run';
    case 'VALID':
      return 'Valid (Siap Mutasi)';
    case 'INVALID':
      return 'Data Tidak Valid';
    case 'PROCESSING':
      return 'Sedang Diproses...';
    case 'COMMITTED':
      return 'Berhasil Di-Mutasi';
    case 'FAILED':
      return 'Gagal / Butuh Rekonsiliasi';
    default:
      return 'Status Tidak Diketahui';
  }
}

function getRowStatusBadgeColor(status: BatchRowStatus): string {
  switch (status) {
    case 'STAGED':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'VALID':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'INVALID':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'PROCESSING':
      return 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse';
    case 'COMMITTED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'FAILED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function getAtomicityPolicyLabel(policy: BatchAtomicityPolicy): string {
  switch (policy) {
    case 'ALL_OR_NOTHING':
      return 'Semua Harus Valid (ALL_OR_NOTHING)';
    case 'PARTIAL_ALLOW_VALID':
      return 'Izinkan Mutasi Parsial (PARTIAL_ALLOW_VALID)';
    default:
      return 'Kebijakan Tidak Diketahui';
  }
}

function getAtomicityPolicyBadgeColor(policy: BatchAtomicityPolicy): string {
  switch (policy) {
    case 'ALL_OR_NOTHING':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'PARTIAL_ALLOW_VALID':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function getLifecycleStatusLabel(status: BatchLifecycleStatus): string {
  switch (status) {
    case 'UPLOADED':
      return 'Baru Di-Upload';
    case 'VALIDATING':
      return 'Sedang Di-Validasi Dry-Run...';
    case 'VALIDATED':
      return 'Tervalidasi Dry-Run';
    case 'EXECUTING':
      return 'Sedang Mengeksekusi Chunk...';
    case 'COMPLETED':
      return 'Eksekusi Selesai';
    case 'FAILED':
      return 'Gagal / Rollback';
    case 'RECONCILED':
      return 'Telah Di-Rekonsiliasi';
    default:
      return 'Status Lifecycle Tidak Diketahui';
  }
}

function getLifecycleStatusBadgeColor(status: BatchLifecycleStatus): string {
  switch (status) {
    case 'UPLOADED':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'VALIDATING':
    case 'EXECUTING':
      return 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse';
    case 'VALIDATED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'COMPLETED':
    case 'RECONCILED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'FAILED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function getTargetEntityLabel(targetEntity: string): string {
  switch (targetEntity) {
    case 'person':
      return 'Data Anggota Jemaat / Pelayan (Person)';
    case 'asset':
      return 'Data Inventaris Aset Fisik (Asset)';
    case 'organization':
      return 'Data Struktur Organisasi (Organization)';
    default:
      return targetEntity.toUpperCase();
  }
}

function mapRowToViewModel(row: BatchStagingRowRecord): BatchRowItemViewModel {
  const displayPayload = Object.entries(row.payload || {}).map(([key, val]) => ({
    key,
    label: key.replace(/_/g, ' ').toUpperCase(),
    value: val !== null && val !== undefined ? String(val) : '-'
  }));

  const hasError = row.row_status === 'INVALID' || row.row_status === 'FAILED';

  return {
    id_staging: row.id_staging,
    rowNumberFormatted: `Baris #${row.row_number}`,
    row_status: row.row_status,
    statusLabel: getRowStatusLabel(row.row_status),
    statusBadgeColor: getRowStatusBadgeColor(row.row_status),
    displayPayload,
    error_code: row.error_code,
    error_message: row.error_message,
    reconciliation_notes: row.reconciliation_notes,
    hasError
  };
}

export function adaptBatchProcessingToViewModel(
  data: UnifiedBatchData
): BatchProcessingWorkspaceViewModel {
  const header = data.header;
  const rows = (data.staging_rows || []).map(mapRowToViewModel);

  const total = header.total_rows || 0;
  const committed = header.committed_rows || 0;
  const progressPercent = total > 0 ? Math.round((committed / total) * 100) : 0;

  const summaryMetrics: BatchSummaryMetrics = {
    totalRows: total,
    validCount: header.valid_rows || 0,
    invalidCount: header.invalid_rows || 0,
    committedCount: committed,
    failedCount: header.failed_rows || 0,
    progressPercent,
    progressPercentFormatted: `${progressPercent}%`,
    atomicityPolicy: header.atomicity_policy,
    atomicityPolicyLabel: getAtomicityPolicyLabel(header.atomicity_policy),
    atomicityPolicyBadgeColor: getAtomicityPolicyBadgeColor(header.atomicity_policy),
    lifecycleStatus: header.lifecycle_status,
    lifecycleStatusLabel: getLifecycleStatusLabel(header.lifecycle_status),
    lifecycleStatusBadgeColor: getLifecycleStatusBadgeColor(header.lifecycle_status)
  };

  const reconciliationItems = rows.filter(r => r.hasError);

  return {
    id_batch: header.id_batch,
    target_entity_type: header.target_entity_type,
    targetEntityLabel: getTargetEntityLabel(header.target_entity_type),
    createdDateFormatted: header.created_at ? new Date(header.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
    completedDateFormatted: header.completed_at ? new Date(header.completed_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
    summaryMetrics,
    rows,
    reconciliationItems,
    canExecuteBatch: data.validation_summary?.can_execute || false,
    isBatchCompleted: header.lifecycle_status === 'COMPLETED',
    hasData: rows.length > 0
  };
}
