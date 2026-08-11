'use client';

import React from 'react';
import { FileText, HardDrive, CheckCircle2, Clock } from 'lucide-react';
import { DocumentVaultSummaryViewModel } from '@/types/documentVaultViewModel.types';

interface DocumentVaultSummaryCardProps {
  summary: DocumentVaultSummaryViewModel;
}

export const DocumentVaultSummaryCard: React.FC<DocumentVaultSummaryCardProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
          <span className="text-xs font-medium">Total Dokumen</span>
          <FileText className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{summary.totalCount}</div>
        <div className="text-[11px] text-slate-500">Berkas Terlampir</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <span className="text-xs font-medium">Total Ukuran Storage</span>
          <HardDrive className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{summary.totalSizeFormatted}</div>
        <div className="text-[11px] text-slate-500">Kapasitas Terpakai</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <span className="text-xs font-medium">Dokumen Aktif</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{summary.activeCount}</div>
        <div className="text-[11px] text-slate-500">Terkonfirmasi Server</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
          <span className="text-xs font-medium">Pending Upload</span>
          <Clock className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{summary.pendingCount}</div>
        <div className="text-[11px] text-slate-500">Menunggu Biner</div>
      </div>
    </div>
  );
};
