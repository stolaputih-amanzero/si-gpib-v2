import { db } from './dexie';

/**
 * Proxy for submitting mutations with Offline-First support.
 * @param contractId The Contract ID (e.g. 'OC-PASTORAL-001')
 * @param payload The raw payload to submit
 * @param originContextId The currently active context ID at submission time
 * @param serverActionFn The Next.js Server Action to call if online
 */
export async function submitOrQueue<T>(
  contractId: string,
  payload: any,
  originContextId: string,
  serverActionFn: (payload: any) => Promise<T>
): Promise<{ status: 'ONLINE_SUCCESS' | 'QUEUED' | 'ERROR'; result?: T; error?: any }> {
  // Check online status
  const isOnline = typeof navigator !== 'undefined' && navigator.onLine;

  if (isOnline) {
    try {
      const result = await serverActionFn(payload);
      return { status: 'ONLINE_SUCCESS', result };
    } catch (error) {
      console.error('Online submission failed:', error);
      return { status: 'ERROR', error };
    }
  } else {
    // Offline Capture (Context Stamping)
    if (!originContextId) {
      console.error('Cannot queue mutation without an originContextId');
      return { status: 'ERROR', error: new Error('Missing Context ID for Offline Queue') };
    }

    try {
      await db.offlineQueue.add({
        id: crypto.randomUUID(),
        contractId,
        payload,
        originContextId,
        timestamp: Date.now(),
        retryCount: 0,
        status: 'PENDING'
      });

      // Dispatch an event to update badges (e.g. NetworkStatusBadge)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('offline-queue-updated'));
      }

      return { status: 'QUEUED' };
    } catch (error) {
      console.error('Failed to save to offline queue:', error);
      return { status: 'ERROR', error };
    }
  }
}
