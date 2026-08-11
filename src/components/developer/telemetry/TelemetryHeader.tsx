'use client';

import React from 'react';
import { Activity, ShieldCheck, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { TelemetryWorkspaceViewModel } from '@/types/telemetryStreamViewModel.types';

interface TelemetryHeaderProps {
  vm: TelemetryWorkspaceViewModel;
  onSimulateDisconnect: () => void;
  onTriggerReplay: () => void;
}

export const TelemetryHeader: React.FC<TelemetryHeaderProps> = ({
  vm,
  onSimulateDisconnect,
  onTriggerReplay
}) => {
  const isConnected = vm.connection.state === 'CONNECTED';
  const isReplaying = vm.connection.state === 'REPLAYING';
  const isDisconnected = vm.connection.state === 'DISCONNECTED';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              Real-Time Telemetry & Transactional Outbox Subsystem
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-500" />
            Observabilitas Stream Telemetri (Developer Telemetry)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pemantauan stream event transaksional real-time dengan pemulihan replay sequence & perlindungan Zero-PII.
          </p>
        </div>

        {/* Transport Connection Control Bar */}
        <div className="flex items-center gap-2 shrink-0">
          {isConnected && (
            <button
              onClick={onSimulateDisconnect}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>Simulasi Disconnect</span>
            </button>
          )}

          {(isDisconnected || isReplaying) && (
            <button
              onClick={onTriggerReplay}
              disabled={isReplaying}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReplaying ? 'animate-spin' : ''}`} />
              <span>{isReplaying ? 'Memulihkan Replay...' : 'Reconnect & Replay'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stream Topic & Sequence Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="text-slate-500">Topik Stream: </span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{vm.topicLabel}</span>
          <span className="text-slate-400 mx-1">|</span>
          <span className="text-slate-500">Sequence Terakhir: </span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">#{vm.connection.lastSequence}</span>
        </div>

        <span className={`px-3 py-0.5 rounded-full text-[11px] font-semibold border ${vm.connection.badgeColor}`}>
          {vm.connection.stateLabel}
        </span>
      </div>
    </div>
  );
};
