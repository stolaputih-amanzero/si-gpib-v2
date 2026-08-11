'use client';

import React from 'react';
import { PastoralTransferItemViewModel } from '@/types/pastoralTransferViewModel.types';
import { CheckCircle2, Clock, MapPin } from 'lucide-react';

interface TransferLifecycleProgressProps {
  transfer: PastoralTransferItemViewModel;
  onApprove: (idMutasi: string) => Promise<void>;
  onDeploy: (idMutasi: string) => Promise<void>;
}

export const TransferLifecycleProgress: React.FC<TransferLifecycleProgressProps> = ({
  transfer,
  onApprove,
  onDeploy
}) => {
  const isProposed = transfer.status_mutasi === 'PROPOSED';
  const isApproved = transfer.status_mutasi === 'APPROVED_SINODE';
  const isDeployed = transfer.status_mutasi === 'DEPLOYED';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Tahapan Progress Lifecycle Mutasi</h2>
          <p className="text-xs text-slate-500">Alur proposal persetujuan Sinode dan penempatan SK fisik</p>
        </div>

        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${transfer.statusBadgeColor}`}>
          {transfer.statusLabel}
        </span>
      </div>

      {/* Stepper Visual */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className={`p-3 rounded-xl border space-y-1 ${isProposed || isApproved || isDeployed ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Clock className="w-4 h-4" />
            <span>1. Proposed</span>
          </div>
          <div className="text-[11px] opacity-80">Usulan Awal</div>
        </div>

        <div className={`p-3 rounded-xl border space-y-1 ${isApproved || isDeployed ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>2. Approved</span>
          </div>
          <div className="text-[11px] opacity-80">Persetujuan Sinode</div>
        </div>

        <div className={`p-3 rounded-xl border space-y-1 ${isDeployed ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <MapPin className="w-4 h-4" />
            <span>3. Deployed</span>
          </div>
          <div className="text-[11px] opacity-80">Penempatan SK Aktif</div>
        </div>
      </div>

      {/* Action Buttons for Command Invocations */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        {isProposed && (
          <button
            onClick={() => onApprove(transfer.id_mutasi)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            Setujui Mutasi (Sinode Authority)
          </button>
        )}

        {isApproved && (
          <button
            onClick={() => onDeploy(transfer.id_mutasi)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            Terbitkan SK Penempatan (Deploy Atomik)
          </button>
        )}
      </div>
    </div>
  );
};
