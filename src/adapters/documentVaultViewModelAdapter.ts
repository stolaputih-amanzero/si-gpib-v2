import { 
  UnifiedDocumentVaultData, 
  DocumentVisibilityTier, 
  DocumentLifecycleStatus 
} from '@/types/documentVault.types';
import { 
  DocumentVaultWorkspaceViewModel, 
  DocumentItemViewModel, 
  DocumentVaultSummaryViewModel 
} from '@/types/documentVaultViewModel.types';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getVisibilityLabel(tier: DocumentVisibilityTier): string {
  switch (tier) {
    case 'PUBLIC':
      return 'Publik (Seluruh Anggota)';
    case 'ORG_WIDE':
      return 'Internal Organisasi';
    case 'CONFIDENTIAL':
      return 'Kerahasiaan Tinggi (Rahasia)';
    default:
      return 'Tier Tidak Diketahui';
  }
}

function getVisibilityBadgeColor(tier: DocumentVisibilityTier): string {
  switch (tier) {
    case 'PUBLIC':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'ORG_WIDE':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'CONFIDENTIAL':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function getStatusLabel(status: DocumentLifecycleStatus): string {
  switch (status) {
    case 'PENDING_UPLOAD':
      return 'Menunggu Upload Biner';
    case 'ACTIVE':
      return 'Aktif Terkonfirmasi';
    case 'FAILED_UPLOAD':
      return 'Gagal Terunggah';
    case 'CORRUPTED':
      return 'Korupsi Ukuran / Checksum';
    case 'DELETED':
      return 'Dihapus (Soft Delete)';
    default:
      return 'Status Tidak Diketahui';
  }
}

function getStatusBadgeColor(status: DocumentLifecycleStatus): string {
  switch (status) {
    case 'PENDING_UPLOAD':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ACTIVE':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'FAILED_UPLOAD':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'CORRUPTED':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'DELETED':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function getMimeBadgeLabel(mime: string): string {
  if (mime.includes('pdf')) return 'PDF Document';
  if (mime.includes('image')) return 'Image File';
  if (mime.includes('spreadsheet') || mime.includes('excel')) return 'Spreadsheet';
  return 'Binary File';
}

export function adaptDocumentVaultToViewModel(
  data: UnifiedDocumentVaultData
): DocumentVaultWorkspaceViewModel {
  const activeDocs = data.documents.filter(d => d.status !== 'DELETED');

  const documentVMs: DocumentItemViewModel[] = activeDocs.map(doc => ({
    id_dokumen: doc.id_dokumen,
    entity_type: doc.entity_type,
    entity_id: doc.entity_id,
    nama_file: doc.nama_file,
    storage_path: doc.storage_path,
    size_bytes: doc.size_bytes,
    sizeFormatted: formatBytes(doc.size_bytes),
    mime_type: doc.mime_type,
    mimeBadgeLabel: getMimeBadgeLabel(doc.mime_type),
    visibility_tier: doc.visibility_tier,
    visibilityLabel: getVisibilityLabel(doc.visibility_tier),
    visibilityBadgeColor: getVisibilityBadgeColor(doc.visibility_tier),
    sha256_checksum: doc.sha256_checksum,
    status: doc.status,
    statusLabel: getStatusLabel(doc.status),
    statusBadgeColor: getStatusBadgeColor(doc.status),
    createdAtFormatted: doc.created_at ? new Date(doc.created_at).toLocaleString('id-ID') : '-'
  }));

  const activeCount = data.documents.filter(d => d.status === 'ACTIVE').length;
  const pendingCount = data.documents.filter(d => d.status === 'PENDING_UPLOAD').length;
  const corruptedCount = data.documents.filter(d => d.status === 'CORRUPTED').length;

  const summaryVM: DocumentVaultSummaryViewModel = {
    entity_type: data.entity_type,
    entity_id: data.entity_id,
    totalCount: activeDocs.length,
    totalSizeBytes: data.total_size_bytes,
    totalSizeFormatted: formatBytes(data.total_size_bytes),
    activeCount,
    pendingCount,
    corruptedCount
  };

  return {
    summary: summaryVM,
    documents: documentVMs
  };
}
