'use client';

import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { OfflineSyncSummaryViewModel } from '@/types/offlineSyncViewModel.types';

interface OfflineSyncHeaderProps {
  summary: OfflineSyncSummaryViewModel;
  onRefresh?: () => void;
}

export const OfflineSyncHeader: React.FC<OfflineSyncHeaderProps> = ({ summary, onRefresh }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              PWA Transport Resilience Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Offline Command Queue & Sync Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor antrian perintah lokal PWA (IndexedDB) dan sinkronisasi otomatis ke server.
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Ulang Status</span>
          </button>
        )}
      </div>

      <div className={`p-4 rounded-xl border flex items-center gap-3 ${
        summary.isOnline 
          ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
          : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
      }`}>
        {summary.isOnline ? <Wifi className="w-5 h-5 shrink-0 text-emerald-600" /> : <WifiOff className="w-5 h-5 shrink-0 text-amber-600" />}
        <div className="space-y-0.5">
          <div className="text-xs font-bold">{summary.onlineStatusLabel}</div>
          <div className="text-[11px] opacity-80">Sinkronisasi terakhir: {summary.lastSyncFormatted}</div>
        </div>
      </div>
    </div>
  );
};
