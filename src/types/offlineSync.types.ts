export type OfflineCommandStatus = 
  | 'QUEUED' 
  | 'SYNCING' 
  | 'SYNCED' 
  | 'RETRY_PENDING' 
  | 'CONFLICT' 
  | 'FAILED' 
  | 'DISCARDED';

export type ConflictResolutionState = 'UNRESOLVED' | 'DISCARDED' | 'REAPPLIED';

export interface OfflineCommand {
  command_id: string;          // Client UUID for local store reference
  entity_type: string;         // e.g. 'aid_request' | 'person' | 'asset'
  entity_id: string;           // e.g. 'AJUAN-TEST-001'
  action: string;              // Intent action, e.g. 'submit' | 'approve' | 'reject'
  payload: Record<string, any>;// Opaque, domain-agnostic action payload
  request_id: string;          // Server idempotency token (e.g. 'REQ-1723380000000')
  created_at: string;
}

export interface OfflineQueueItem {
  command: OfflineCommand;
  status: OfflineCommandStatus;
  retry_count: number;
  last_attempt_at: string | null;
  error_message: string | null;
}

export interface SyncMetadata {
  is_online: boolean;
  last_sync_at: string | null;
  queued_count: number;
  syncing_count: number;
  conflict_count: number;
  failed_count: number;
}

export interface ConflictMetadata {
  command_id: string;
  request_id: string;
  entity_type: string;
  entity_id: string;
  server_error_code: string;     // e.g. 'INVALID_TRANSITION' | 'INSUFFICIENT_PERMISSION'
  server_error_message: string;
  server_state_snapshot: Record<string, any> | null;
  resolution_state: ConflictResolutionState;
  resolved_at: string | null;
}

export interface OfflineReadCache<T = any> {
  cache_key: string;            // Key format: `${entity_type}:${entity_id}`
  entity_type: string;
  entity_id: string;
  cached_data: T;
  cached_at: string;
  expires_at: string;
}
