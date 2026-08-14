import * as React from 'react';
import { Database, Cloud, CheckCircle2, ArrowLeftRight, Wifi, ShieldCheck, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SyncItem {
  id: string;
  title: string;
  category: string;
  status: 'synced' | 'pending' | 'syncing';
  timestamp?: string;
}

export interface SyncFlowShowcaseProps extends React.HTMLAttributes<HTMLDivElement> {
  localDbName?: string;
  cloudDbName?: string;
  queueCount?: number;
  items?: SyncItem[];
}

const defaultItems: SyncItem[] = [
  { id: '1', title: 'Target Indikator Kuantitatif Pelayanan', category: 'Indikator', status: 'synced' },
  { id: '2', title: 'Jurnal Pengeluaran Bidang Teologi', category: 'Keuangan', status: 'synced' },
  { id: '3', title: 'Kas Masuk Program Sosial Diakonia', category: 'Perbendaharaan', status: 'synced' },
];

export const SyncFlowShowcase = React.forwardRef<HTMLDivElement, SyncFlowShowcaseProps>(
  (
    {
      className,
      localDbName = 'Dexie / SQLite',
      cloudDbName = 'Supabase Cloud',
      queueCount = 153,
      items = defaultItems,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full max-w-md mx-auto rounded-3xl bg-surface-1 border border-amber-900/10 dark:border-stone-800 p-5 sm:p-6 shadow-sm space-y-5 text-ink-primary',
          className
        )}
        {...props}
      >
        {/* Card Top Header */}
        <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <Layers className="size-4" />
            </div>
            <div>
              <h4 className="micro-label text-ink-primary font-bold">FLOW SYNC ENGINE</h4>
              <p className="text-[10px] text-ink-tertiary">SI GPIB Realtime Sync Protocol</p>
            </div>
          </div>

          <div className="text-right">
            <span className="micro-label text-ink-tertiary block text-[9px]">Queue Count</span>
            <span className="font-editorial text-sm font-bold text-amber-700 dark:text-amber-400 tnum">
              {queueCount}
            </span>
          </div>
        </div>

        {/* Sync Pipeline Diagram */}
        <div className="grid grid-cols-3 items-center gap-2 py-2">
          {/* Local DB Node */}
          <div className="flex flex-col items-center p-3 rounded-2xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800 text-center">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 mb-1.5">
              <Database className="size-4" />
            </div>
            <span className="text-xs font-semibold text-ink-primary">{localDbName}</span>
            <span className="text-[10px] text-ink-tertiary">Offline DB</span>
          </div>

          {/* Sync Indicator */}
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 animate-pulse">
              <ArrowLeftRight className="size-3.5" />
            </div>
            <span className="text-[9px] uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400">
              Syncing
            </span>
          </div>

          {/* Cloud DB Node */}
          <div className="flex flex-col items-center p-3 rounded-2xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800 text-center">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 mb-1.5">
              <Cloud className="size-4" />
            </div>
            <span className="text-xs font-semibold text-ink-primary">{cloudDbName}</span>
            <span className="text-[10px] text-ink-tertiary">Central Host</span>
          </div>
        </div>

        {/* Offline Cache Status Pill */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20">
          <div className="flex items-center gap-2">
            <Wifi className="size-3.5 text-amber-600 dark:text-amber-400" />
            <span className="micro-label text-amber-800 dark:text-amber-300">
              Offline Cache Active
            </span>
          </div>
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
        </div>

        {/* Local Queue & Synchronization Log */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="micro-label text-ink-tertiary text-[9px]">
              Local Queue &amp; Synchronization Log
            </span>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/50 dark:border-stone-800/60 hover:bg-surface-sunken transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="size-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-xs font-medium text-ink-primary truncate">
                    {item.title}
                  </span>
                </div>

                <div className="shrink-0 flex items-center">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
SyncFlowShowcase.displayName = 'SyncFlowShowcase';
