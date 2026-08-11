'use client';

import React from 'react';
import { Database, UploadCloud, ShieldCheck, Layers } from 'lucide-react';
import { BatchProcessingWorkspaceViewModel } from '@/types/batchProcessingViewModel.types';

interface BatchHeaderProps {
  vm: BatchProcessingWorkspaceViewModel;
  onOpenUploadModal: () => void;
}

export const BatchHeader: React.FC<BatchHeaderProps> = ({ vm, onOpenUploadModal }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              Mass Import & Bulk Batch Mutation Subsystem
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-500" />
            Antrean Mutasi Massal (Bulk Processing Queue)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pengelolaan impor data massal terisolasi di sys_batch_staging dengan validasi Dry-Run & eksekusi chunked.
          </p>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Batch Impor Baru</span>
        </button>
      </div>

      {vm.hasData && (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-slate-500">ID Batch Active: </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{vm.id_batch}</span>
            <span className="text-slate-400 mx-1">|</span>
            <span className="text-slate-500">Target Entitas: </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{vm.targetEntityLabel}</span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${vm.summaryMetrics.atomicityPolicyBadgeColor}`}>
            {vm.summaryMetrics.atomicityPolicyLabel}
          </span>
        </div>
      )}
    </div>
  );
};
