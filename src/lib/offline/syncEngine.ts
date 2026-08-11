import { OfflineCommand, OfflineQueueItem, ConflictMetadata } from '@/types/offlineSync.types';
import { offlineStoreEngine } from './indexedDbStore';

export type CommandDispatcherFn = (command: OfflineCommand) => Promise<any>;

class ClientSyncEngine {
  private dispatchers = new Map<string, CommandDispatcherFn>();

  registerDispatcher(entityType: string, dispatcher: CommandDispatcherFn) {
    this.dispatchers.set(entityType, dispatcher);
  }

  async syncCommand(commandId: string): Promise<OfflineQueueItem | null> {
    const queueItem = await offlineStoreEngine.getQueueItem(commandId);
    if (!queueItem) return null;

    const { command } = queueItem;

    // Transition state: QUEUED / RETRY_PENDING -> SYNCING
    await offlineStoreEngine.updateQueueItemStatus(commandId, 'SYNCING');

    const dispatcher = this.dispatchers.get(command.entity_type);
    if (!dispatcher) {
      const errMsg = `No dispatcher registered for entity_type '${command.entity_type}'`;
      await offlineStoreEngine.updateQueueItemStatus(commandId, 'FAILED', errMsg);
      return offlineStoreEngine.getQueueItem(commandId);
    }

    try {
      // Execute generic dispatcher (Reuses immutable request_id token)
      await dispatcher(command);

      // Transition state: SYNCING -> SYNCED
      await offlineStoreEngine.updateQueueItemStatus(commandId, 'SYNCED');
      return offlineStoreEngine.getQueueItem(commandId);

    } catch (error: any) {
      const errorMessage = error?.message || 'Server dispatch error';

      // Check Domain Server Rejection vs Network Failure
      const isDomainConflict = 
        errorMessage.includes('INVALID_TRANSITION') || 
        errorMessage.includes('INSUFFICIENT_PERMISSION') ||
        errorMessage.includes('AID_REQUEST_NOT_FOUND');

      if (isDomainConflict) {
        // Transition state: SYNCING -> CONFLICT
        await offlineStoreEngine.updateQueueItemStatus(commandId, 'CONFLICT', errorMessage);

        const conflict: ConflictMetadata = {
          command_id: command.command_id,
          request_id: command.request_id,
          entity_type: command.entity_type,
          entity_id: command.entity_id,
          server_error_code: errorMessage.includes('INVALID_TRANSITION') ? 'INVALID_TRANSITION' : 'INSUFFICIENT_PERMISSION',
          server_error_message: errorMessage,
          server_state_snapshot: null,
          resolution_state: 'UNRESOLVED',
          resolved_at: null
        };

        await offlineStoreEngine.saveConflictMetadata(conflict);

      } else {
        // Network / Transient Failure -> RETRY_PENDING
        await offlineStoreEngine.updateQueueItemStatus(commandId, 'RETRY_PENDING', errorMessage);
      }

      return offlineStoreEngine.getQueueItem(commandId);
    }
  }

  async processAllQueued(): Promise<OfflineQueueItem[]> {
    const items = await offlineStoreEngine.getAllQueueItems();
    const pendingItems = items.filter(i => i.status === 'QUEUED' || i.status === 'RETRY_PENDING');

    const results: OfflineQueueItem[] = [];
    for (const item of pendingItems) {
      const res = await this.syncCommand(item.command.command_id);
      if (res) results.push(res);
    }
    return results;
  }
}

export const syncEngine = new ClientSyncEngine();
