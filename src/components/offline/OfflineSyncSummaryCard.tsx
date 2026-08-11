'use client';

import React from 'react';
import { Clock, RefreshCw, AlertTriangle, XCircle } from 'lucide-react';
import { OfflineSyncSummaryViewModel } from '@/types/offlineSyncViewModel.types';

interface OfflineSyncSummaryCardProps {
  summary: OfflineSyncSummaryViewModel;
}

export const OfflineSyncSummaryCard: React.FC<OfflineSyncSummaryCardProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
          <span className="text-xs font-medium">Antrian Queued</span>
          <Clock className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{summary.queuedCount}</div>
        <div className="text-[11px] text-slate-500">Menunggu Koneksi</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
          <span className="text-xs font-medium">Sedang Syncing</span>
          <RefreshCw className="w-4 h-4 animate-spin" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{summary.syncingCount}</div>
        <div className="text-[11px] text-slate-500">Proses Transmisi</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
          <span className="text-xs font-medium">Konflik Domain</span>
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{summary.conflictCount}</div>
        <div className="text-[11px] text-slate-500">Ditolak Server</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-medium">Gagal Terkirim</span>
          <XCircle className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{summary.failedCount}</div>
        <div className="text-[11px] text-slate-500">Error Sistem</div>
      </div>
    </div>
  );
};
