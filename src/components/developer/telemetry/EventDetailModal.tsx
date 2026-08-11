'use client';

import React from 'react';
import { X, ShieldCheck, Activity, Key, Hash, Clock } from 'lucide-react';
import { TelemetryEventViewModel } from '@/types/telemetryStreamViewModel.types';

interface EventDetailModalProps {
  event: TelemetryEventViewModel | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose
}) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Detail Operational Metadata Event</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <Hash className="w-4 h-4 text-purple-500" /> Sequence Number
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{event.sequenceFormatted}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <Key className="w-4 h-4 text-purple-500" /> Event ID & Idempotency
            </span>
            <div className="text-right font-mono text-[11px]">
              <div className="font-bold text-slate-900 dark:text-slate-100">{event.event_id}</div>
              <div className="text-slate-400 text-[10px] truncate max-w-[180px]">{event.idempotency_key}</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <Clock className="w-4 h-4 text-purple-500" /> Waktu Kejadian
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{event.occurredFormatted}</span>
          </div>

          {/* Operational Payload Inspection */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-slate-500 font-semibold">
              <span>Operational Metadata Payload</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero-PII Enforced
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] space-y-1">
              <div><span className="text-slate-500">title:</span> "{event.title}"</div>
              <div><span className="text-slate-500">details:</span> "{event.detailText}"</div>
              <div><span className="text-slate-500">event_type:</span> "{event.event_type}"</div>
              <div><span className="text-slate-500">is_replayed:</span> {event.isReplayed ? 'true' : 'false'}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
          >
            Tutup Inspection
          </button>
        </div>
      </div>
    </div>
  );
};
