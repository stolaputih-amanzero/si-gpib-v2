'use client';

import { useState, useEffect, useCallback } from 'react';
import { db, type PendingSubmission } from '@/lib/offline/dexie';
import { logger } from '@/lib/utils/logger';
import { uuidv7 } from 'uuidv7';

export const RETRY_DELAYS = [1000, 5000, 15000, 30000, 60000];

export function usePendingSubmissions() {
  const [pendingQueue, setPendingQueue] = useState<PendingSubmission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadQueue = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await db.pendingSubmissions.toArray();
      setPendingQueue(items);
    } catch (error) {
      logger.error('[PendingSubmissions] Failed to load queue', error);
      setPendingQueue([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const addPendingSubmission = useCallback(async (operationType: 'rpc' | 'insert' | 'update', targetIdentifier: string, payload: Record<string, unknown>) => {
    const newSubmission: PendingSubmission = {
      requestId: uuidv7(),
      operationType,
      targetIdentifier,
      payload,
      status: 'pending',
      attempts: 0,
      createdAt: Date.now(),
    };

    try {
      await db.pendingSubmissions.add(newSubmission);
      await loadQueue();
    } catch (error) {
      logger.error('[PendingSubmissions] Failed to add submission', error);
      // Optimistic UI update even on Dexie failure
      setPendingQueue((prev) => [...prev, newSubmission]);
    }
  }, [loadQueue]);

  const removePendingSubmission = useCallback(async (id: number) => {
    try {
      await db.pendingSubmissions.delete(id);
      await loadQueue();
    } catch (error) {
      logger.error('[PendingSubmissions] Failed to remove submission', error);
      setPendingQueue((prev) => prev.filter((item) => item.id !== id));
    }
  }, [loadQueue]);

  const clearPendingQueue = useCallback(async () => {
    try {
      await db.pendingSubmissions.clear();
      setPendingQueue([]);
    } catch (error) {
      logger.error('[PendingSubmissions] Failed to clear queue', error);
    }
  }, []);

  return {
    pendingQueue,
    pendingCount: pendingQueue.length,
    isLoading,
    retryDelays: RETRY_DELAYS,
    addPendingSubmission,
    removePendingSubmission,
    clearPendingQueue,
  };
}
