'use client';

import { useState, useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';

interface NetworkStatusBadgeProps {
  className?: string;
  showText?: boolean;
}

export function NetworkStatusBadge({ className, showText = true }: NetworkStatusBadgeProps) {
  const isOnline = useNetworkStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold transition-all duration-300 select-none border',
        isOnline
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          : 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 animate-pulse',
        className
      )}
      title={isOnline ? 'Terhubung ke Internet (Live Real-Time)' : 'Bekerja Mode Offline (Disimpan Lokal)'}
      aria-label={isOnline ? 'Status Online Live' : 'Status Offline'}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {isOnline ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        )}
      </span>

      {showText && (
        <span className="tracking-wider uppercase text-[10px] font-black leading-none">
          {isOnline ? 'Live' : 'Offline'}
        </span>
      )}
    </div>
  );
}

export default NetworkStatusBadge;
