import { 
  OfflineQueueItem, 
  ConflictMetadata, 
  SyncMetadata,
  OfflineCommandStatus
} from '@/types/offlineSync.types';
import { 
  OfflineSyncWorkspaceViewModel, 
  OfflineCommandItemViewModel, 
  OfflineSyncSummaryViewModel 
} from '@/types/offlineSyncViewModel.types';

function getStatusLabel(status: OfflineCommandStatus): string {
  switch (status) {
    case 'QUEUED':
      return 'Menunggu Koneksi Jaringan';
    case 'SYNCING':
      return 'Sedang Memproses Pengiriman...';
    case 'SYNCED':
      return 'Tersinkronisasi ke Server';
    case 'RETRY_PENDING':
      return 'Menunggu Percobaan Ulang (Gagal Jaringan)';
    case 'CONFLICT':
      return 'Konflik Status Domain Server';
    case 'FAILED':
      return 'Gagal Terkirim (Error Sistem)';
    case 'DISCARDED':
      return 'Dibuang oleh Pengguna';
    default:
      return 'Status Tidak Diketahui';
  }
}

function getStatusBadgeColor(status: OfflineCommandStatus): string {
  switch (status) {
    case 'QUEUED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'SYNCING':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'SYNCED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'RETRY_PENDING':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'CONFLICT':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    case 'FAILED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'DISCARDED':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function adaptOfflineSyncToViewModel(
  queueItems: OfflineQueueItem[],
  conflicts: ConflictMetadata[],
  syncMetadata: SyncMetadata
): OfflineSyncWorkspaceViewModel {
  const conflictMap = new Map<string, ConflictMetadata>();
  conflicts.forEach(c => conflictMap.set(c.command_id, c));

  const commandVMs: OfflineCommandItemViewModel[] = queueItems.map(item => {
    const conflict = conflictMap.get(item.command.command_id);

    return {
      command_id: item.command.command_id,
      request_id: item.command.request_id,
      entity_type: item.command.entity_type,
      entity_id: item.command.entity_id,
      action: item.command.action,
      status: item.status,
      statusLabel: getStatusLabel(item.status),
      statusBadgeColor: getStatusBadgeColor(item.status),
      createdAtFormatted: item.command.created_at ? new Date(item.command.created_at).toLocaleString('id-ID') : '-',
      lastAttemptAtFormatted: item.last_attempt_at ? new Date(item.last_attempt_at).toLocaleString('id-ID') : null,
      retryCount: item.retry_count,
      errorMessage: item.error_message,
      conflictDetails: conflict ? {
        hasConflict: true,
        serverErrorCode: conflict.server_error_code,
        serverErrorMessage: conflict.server_error_message,
        resolutionState: conflict.resolution_state
      } : null
    };
  });

  const conflictItems = commandVMs.filter(vm => vm.status === 'CONFLICT');

  const summaryVM: OfflineSyncSummaryViewModel = {
    isOnline: syncMetadata.is_online,
    onlineStatusLabel: syncMetadata.is_online ? 'Terhubung ke Jaringan (Online)' : 'Terputus dari Jaringan (Offline Mode)',
    lastSyncFormatted: syncMetadata.last_sync_at ? new Date(syncMetadata.last_sync_at).toLocaleString('id-ID') : 'Belum Pernah',
    queuedCount: syncMetadata.queued_count,
    syncingCount: syncMetadata.syncing_count,
    conflictCount: syncMetadata.conflict_count,
    failedCount: syncMetadata.failed_count,
    totalPendingCount: syncMetadata.queued_count + syncMetadata.syncing_count + syncMetadata.conflict_count
  };

  return {
    summary: summaryVM,
    queueItems: commandVMs,
    conflictItems
  };
}
