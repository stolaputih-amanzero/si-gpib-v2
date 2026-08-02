'use client';

import { Check, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DraftIndicatorProps {
  status: 'idle' | 'saving' | 'saved';
  pendingCount?: number;
  className?: string;
}

export function DraftIndicator({ status, pendingCount = 0, className }: DraftIndicatorProps) {
  if (status === 'idle' && pendingCount === 0) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs border',
        status === 'saving'
          ? 'bg-surface-sunken text-text-muted border-border-subtle'
          : pendingCount > 0
          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        className
      )}
    >
      {status === 'saving' ? (
        <>
          <Loader2 size={13} className="animate-spin text-brand-primary" />
          <span>Menyimpan...</span>
        </>
      ) : pendingCount > 0 ? (
        <>
          <Clock size={13} className="text-amber-500" />
          <span>{pendingCount} antrean offline</span>
        </>
      ) : (
        <>
          <Check size={13} className="text-emerald-500" />
          <span>Tersimpan di draft</span>
        </>
      )}
    </div>
  );
}

export default DraftIndicator;
