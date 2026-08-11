'use client';

import React, { useState } from 'react';
import { TelemetryEventViewModel } from '@/types/telemetryStreamViewModel.types';
import { Filter, Eye, RefreshCw } from 'lucide-react';

interface LiveEventFeedPanelProps {
  events: TelemetryEventViewModel[];
  onSelectEvent: (evt: TelemetryEventViewModel) => void;
}

export const LiveEventFeedPanel: React.FC<LiveEventFeedPanelProps> = ({
  events,
  onSelectEvent
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const filteredEvents = events.filter(e => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'LIVE') return !e.isReplayed;
    if (activeFilter === 'REPLAYED') return e.isReplayed;
    if (activeFilter === 'ERRORS') return e.hasError;
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Umpan Live Telemetry Stream</span>
            <span className="text-xs font-normal text-slate-500">({events.length} Events)</span>
          </h2>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${activeFilter === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveFilter('LIVE')}
            className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${activeFilter === 'LIVE' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Live Only
          </button>
          <button
            onClick={() => setActiveFilter('REPLAYED')}
            className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${activeFilter === 'REPLAYED' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Replayed
          </button>
          <button
            onClick={() => setActiveFilter('ERRORS')}
            className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${activeFilter === 'ERRORS' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Errors Only
          </button>
        </div>
      </div>

      {/* Live Event Cards List */}
      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            Tidak ada event telemetri yang cocok dengan filter.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.event_id}
              onClick={() => onSelectEvent(evt)}
              className={`p-4 rounded-xl border space-y-2 cursor-pointer transition-all hover:border-purple-300 ${
                evt.hasError
                  ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                  : evt.isReplayed
                  ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                    {evt.sequenceFormatted}
                  </span>

                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${evt.typeBadgeColor}`}>
                    {evt.typeLabel}
                  </span>

                  {evt.isReplayed && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Replayed
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 font-mono">
                  {evt.occurredFormatted}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>{evt.title}</span>
                <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                {evt.detailText}
              </p>

              {/* Progress Bar for progress events */}
              {evt.progressPercent !== null && (
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${evt.progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
