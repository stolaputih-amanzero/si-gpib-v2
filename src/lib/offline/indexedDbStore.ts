import { 
  OfflineCommand, 
  OfflineQueueItem, 
  SyncMetadata, 
  ConflictMetadata, 
  OfflineReadCache 
} from '@/types/offlineSync.types';

export const DB_NAME = 'SI_GPIB_OFFLINE_DB';
export const DB_VERSION = 1;

export const STORES = {
  COMMAND_QUEUE: 'command_queue',
  SYNC_METADATA: 'sync_metadata',
  CONFLICT_METADATA: 'conflict_metadata',
  READ_CACHE: 'read_cache'
} as const;

// In-Memory Storage Engine for Node.js / Server-Side / Test Environments
class MemoryStoreEngine {
  private commandQueue = new Map<string, OfflineQueueItem>();
  private syncMetadata: SyncMetadata = {
    is_online: true,
    last_sync_at: null,
    queued_count: 0,
    syncing_count: 0,
    conflict_count: 0,
    failed_count: 0
  };
  private conflictMetadata = new Map<string, ConflictMetadata>();
  private readCache = new Map<string, OfflineReadCache>();

  async enqueueCommand(command: OfflineCommand): Promise<OfflineQueueItem> {
    const item: OfflineQueueItem = {
      command,
      status: 'QUEUED',
      retry_count: 0,
      last_attempt_at: null,
      error_message: null
    };
    this.commandQueue.set(command.command_id, item);
    this.updateMetadataCounts();
    return item;
  }

  async getQueueItem(commandId: string): Promise<OfflineQueueItem | null> {
    return this.commandQueue.get(commandId) || null;
  }

  async getAllQueueItems(): Promise<OfflineQueueItem[]> {
    return Array.from(this.commandQueue.values());
  }

  async updateQueueItemStatus(
    commandId: string, 
    status: OfflineQueueItem['status'], 
    errorMessage?: string
  ): Promise<OfflineQueueItem | null> {
    const item = this.commandQueue.get(commandId);
    if (!item) return null;

    item.status = status;
    item.last_attempt_at = new Date().toISOString();
    if (status === 'RETRY_PENDING') {
      item.retry_count += 1;
    }
    if (errorMessage !== undefined) {
      item.error_message = errorMessage;
    }

    this.commandQueue.set(commandId, item);
    this.updateMetadataCounts();
    return item;
  }

  async removeQueueItem(commandId: string): Promise<boolean> {
    const deleted = this.commandQueue.delete(commandId);
    this.updateMetadataCounts();
    return deleted;
  }

  async saveConflictMetadata(conflict: ConflictMetadata): Promise<void> {
    this.conflictMetadata.set(conflict.command_id, conflict);
    this.updateMetadataCounts();
  }

  async getConflictMetadata(commandId: string): Promise<ConflictMetadata | null> {
    return this.conflictMetadata.get(commandId) || null;
  }

  async getAllConflicts(): Promise<ConflictMetadata[]> {
    return Array.from(this.conflictMetadata.values());
  }

  async setReadCache<T>(cache: OfflineReadCache<T>): Promise<void> {
    this.readCache.set(cache.cache_key, cache);
  }

  async getReadCache<T>(cacheKey: string): Promise<OfflineReadCache<T> | null> {
    return (this.readCache.get(cacheKey) as OfflineReadCache<T>) || null;
  }

  async getSyncMetadata(): Promise<SyncMetadata> {
    return { ...this.syncMetadata };
  }

  async updateOnlineState(isOnline: boolean): Promise<SyncMetadata> {
    this.syncMetadata.is_online = isOnline;
    return { ...this.syncMetadata };
  }

  private updateMetadataCounts() {
    const items = Array.from(this.commandQueue.values());
    this.syncMetadata.queued_count = items.filter(i => i.status === 'QUEUED').length;
    this.syncMetadata.syncing_count = items.filter(i => i.status === 'SYNCING').length;
    this.syncMetadata.conflict_count = items.filter(i => i.status === 'CONFLICT').length;
    this.syncMetadata.failed_count = items.filter(i => i.status === 'FAILED').length;
  }

  clearAll() {
    this.commandQueue.clear();
    this.conflictMetadata.clear();
    this.readCache.clear();
    this.syncMetadata = {
      is_online: true,
      last_sync_at: null,
      queued_count: 0,
      syncing_count: 0,
      conflict_count: 0,
      failed_count: 0
    };
  }
}

// Global Singleton Instance
export const offlineStoreEngine = new MemoryStoreEngine();
