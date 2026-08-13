'use server';

import { createClient } from '@/lib/supabase/server';
import { enforceContract } from '@/lib/authorization';
import { OFFLINE_EXECUTORS } from '@/lib/offline/executors/registry';
import type { ContractId } from '@/lib/authorization/types';

export interface QueuedMutation {
  queue_id: string;
  contract_id: string;
  target_entity: any;
  operation_payload: any;
  origin_context_id: string;
  timestamp: number;
}

export interface FlushResult {
  queue_id: string;
  status: 'SUCCESS' | 'REJECTED';
  error_code?: string;
  error_detail?: string;
}

export async function flushOfflineQueueAction(items: QueuedMutation[]): Promise<FlushResult[]> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    // If entire session is invalid, reject all. The client will keep them in IndexedDB.
    return items.map(item => ({
      queue_id: item.queue_id,
      status: 'REJECTED',
      error_code: 'UNAUTHORIZED',
      error_detail: 'User session is invalid'
    }));
  }

  const userId = session.user.id;
  const results: FlushResult[] = [];

  for (const item of items) {
    try {
      // 1. Authorization: Enforce Contract against the Origin Context
      const authResult = await enforceContract(
        item.contract_id as ContractId,
        {
          targetEntity: item.target_entity,
        },
        supabase,
        userId,
        item.origin_context_id
      );

      if (authResult.status === 'RESOLUTION_FAILURE') {
        results.push({
          queue_id: item.queue_id,
          status: 'REJECTED',
          error_code: 'RESOLUTION_FAILURE',
          error_detail: 'Failed to resolve context or contract'
        });
        continue;
      }

      if (authResult.status === 'DENY') {
        results.push({
          queue_id: item.queue_id,
          status: 'REJECTED',
          error_code: authResult.errorCode || 'UNAUTHORIZED',
          error_detail: authResult.errorDetail || undefined
        });
        continue;
      }

      // 2. Routing: Find Executor in Registry
      const executor = OFFLINE_EXECUTORS[item.contract_id];
      if (!executor) {
        results.push({
          queue_id: item.queue_id,
          status: 'REJECTED',
          error_code: 'NOT_IMPLEMENTED',
          error_detail: `No offline executor registered for contract ${item.contract_id}`
        });
        continue;
      }

      // 3. Execution (DB Insert)
      await executor(item.operation_payload, item.origin_context_id, userId);

      // 4. Success
      results.push({
        queue_id: item.queue_id,
        status: 'SUCCESS'
      });

    } catch (error: any) {
      console.error(`Flush failed for ${item.queue_id}:`, error);
      results.push({
        queue_id: item.queue_id,
        status: 'REJECTED',
        error_code: 'EXECUTION_FAILED',
        error_detail: error.message || 'Unknown execution error'
      });
    }
  }

  return results;
}
