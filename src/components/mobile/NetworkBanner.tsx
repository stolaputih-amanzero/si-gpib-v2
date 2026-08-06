// src/components/mobile/NetworkBanner.tsx
'use client';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { WifiOff, RefreshCw } from 'lucide-react';
import { syncManager } from '@/lib/offline/sync-manager';

export function NetworkBanner() {
  const { isOnline, pendingCount } = useNetworkStatus();

  // If online and no pending items, don't show the banner
  if (isOnline && pendingCount === 0) return null;

  // Determine banner state
  const isOffline = !isOnline;

  // Colors based on state: 
  // Offline = Amber (warning)
  // Syncing = Blue/Green (processing)
  const bannerClasses = isOffline
    ? 'bg-amber-100 text-amber-900 border-b border-amber-200'
    : 'bg-blue-50 text-blue-900 border-b border-blue-200';

  return (
    <div className={`sticky top-0 z-50 w-full px-4 py-2 flex items-center justify-between text-sm ${bannerClasses}`}>
      <div className="flex items-center gap-2">
        {isOffline ? (
          <WifiOff className="w-4 h-4 text-amber-700" />
        ) : (
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
        )}
        <span className="font-medium">
          {isOffline
            ? `Offline — ${pendingCount} data menunggu`
            : `Menyinkronkan ${pendingCount} data...`}
        </span>
      </div>
      
      {isOffline && pendingCount > 0 && (
        <button
          onClick={() => {
            // Manual retry trigger (will only work if device actually has some connection despite navigator.onLine)
            syncManager.processQueue();
          }}
          className="text-xs font-semibold bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded transition-colors"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}
