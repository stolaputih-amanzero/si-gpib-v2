'use client';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { Save, WifiOff, CheckCircle2, Trash2 } from 'lucide-react';

interface OfflineIndicatorProps {
  relativeTime?: string | null;
  hasRestoredDraft?: boolean;
  onClearDraft?: () => void;
}

export function OfflineIndicator({
  relativeTime,
  hasRestoredDraft,
  onClearDraft,
}: OfflineIndicatorProps) {
  const { isOnline } = useNetworkStatus();

  if (!relativeTime && isOnline) return null;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-sunken border border-border-subtle text-xs">
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
            <WifiOff size={14} className="shrink-0" />
            <span>Mode Offline</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>Online</span>
          </span>
        )}

        {relativeTime && (
          <span className="text-text-muted flex items-center gap-1 border-l border-border-subtle pl-2">
            <Save size={12} className="shrink-0 text-brand-primary" />
            <span>
              {hasRestoredDraft ? 'Draf lama dipulihkan' : 'Draf tersimpan'} ({relativeTime})
            </span>
          </span>
        )}
      </div>

      {onClearDraft && relativeTime && (
        <button
          type="button"
          onClick={onClearDraft}
          className="p-1 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1 text-[11px] font-semibold"
          title="Hapus Draf"
        >
          <Trash2 size={13} />
          <span className="hidden sm:inline">Hapus Draf</span>
        </button>
      )}
    </div>
  );
}
