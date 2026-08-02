'use client';

import { useState, useEffect, useCallback } from 'react';

export interface PendingSubmission {
  id: string;
  formType: string;
  payload: any;
  timestamp: string;
  attempts: number;
}

const STORAGE_KEY = 'si_gpib_pending_submissions';
export const RETRY_DELAYS = [1000, 5000, 15000, 30000, 60000];

export function usePendingSubmissions() {
  const [pendingQueue, setPendingQueue] = useState<PendingSubmission[]>([]);

  const loadQueue = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setPendingQueue(JSON.parse(raw));
      }
    } catch {
      setPendingQueue([]);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const addPendingSubmission = useCallback((formType: string, payload: any) => {
    if (typeof window === 'undefined') return;
    const newSubmission: PendingSubmission = {
      id: `pending-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      formType,
      payload,
      timestamp: new Date().toISOString(),
      attempts: 0,
    };

    setPendingQueue((prev) => {
      const updated = [...prev, newSubmission];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removePendingSubmission = useCallback((id: string) => {
    if (typeof window === 'undefined') return;
    setPendingQueue((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearPendingQueue = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    setPendingQueue([]);
  }, []);

  return {
    pendingQueue,
    pendingCount: pendingQueue.length,
    retryDelays: RETRY_DELAYS,
    addPendingSubmission,
    removePendingSubmission,
    clearPendingQueue,
  };
}
