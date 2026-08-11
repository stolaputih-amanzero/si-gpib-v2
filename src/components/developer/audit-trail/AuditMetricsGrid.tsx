'use client';

import React from 'react';
import { Database, Layers, CheckCircle2, AlertOctagon, Activity } from 'lucide-react';
import { AuditTrailWorkspaceViewModel } from '@/types/auditTrailViewModel.types';

interface AuditMetricsGridProps {
  vm: AuditTrailWorkspaceViewModel;
}

export const AuditMetricsGrid: React.FC<AuditMetricsGridProps> = ({ vm }) => {
  const { metrics } = vm;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <span className="text-[11px] font-medium">Total Evidence Logs</span>
          <Database className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.totalAuditLogs}</div>
        <div className="text-[10px] text-slate-500">Append-Only Records</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
          <span className="text-[11px] font-medium">Stream Terdaftar</span>
          <Layers className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.verifiedStreams}</div>
        <div className="text-[10px] text-slate-500">Active Audit Topics</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
          <span className="text-[11px] font-medium">Event Mutasi State</span>
          <Activity className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.mutationEventCount}</div>
        <div className="text-[10px] text-slate-500">State Changes</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
          <span className="text-[11px] font-medium">Otorisasi Penolakan (DENY)</span>
          <AlertOctagon className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.authorizationDenialCount}</div>
        <div className="text-[10px] text-slate-500">F12 Denied Provenance</div>
      </div>

      <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <span className="text-[11px] font-medium">Integritas Rantai</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{metrics.chainIntegrityStatus}</div>
        <div className="text-[10px] text-slate-500">RPC Verified Result</div>
      </div>
    </div>
  );
};
