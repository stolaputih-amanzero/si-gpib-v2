'use client';

import React from 'react';
import { ShieldCheck, FileCode, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AuditTrailWorkspaceViewModel } from '@/types/auditTrailViewModel.types';

interface AuditHeaderProps {
  vm: AuditTrailWorkspaceViewModel;
  onOpenVerificationModal: () => void;
}

export const AuditHeader: React.FC<AuditHeaderProps> = ({ vm, onOpenVerificationModal }) => {
  const isVerified = vm.metrics.chainIntegrityStatus.includes('TERVERIFIKASI');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Immutable Audit Evidence Engine (prev_hash ➔ curr_hash)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileCode className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Jejak Audit Kriptografi & Rekonstruksi Komputasi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Penyimpanan bukti transaksi imutabel terikat SHA-256 hash-chaining, F12 policy provenance, dan Zero-PII redaction.
          </p>
        </div>

        {/* Chain Integrity Status Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenVerificationModal}
            className={`text-xs font-semibold px-3.5 py-2 rounded-xl border flex items-center gap-1.5 shadow-xs transition-all hover:scale-102 ${vm.metrics.integrityBadgeColor}`}
          >
            {isVerified ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
            )}
            <span>{vm.metrics.chainIntegrityStatus}</span>
          </button>
        </div>
      </div>

      {/* Banner Metadata Info */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Prinsip Audit: </span>
          <span className="font-bold text-slate-900 dark:text-slate-100">Append-Only • Hash-Chain SHA-256 • Fail-Closed</span>
          <span className="text-slate-400 mx-1">|</span>
          <span className="text-slate-500">Evidence Version: </span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">v1.0.0</span>
        </div>

        <span className="text-slate-500 text-[11px]">
          UI IS NOT EVIDENCE AUTHORITY • Visual Inspeksi Murni
        </span>
      </div>
    </div>
  );
};
