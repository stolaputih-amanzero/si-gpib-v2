'use client';

import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertOctagon } from 'lucide-react';
import { AccessControlWorkspaceViewModel } from '@/types/accessControlViewModel.types';

interface AccessControlHeaderProps {
  vm: AccessControlWorkspaceViewModel;
}

export const AccessControlHeader: React.FC<AccessControlHeaderProps> = ({ vm: _vm }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Hierarchical Access Control & Policy Engine (RBAC/ABAC)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Manajemen Kontrol Akses & Inspeksi Kebijakan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Observabilitas Policy Decision Point (PDP) server-side terikat RLS PostgreSQL & hirarki organisasi generik.
          </p>
        </div>

        {/* Engine Status Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>PDP Active & Enforced</span>
          </span>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-purple-600" />
            <span>Fail Closed (Deny by Default)</span>
          </span>
        </div>
      </div>

      {/* Banner Metadata Info */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Prinsip Keamanan: </span>
          <span className="font-bold text-slate-900 dark:text-slate-100">Zero Client Authority & PDP/PEP Separation</span>
          <span className="text-slate-400 mx-1">|</span>
          <span className="text-slate-500">Policy Version: </span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">v1.0.0</span>
        </div>

        <span className="text-slate-500 text-[11px]">
          UI IS NOT ENFORCER • Visual Inspeksi Murni
        </span>
      </div>
    </div>
  );
};
