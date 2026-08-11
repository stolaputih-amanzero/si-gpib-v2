'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Activity, Percent } from 'lucide-react';
import { AccessControlWorkspaceViewModel } from '@/types/accessControlViewModel.types';

interface PolicyEvaluationMetricsProps {
  vm: AccessControlWorkspaceViewModel;
}

export const PolicyEvaluationMetrics: React.FC<PolicyEvaluationMetricsProps> = ({ vm }) => {
  const { metrics } = vm;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
          <span className="text-[11px] font-medium">Total Aturan Kebijakan</span>
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.totalPolicies}</div>
        <div className="text-[10px] text-slate-500">Policy Rules Actively Loaded</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
          <span className="text-[11px] font-medium">Evaluasi PDP Total</span>
          <Activity className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.evaluatedRequests}</div>
        <div className="text-[10px] text-slate-500">Requests Evaluated</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <span className="text-[11px] font-medium">Keputusan ALLOW</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.allowedCount}</div>
        <div className="text-[10px] text-slate-500">Explicit Allowed</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
          <span className="text-[11px] font-medium">Keputusan DENY</span>
          <XCircle className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.deniedCount}</div>
        <div className="text-[10px] text-slate-500">Denied / Rejected</div>
      </div>

      <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
          <span className="text-[11px] font-medium">Allow Rate %</span>
          <Percent className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.allowRateFormatted}</div>
        <div className="text-[10px] text-slate-500">Success Ratio</div>
      </div>
    </div>
  );
};
