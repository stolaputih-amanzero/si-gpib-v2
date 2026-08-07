'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/offline/dexie';

export function useOfflineQueue() {
  const pendingSubmissions = useLiveQuery(
    () => db.pendingSubmissions.orderBy('createdAt').toArray(),
    []
  );
  const pendingAttachments = useLiveQuery(() => db.pendingAttachments.toArray(), []);
  const deadLetters = useLiveQuery(
    () => db.deadLetters.orderBy('movedToDLQAt').reverse().toArray(),
    []
  );

  return {
    pendingSubmissions: pendingSubmissions ?? [],
    pendingAttachments: pendingAttachments ?? [],
    deadLetters: deadLetters ?? [],
    pendingCount: pendingSubmissions?.length ?? 0,
    dlqCount: deadLetters?.length ?? 0,
    isLoading: pendingSubmissions === undefined,
  };
}
