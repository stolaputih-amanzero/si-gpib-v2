'use client';

import React from 'react';
import { Activity, PlayCircle, CheckCircle2, AlertTriangle, Hash } from 'lucide-react';
import { TelemetryWorkspaceViewModel } from '@/types/telemetryStreamViewModel.types';

interface TelemetryStreamMetricsProps {
  vm: TelemetryWorkspaceViewModel;
}

export const TelemetryStreamMetrics: React.FC<TelemetryStreamMetricsProps> = ({ vm }) => {
  const { metrics } = vm;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
          <span className="text-[11px] font-medium">Total Telemetry Events</span>
          <Activity className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.totalEvents}</div>
        <div className="text-[10px] text-slate-500">Deduplicated Stream</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
          <span className="text-[11px] font-medium">Batch Dimulai</span>
          <PlayCircle className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.batchesStarted}</div>
        <div className="text-[10px] text-slate-500">Event batch.started</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <span className="text-[11px] font-medium">Batch Selesai</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.batchesCompleted}</div>
        <div className="text-[10px] text-slate-500">Event batch.completed</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
          <span className="text-[11px] font-medium">Total Baris Gagal</span>
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.rowsFailed}</div>
        <div className="text-[10px] text-slate-500">Event row.failed</div>
      </div>

      <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
          <span className="text-[11px] font-medium">Sequence Cursor</span>
          <Hash className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">#{vm.connection.lastSequence}</div>
        <div className="text-[10px] text-slate-500">Last Known Sequence</div>
      </div>
    </div>
  );
};
