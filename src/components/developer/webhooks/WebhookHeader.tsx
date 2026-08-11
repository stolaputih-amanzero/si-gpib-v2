'use client';

import React from 'react';
import { Send, ShieldCheck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { WebhookWorkspaceViewModel } from '@/types/webhookEngineViewModel.types';

interface WebhookHeaderProps {
  vm: WebhookWorkspaceViewModel;
}

export const WebhookHeader: React.FC<WebhookHeaderProps> = ({ vm }) => {
  const isHealthy = !vm.metrics.overallHealthStatus.includes('PERINGATAN');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Asynchronous Outbound Webhook Delivery Engine (F11 Source ➔ HMAC-SHA256)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Send className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Integrasi Eksternal & Webhook Reliability Delivery
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pengiriman event notifikasi outbound ke endpoint pihak ketiga dengan HMAC-SHA256 signing, retry backoff, dan isolasi DLQ.
          </p>
        </div>

        {/* Engine Health Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`text-xs font-semibold px-3.5 py-2 rounded-xl border flex items-center gap-1.5 shadow-xs ${vm.metrics.overallHealthBadgeColor}`}
          >
            {isHealthy ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
            )}
            <span>{vm.metrics.overallHealthStatus}</span>
          </div>
        </div>
      </div>

      {/* Banner Metadata Info */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Prinsip Delivery: </span>
          <span className="font-bold text-slate-900 dark:text-slate-100">F11 Source • HMAC-SHA256 • Invariant #25 Asynchronous Isolation</span>
          <span className="text-slate-400 mx-1">|</span>
          <span className="text-slate-500">Engine Version: </span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">v1.0.0</span>
        </div>

        <span className="text-slate-500 text-[11px]">
          UI IS NOT DELIVERY EXECUTOR • Visual Inspeksi Murni
        </span>
      </div>
    </div>
  );
};
