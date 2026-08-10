import type { PendingSubmission } from './dexie';
import { flushOfflineQueueAction, QueuedMutation } from '@/app/actions/offline-sync';

// Map legacy target identifiers to new Contract IDs
const CONTRACT_MAP: Record<string, string> = {
  'create_log_pastoral': 'OC-PASTORAL-001',
  'create_aset': 'OC-ASSET-001',
};

export async function dispatchSubmission(item: PendingSubmission) {
  const contractId = CONTRACT_MAP[item.targetIdentifier];
  
  if (!contractId) {
    throw new Error(`No handler registered for: ${item.targetIdentifier}`);
  }

  // Extract origin_context_id from payload (e.g. id_pos)
  // Since we cannot modify Dexie schema in this step, we infer it from the payload
  const originContextId = (item.payload.id_pos || item.payload.owning_context_id || '') as string;

  const queuedItem: QueuedMutation = {
    queue_id: item.requestId,
    contract_id: contractId,
    target_entity: {
      entity_type: item.targetIdentifier,
      entity_id: null,
      owning_context_id: originContextId,
    },
    operation_payload: item.payload,
    origin_context_id: originContextId,
    timestamp: item.createdAt,
  };

  const results = await flushOfflineQueueAction([queuedItem]);
  const result = results[0];

  if (result.status === 'SUCCESS') {
    return { success: true };
  } else {
    // If rejected by server due to validation/RBAC (permanent)
    return { 
      success: false, 
      error: result.error_detail || result.error_code,
      idempotent: false // Depending on error, we might want to drop it, but let sync manager handle it
    };
  }
}
