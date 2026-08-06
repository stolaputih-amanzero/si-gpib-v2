import { db } from './dexie';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import { SyncTracker } from '@/lib/telemetry/sync-tracker';
import { processPendingAttachments, cleanupAttachmentsForRecord } from './attachment-manager';
import { resolveConflict, moveToDLQ } from './conflict-policy';

const BACKOFF_SCHEDULE_MS = [
  1_000,    // Attempt 1: 1 detik
  5_000,    // Attempt 2: 5 detik
  15_000,   // Attempt 3: 15 detik
  30_000,   // Attempt 4: 30 detik
  60_000,   // Attempt 5: 1 menit
  120_000,  // Attempt 6: 2 menit
  300_000,  // Attempt 7: 5 menit
];

const MAX_RETRY_ATTEMPTS = 7;

function getBackoffDelay(attempts: number): number {
  const index = Math.min(Math.max(attempts - 1, 0), BACKOFF_SCHEDULE_MS.length - 1);
  const base = BACKOFF_SCHEDULE_MS[index];
  const jitter = base * 0.2 * (Math.random() - 0.5);
  return Math.round(base + jitter);
}

export async function processPendingQueue() {
  const supabase = createClient();
  
  // P0 Hotfix: Verifikasi Session Expiry (RLS)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || (session.expires_at && session.expires_at * 1000 < Date.now())) {
    logger.warn('[SyncEngine] Token expired, waiting for re-authentication');
    // Jika tidak ada session atau expired, kita tidak melanjutkan antrean ini.
    // Menampilkan toast opsional, tapi karena di lib, hindari coupling berlebih jika memungkinkan
    // Untuk alert user, biarkan event authStateChange yang trigger re-login screen.
    return;
  }

  
  // Ambil item dengan status 'pending' atau 'failed' yang sudah melewati backoff (atau baru)
  const allQueue = await db.pendingSubmissions
    .where('status')
    .anyOf(['pending', 'failed'])
    .sortBy('createdAt');

  const now = Date.now();
  const queue = allQueue.filter(item => {
    if (item.status === 'failed' && item.attempts > 0) {
      const delay = getBackoffDelay(item.attempts);
      const lastAttemptAt = (item as any).lastAttemptAt || item.createdAt;
      return (now - lastAttemptAt) >= delay;
    }
    return true;
  });

  if (queue.length === 0) {
    SyncTracker.trackQueueLength(0);
    return;
  }

  SyncTracker.trackSyncStart(queue.length);
  SyncTracker.trackQueueLength(queue.length);
  const startTime = performance.now();
  
  let syncSuccessCount = 0;
  let syncFailCount = 0;

  for (const item of queue) {
    try {
      // Update status jadi 'syncing' agar tidak diproses ganda
      await db.pendingSubmissions.update(item.id!, { status: 'syncing' });

      let error = null;
      
      // 🚀 CONFLICT POLICY & IDEMPOTENCY CHECK
      const conflictResult = await resolveConflict(item, supabase);
      if (conflictResult === 'reject') {
        syncFailCount++;
        continue;
      }
      if (conflictResult === 'conflict') {
        await db.pendingSubmissions.update(item.id!, { 
          status: 'failed', 
          attempts: item.attempts + 1,
          lastError: 'CONFLICT_DETECTED',
          lastAttemptAt: Date.now()
        } as any);
        syncFailCount++;
        continue;
      }

      // Check Server-Side Idempotency
      const { data: isProcessed } = await supabase.rpc('check_idempotency', { p_request_id: item.requestId });
      if (isProcessed) {
        logger.warn(`[SyncEngine] Request ${item.requestId} already processed by server. Skipping.`);
        await db.pendingSubmissions.delete(item.id!);
        syncSuccessCount++;
        continue;
      }

      // Inject idempotency key to payload
      const payloadWithReqId = { ...item.payload, requestId: item.requestId };
      
      if (item.operationType === 'rpc') {
        const { error: rpcError } = await supabase.rpc(
          item.targetIdentifier as any, 
          payloadWithReqId as any
        );
        error = rpcError;
      } 
      else if (item.operationType === 'insert') {
        const { error: insertError } = await supabase
          .from(item.targetIdentifier)
          .insert(payloadWithReqId);
        error = insertError;
      } else if (item.operationType === 'update') {
        // Fallback or explicit update
        const idField = (item.payload as any).id;
        if (idField) {
           const { error: updateError } = await supabase
            .from(item.targetIdentifier)
            .update(payloadWithReqId)
            .eq('id', idField);
           error = updateError;
        } else {
           throw new Error('Update requires an id field in payload');
        }
      }

      if (error) throw error;

      // Record transaction history on server
      await supabase.rpc('record_transaction', {
        p_request_id: item.requestId,
        p_table_name: item.targetIdentifier,
        p_operation_type: item.operationType,
        p_record_id: (payloadWithReqId as any).id || (payloadWithReqId as any).id_pendeta || null,
        p_payload_summary: payloadWithReqId
      });

      // Cleanup attachments associated with this submission
      await cleanupAttachmentsForRecord(item.id!.toString());

      // ✅ SUKSES: Hapus dari antrean
      await db.pendingSubmissions.delete(item.id!);
      logger.info(`[SyncEngine] Success: ${item.operationType} ${item.targetIdentifier}`);
      syncSuccessCount++;

    } catch (err: any) {
      // ❌ GAGAL: Tandai sebagai failed, increment attempts
      const attempts = (item.attempts || 0) + 1;
      const isNetworkError = err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError');
      
      if (isNetworkError) {
        // Jika error jaringan, hentikan loop (tunggu online lagi)
        await db.pendingSubmissions.update(item.id!, { status: 'pending', lastAttemptAt: Date.now() } as any);
        logger.warn('[SyncEngine] Network lost during sync. Pausing.');
        break; 
      } else {
        if (attempts >= MAX_RETRY_ATTEMPTS) {
          // Pindah ke DLQ
          await moveToDLQ(item, err instanceof Error ? err : new Error(String(err)));
        } else {
          // Error validasi/logic: tandai failed untuk retry berikutnya
          await db.pendingSubmissions.update(item.id!, { 
            status: 'failed', 
            attempts,
            lastError: err.message || String(err),
            lastAttemptAt: Date.now()
          } as any);
        }
        SyncTracker.trackSyncError(err, item.requestId, item.targetIdentifier);
        syncFailCount++;
      }
    }
  }
  
  const endTime = performance.now();
  SyncTracker.trackSyncComplete(endTime - startTime, syncSuccessCount, syncFailCount);
  
  // Cek sisa antrean
  const remaining = await db.pendingSubmissions.count();
  if (remaining === 0 && syncSuccessCount > 0) {
    logger.info('[SyncEngine] Semua data offline berhasil disinkronkan!');
  }
}

// Setup Listener (Client-side only)
export function setupSyncListener() {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => {
    logger.info('[SyncManager] Online detected. Triggering sync...');
    processPendingAttachments();
    processPendingQueue();
  });
  
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
       logger.info('[SyncManager] App visible. Triggering sync...');
       processPendingAttachments();
       processPendingQueue();
    }
  });
}
