'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/offline/dexie';
import { flushOfflineQueueAction } from '@/app/actions/offline-sync';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';

export function useSyncManager() {
  const [syncing, setSyncing] = useState(false);

  const queuedItems = useLiveQuery(
    () => db.offlineQueue.toArray(),
    []
  ) || [];

  const pendingCount = queuedItems.filter(item => item.status === 'PENDING').length;
  const failedCount = queuedItems.filter(item => item.status === 'FAILED').length;

  const processQueue = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    const pendingRecords = await db.offlineQueue
      .where('status')
      .equals('PENDING')
      .toArray();

    if (pendingRecords.length === 0) return;

    setSyncing(true);

    try {
      // Process in batches of 10
      for (let i = 0; i < pendingRecords.length; i += 10) {
        const batch = pendingRecords.slice(i, i + 10);
        
        // Mark as syncing in UI
        await Promise.all(batch.map(r => db.offlineQueue.update(r.id!, { status: 'SYNCING' })));

        const payload = batch.map(r => ({
          queue_id: r.id!,
          contract_id: r.contractId,
          target_entity: {
            entity_type: r.contractId.includes('PASTORAL') ? 'Pastoral' : 'Unknown',
            entity_id: null,
            owning_context_id: r.originContextId
          },
          operation_payload: r.payload,
          origin_context_id: r.originContextId,
          timestamp: r.timestamp
        }));

        const results = await flushOfflineQueueAction(payload);

        // Process results
        for (const res of results) {
          if (res.status === 'SUCCESS') {
            await db.offlineQueue.delete(res.queue_id);
            toast.success('Sinkronisasi Berhasil', { description: `Data berhasil dikirim ke server.` });
          } else if (res.status === 'REJECTED') {
            await db.offlineQueue.update(res.queue_id, {
              status: 'FAILED',
              error_code: res.error_code || 'REJECTED',
              error_detail: res.error_detail || 'Ditolak oleh server'
            });
            toast.error('Sinkronisasi Gagal', { description: res.error_detail || 'Data ditolak oleh server.' });
          } else {
            // FAILED (Network or internal error) -> revert to PENDING
            const record = await db.offlineQueue.get(res.queue_id);
            if (record) {
              await db.offlineQueue.update(res.queue_id, {
                status: 'PENDING',
                retryCount: record.retryCount + 1
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Network error during sync:', error);
      // Revert SYNCING to PENDING
      const syncingRecords = await db.offlineQueue.where('status').equals('SYNCING').toArray();
      await Promise.all(syncingRecords.map(r => db.offlineQueue.update(r.id!, { status: 'PENDING', retryCount: r.retryCount + 1 })));
    } finally {
      setSyncing(false);
    }
  }, []);

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => {
      processQueue();
    };

    window.addEventListener('online', handleOnline);
    
    // Also listen to manual queue updates
    const handleQueueUpdate = () => {
      if (navigator.onLine) {
        processQueue();
      }
    };
    window.addEventListener('offline-queue-updated', handleQueueUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline-queue-updated', handleQueueUpdate);
    };
  }, [processQueue]);

  const discardItem = async (id: string) => {
    await db.offlineQueue.delete(id);
    toast.success('Data Dibuang', { description: 'Data antrean telah dihapus permanen.' });
  };

  const retryItem = async (id: string) => {
    await db.offlineQueue.update(id, { status: 'PENDING', retryCount: 0 });
    if (navigator.onLine) {
      processQueue();
    } else {
      toast.info('Offline', { description: 'Menunggu koneksi internet untuk mencoba ulang.' });
    }
  };

  return {
    queuedItems,
    pendingCount,
    failedCount,
    syncing,
    processQueue,
    discardItem,
    retryItem
  };
}
