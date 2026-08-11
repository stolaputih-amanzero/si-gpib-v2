import { OfflineCommandStatus, ConflictResolutionState } from './offlineSync.types';

export interface OfflineCommandItemViewModel {
  command_id: string;
  request_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  status: OfflineCommandStatus;
  statusLabel: string;
  statusBadgeColor: string;
  createdAtFormatted: string;
  lastAttemptAtFormatted: string | null;
  retryCount: number;
  errorMessage: string | null;
  conflictDetails: {
    hasConflict: boolean;
    serverErrorCode: string | null;
    serverErrorMessage: string | null;
    resolutionState: ConflictResolutionState | null;
  } | null;
}

export interface OfflineSyncSummaryViewModel {
  isOnline: boolean;
  onlineStatusLabel: string;
  lastSyncFormatted: string;
  queuedCount: number;
  syncingCount: number;
  conflictCount: number;
  failedCount: number;
  totalPendingCount: number;
}

export interface OfflineSyncWorkspaceViewModel {
  summary: OfflineSyncSummaryViewModel;
  queueItems: OfflineCommandItemViewModel[];
  conflictItems: OfflineCommandItemViewModel[];
}
