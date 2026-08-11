'use client';

import React from 'react';
import { History, CheckCircle2, Building2 } from 'lucide-react';
import { PastoralTransferWorkspaceViewModel } from '@/types/pastoralTransferViewModel.types';

interface TransferSummaryCardProps {
  vm: PastoralTransferWorkspaceViewModel;
}

export const TransferSummaryCard: React.FC<TransferSummaryCardProps> = ({ vm }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
          <span className="text-xs font-medium">Total Penugasan Historis</span>
          <History className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{vm.summaryMetrics.totalAssignments}</div>
        <div className="text-[11px] text-slate-500">Rekam Pelayanan Lintas Pos</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <span className="text-xs font-medium">Penugasan Terkonfirmasi</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{vm.summaryMetrics.completedAssignmentsCount}</div>
        <div className="text-[11px] text-slate-500">Selesai Berstatus TRANSFERRED</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
          <span className="text-xs font-medium">Pos Aktif Saat Ini</span>
          <Building2 className="w-4 h-4" />
        </div>
        <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{vm.summaryMetrics.activeAssignmentOrg}</div>
        <div className="text-[11px] text-slate-500">Pos Pelkes / Jemaat Induk</div>
      </div>
    </div>
  );
};
