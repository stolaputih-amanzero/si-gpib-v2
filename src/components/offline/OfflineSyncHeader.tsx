'use client';

import React from 'react';
import Link from 'next/link';
import { Wifi, WifiOff, RefreshCw, ArrowLeft, Wrench, CheckCircle2 } from 'lucide-react';
import { OfflineSyncSummaryViewModel } from '@/types/offlineSyncViewModel.types';

interface OfflineSyncHeaderProps {
  summary: OfflineSyncSummaryViewModel;
  onRefresh?: () => void;
}

export const OfflineSyncHeader: React.FC<OfflineSyncHeaderProps> = ({ summary, onRefresh }) => {
  return (
    <div className="bg-slate-900/90 border border-border-subtle rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Back Link & Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-border-subtle hover:bg-slate-800 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <Wrench className="w-3 h-3 text-blue-400" />
                Utilitas Sistem Internal
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              Utilitas Sistem: Sinkronisasi Offline
            </h1>
            <p className="text-xs text-slate-400">
              Manajer buffer draf formulir offline (<code className="font-mono text-slate-300">t_form_draft</code>) dan antrean sinkronisasi lokal.
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-border-subtle transition-colors shrink-0 min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Muat Ulang Status</span>
          </button>
        )}
      </div>

      <div className={`p-4 rounded-xl border flex items-center gap-3 ${
        summary.isOnline 
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
          : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
      }`}>
        {summary.isOnline ? <Wifi className="w-5 h-5 shrink-0 text-emerald-400" /> : <WifiOff className="w-5 h-5 shrink-0 text-amber-400" />}
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="text-xs font-bold flex items-center gap-2">
            <span>{summary.onlineStatusLabel}</span>
            {summary.totalPendingCount === 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Semua data tersinkronisasi
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">Sinkronisasi terakhir: {summary.lastSyncFormatted}</div>
        </div>
      </div>
    </div>
  );
};
