// src/hooks/use-network-status.ts
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/offline/dexie';

export interface NetworkStatus {
  isOnline: boolean;
  pendingCount: number;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Use Dexie's live query to reactively watch pending submissions count
  const pendingCount = useLiveQuery(
    () => db.pendingSubmissions.where('status').anyOf('pending', 'failed').count(),
    [],
    0
  );

  useEffect(() => {
    // In browser environment, initialize network state
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return { isOnline, pendingCount };
}
