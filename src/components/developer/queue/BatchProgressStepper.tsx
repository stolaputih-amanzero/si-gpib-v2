'use client';

import React from 'react';
import { BatchProcessingWorkspaceViewModel } from '@/types/batchProcessingViewModel.types';
import { Upload, CheckCircle2, Eye, Play, AlertOctagon } from 'lucide-react';

interface BatchProgressStepperProps {
  vm: BatchProcessingWorkspaceViewModel;
  onRunDryRun: () => Promise<void>;
  onExecuteChunk: () => Promise<void>;
}

export const BatchProgressStepper: React.FC<BatchProgressStepperProps> = ({
  vm,
  onRunDryRun,
  onExecuteChunk
}) => {
  const status = vm.summaryMetrics.lifecycleStatus;
  const isUploaded = status === 'UPLOADED';
  const isValidating = status === 'VALIDATING';
  const isValidated = status === 'VALIDATED';
  const isExecuting = status === 'EXECUTING';
  const isCompleted = status === 'COMPLETED';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Tahapan Lifecycle Mutasi Massal</h2>
          <p className="text-xs text-slate-500">Alur staging terisolasi ➔ Validasi Dry-Run ➔ Eksekusi Chunked</p>
        </div>

        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${vm.summaryMetrics.lifecycleStatusBadgeColor}`}>
          {vm.summaryMetrics.lifecycleStatusLabel}
        </span>
      </div>

      {/* Stepper Grid Visual */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
        <div className={`p-3 rounded-xl border space-y-1 ${isUploaded || isValidating || isValidated || isExecuting || isCompleted ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Upload className="w-4 h-4" />
            <span>1. Staged Upload</span>
          </div>
          <div className="text-[11px] opacity-80">Quarantine di Staging</div>
        </div>

        <div className={`p-3 rounded-xl border space-y-1 ${isValidated || isExecuting || isCompleted ? 'bg-purple-50/50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300' : isValidating ? 'bg-amber-50 border-amber-300 animate-pulse text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Eye className="w-4 h-4" />
            <span>2. Dry-Run Check</span>
          </div>
          <div className="text-[11px] opacity-80">Validasi Tanpa Commit</div>
        </div>

        <div className={`p-3 rounded-xl border space-y-1 ${isExecuting || isCompleted ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Play className="w-4 h-4" />
            <span>3. Execute Chunk</span>
          </div>
          <div className="text-[11px] opacity-80">100 Row / Transaksi</div>
        </div>

        <div className={`p-3 rounded-xl border space-y-1 ${isCompleted ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>4. Completed</span>
          </div>
          <div className="text-[11px] opacity-80">Mutasi Domain Selesai</div>
        </div>
      </div>

      {/* Interactive Command Trigger Bar */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs text-slate-500">
          {isUploaded && <span>Klik jalankan Dry-Run untuk memeriksa keabsahan data tanpa mengubah database domain.</span>}
          {isValidated && !vm.canExecuteBatch && (
            <span className="text-amber-600 font-medium flex items-center gap-1">
              <AlertOctagon className="w-4 h-4" />
              Kebijakan ALL_OR_NOTHING memblokir eksekusi karena terdapat baris invalid.
            </span>
          )}
          {isValidated && vm.canExecuteBatch && <span>Data tervalidasi siap dieksekusi ke dalam tabel domain produksi.</span>}
          {isCompleted && <span className="text-emerald-600 font-semibold">Seluruh baris valid telah sukses di-commit.</span>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isUploaded && (
            <button
              onClick={onRunDryRun}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors"
            >
              Jalankan Validasi Dry-Run
            </button>
          )}

          {isValidated && (
            <button
              onClick={onExecuteChunk}
              disabled={!vm.canExecuteBatch}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-40 disabled:hover:bg-blue-600"
            >
              Eksekusi Chunk Batch
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
