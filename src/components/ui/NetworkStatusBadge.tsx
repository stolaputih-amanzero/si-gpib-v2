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
        'inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all duration-300 select-none border min-h-[40px]',
        showText ? 'px-2 py-0.5' : 'w-[40px] h-[40px]',
        isOnline
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          : 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 animate-pulse',
        className
      )}
      title={isOnline ? 'Terhubung ke Internet (Live Real-Time)' : 'Bekerja Mode Offline (Disimpan Lokal)'}
      aria-label={isOnline ? 'Status Online Live' : 'Status Offline'}
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        {isOnline ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
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
