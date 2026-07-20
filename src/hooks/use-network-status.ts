'use client';

import { useState, useEffect } from 'react';
import { useMutationState } from '@tanstack/react-query';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Accurately count paused or pending mutations in TanStack Query
  const pendingMutations = useMutationState({
    filters: { status: 'pending' },
    select: (mutation) => mutation.state.status,
  });

  const pendingCount = pendingMutations.length;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]); // Short double tap on reconnect
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]); // Warning vibration on disconnect
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    pendingCount,
  };
}
