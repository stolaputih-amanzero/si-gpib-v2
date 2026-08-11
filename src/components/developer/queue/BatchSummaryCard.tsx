'use client';

import React from 'react';
import { Layers, CheckCircle2, AlertTriangle, CheckCheck, XCircle } from 'lucide-react';
import { BatchProcessingWorkspaceViewModel } from '@/types/batchProcessingViewModel.types';

interface BatchSummaryCardProps {
  vm: BatchProcessingWorkspaceViewModel;
}

export const BatchSummaryCard: React.FC<BatchSummaryCardProps> = ({ vm }) => {
  const { summaryMetrics } = vm;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-[11px] font-medium">Total Baris Staging</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{summaryMetrics.totalRows}</div>
          <div className="text-[10px] text-slate-500">Record Quarantined</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-[11px] font-medium">Lulus Dry-Run</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{summaryMetrics.validCount}</div>
          <div className="text-[10px] text-slate-500">Status VALID</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-[11px] font-medium">Format Invalid</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{summaryMetrics.invalidCount}</div>
          <div className="text-[10px] text-slate-500">Perlu Perbaikan</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[11px] font-medium">Berhasil Mutasi</span>
            <CheckCheck className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{summaryMetrics.committedCount}</div>
          <div className="text-[10px] text-slate-500">Status COMMITTED</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-[11px] font-medium">Gagal Execution</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{summaryMetrics.failedCount}</div>
          <div className="text-[10px] text-slate-500">Meminta Rekonsiliasi</div>
        </div>
      </div>

      {/* Progress Bar Visual */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Progres Mutasi Batch Ke Domain</span>
          <span>{summaryMetrics.progressPercentFormatted} ({summaryMetrics.committedCount} / {summaryMetrics.totalRows} Baris)</span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-500 rounded-full"
            style={{ width: `${summaryMetrics.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
