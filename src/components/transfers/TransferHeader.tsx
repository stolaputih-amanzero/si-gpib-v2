'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, UserCheck, PlusCircle } from 'lucide-react';
import { PastoralTransferWorkspaceViewModel } from '@/types/pastoralTransferViewModel.types';

interface TransferHeaderProps {
  vm: PastoralTransferWorkspaceViewModel;
  onOpenProposalModal: () => void;
}

export const TransferHeader: React.FC<TransferHeaderProps> = ({ vm, onOpenProposalModal }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              Pastoral Transfer & Relocation Engine (Dual-Context Authority)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-500" />
            {vm.transfer.nama_lengkap}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pengelolaan mutasi pendeta lintas konteks organisasi dengan kontinuitas histori pelayanan.
          </p>
        </div>

        <button
          onClick={onOpenProposalModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Usulan Mutasi Baru</span>
        </button>
      </div>

      {/* Dual Context Visual Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Releasing Context (Organisasi Asal)</div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{vm.transfer.nama_org_asal}</div>
        </div>

        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
          <ArrowRight className="w-5 h-5" />
        </div>

        <div className="space-y-0.5 text-center sm:text-right">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Receiving Context (Organisasi Tujuan)</div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{vm.transfer.nama_org_tujuan}</div>
        </div>
      </div>
    </div>
  );
};
