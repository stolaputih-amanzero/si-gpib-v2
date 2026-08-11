'use client';

import React from 'react';
import { Globe, Send, CheckCircle2, RotateCw, AlertTriangle } from 'lucide-react';
import { WebhookWorkspaceViewModel } from '@/types/webhookEngineViewModel.types';

interface WebhookMetricsGridProps {
  vm: WebhookWorkspaceViewModel;
}

export const WebhookMetricsGrid: React.FC<WebhookMetricsGridProps> = ({ vm }) => {
  const { metrics } = vm;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
          <span className="text-[11px] font-medium">Total Endpoint</span>
          <Globe className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.totalEndpoints}</div>
        <div className="text-[10px] text-slate-500">{metrics.activeEndpoints} Aktif</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
          <span className="text-[11px] font-medium">Total Outbound Delivery</span>
          <Send className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.totalDeliveries}</div>
        <div className="text-[10px] text-slate-500">Queued & Processed</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <span className="text-[11px] font-medium">Delivery Sukses</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.successfulDeliveries}</div>
        <div className="text-[10px] text-slate-500">2xx HTTP Response</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
          <span className="text-[11px] font-medium">Dalam Retry Queue</span>
          <RotateCw className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.retryingDeliveries}</div>
        <div className="text-[10px] text-slate-500">Exponential Backoff</div>
      </div>

      <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
          <span className="text-[11px] font-medium">Dead-Letter Queue (DLQ)</span>
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.dlqDeliveries}</div>
        <div className="text-[10px] text-slate-500">Requires DLQ Replay</div>
      </div>
    </div>
  );
};
