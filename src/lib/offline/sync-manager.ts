// src/lib/offline/sync-manager.ts
import { db, type PendingSubmission } from './dexie';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger'; // Wajib pakai centralized logger
import { dispatchSubmission } from './action-dispatcher';
import { processAttachments } from './attachment-uploader';

const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;
const MAX_SYNC_ATTEMPTS = 5;

export type SyncEvent = 'session-expired' | 'sync-started' | 'sync-completed' | 'sync-error';
type SyncEventListener = (event: SyncEvent, payload?: unknown) => void;

class SyncManager {
  private isProcessing = false;
  private listeners: Set<SyncEventListener> = new Set();

  on(listener: SyncEventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: SyncEvent, payload?: unknown) {
    this.listeners.forEach((l) => l(event, payload));
  }

  private calculateBackoff(attempts: number): number {
    const delay = BASE_DELAY_MS * Math.pow(2, attempts - 1);
    return Math.min(delay, MAX_DELAY_MS);
  }

  async processQueue() {
    if (this.isProcessing) return;
    
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    this.isProcessing = true;
    this.emit('sync-started');

    try {
      // P0 Hotfix: Validate session before looping
      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        this.emit('session-expired');
        logger.error('Session expired, halting sync');
        return;
      }

      const pendingItems = await db.pendingSubmissions
        .where('status')
        .anyOf('pending', 'failed')
        .toArray();

      for (const item of pendingItems) {
        // Enforce backoff for retries
        if (item.status === 'failed' && item.lastAttemptAt) {
          const delay = this.calculateBackoff(item.attempts);
          if (Date.now() - item.lastAttemptAt < delay) {
            continue; // Skip item ini, tunggu backoff selesai
          }
        }

        // Mark as syncing (Gunakan item.id! karena ++id adalah Primary Key)
        await db.pendingSubmissions.update(item.id!, {
          status: 'syncing',
          attempts: item.attempts + 1,
          lastAttemptAt: Date.now(),
        });

        try {
          const attResult = await processAttachments(item.id!, MAX_SYNC_ATTEMPTS);
          if (attResult.status === 'permanent_error') {
            throw { status: 400, message: attResult.lastError || 'Lampiran gagal permanen' };
          } else if (attResult.status === 'transient_error') {
            await db.pendingSubmissions.update(item.id!, {
              status: 'failed',
              lastError: 'Menunggu upload lampiran: ' + (attResult.lastError || ''),
            });
            continue;
          }

          const response = await this.executeServerAction(item);

          if (response.success) {
            await db.transaction('rw', db.pendingSubmissions, db.pendingAttachments, async () => {
              await db.pendingAttachments.where('submissionId').equals(item.id!).delete();
              await db.pendingSubmissions.delete(item.id!);
            });
            logger.info('Sync success', { requestId: item.requestId, target: item.targetIdentifier });
          } else {
            throw new Error(response.error || 'Server validation failed');
          }
        } catch (error: unknown) {
          const err = error as { status?: number; code?: string; message?: string };
          const isClientError = err.status && err.status >= 400 && err.status < 500;
          
          if (isClientError || item.attempts >= MAX_SYNC_ATTEMPTS) {
            // Gagal permanen 4xx atau max attempts -> DeadLetter Queue
            await db.transaction('rw', db.pendingSubmissions, db.deadLetters, db.pendingAttachments, async () => {
              await db.deadLetters.add({
                requestId: item.requestId,
                operationType: item.operationType,
                targetIdentifier: item.targetIdentifier,
                payload: item.payload,
                failureReason: err.message || 'Unknown permanent error',
                httpStatus: err.status,
                errorCode: err.code,
                attempts: item.attempts + 1,
                createdAt: item.createdAt,
                movedToDLQAt: Date.now(),
              });
              await db.pendingAttachments.where('submissionId').equals(item.id!).delete();
              await db.pendingSubmissions.delete(item.id!);
            });
            logger.error('Moved to DeadLetter Queue', { requestId: item.requestId, error: err.message });
          } else {
            // Gagal transient -> kembalikan ke failed
            await db.pendingSubmissions.update(item.id!, {
              status: 'failed',
              lastError: err.message || 'Transient network error',
            });
            logger.error('Sync failed transiently', { requestId: item.requestId, attempts: item.attempts + 1 });
          }
        }
      }
    } finally {
      this.isProcessing = false;
      this.emit('sync-completed');
    }
  }

  // Stub executeServerAction - akan diikat secara nyata saat implementasi domain pastoral
  private async executeServerAction(item: PendingSubmission): Promise<{ success: boolean; error?: string; status?: number; code?: string }> {
    return dispatchSubmission(item);
  }
}

export const syncManager = new SyncManager();

export function setupSyncListener() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      syncManager.processQueue();
    });
  }
}
