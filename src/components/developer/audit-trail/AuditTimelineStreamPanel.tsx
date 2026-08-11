'use client';

import React, { useState } from 'react';
import { AuditEventViewModel } from '@/types/auditTrailViewModel.types';
import { Filter, Search, Eye, Link, Hash } from 'lucide-react';

interface AuditTimelineStreamPanelProps {
  events: AuditEventViewModel[];
  onSelectEvent: (event: AuditEventViewModel) => void;
}

export const AuditTimelineStreamPanel: React.FC<AuditTimelineStreamPanelProps> = ({
  events,
  onSelectEvent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<'ALL' | 'MUTATION' | 'DENY'>('ALL');

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.log_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.entityLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.topic.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterAction === 'ALL') return true;
    if (filterAction === 'MUTATION') return !e.actionLabel.includes('READ');
    if (filterAction === 'DENY') return e.decisionLabel.includes('DENY');
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari Log ID, Entity, atau Topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          <button
            onClick={() => setFilterAction('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${filterAction === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            Semua Event ({events.length})
          </button>
          <button
            onClick={() => setFilterAction('MUTATION')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${filterAction === 'MUTATION' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            Mutasi State
          </button>
          <button
            onClick={() => setFilterAction('DENY')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${filterAction === 'DENY' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            Otorisasi DENY
          </button>
        </div>
      </div>

      {/* Audit Evidence Stream List */}
      <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            Belum ada bukti audit yang cocok dengan filter pencarian.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.log_id}
              onClick={() => onSelectEvent(evt)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3 cursor-pointer transition-all hover:border-emerald-400 hover:shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-emerald-500" />
                    {evt.sequenceFormatted}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${evt.actionBadgeColor}`}>
                    {evt.actionLabel}
                  </span>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${evt.actorTypeBadge}`}>
                    {evt.actorLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    {evt.occurredFormatted}
                  </span>
                  <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {evt.entityLabel}
                </span>

                <span className="font-mono text-[10px] text-slate-500 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                  Topic: {evt.topic}
                </span>
              </div>

              {/* State Diff & Hash Chain Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="text-slate-600 dark:text-slate-400">
                  <span className="text-slate-400 font-medium">State Diff: </span>
                  {evt.stateDiffSummary}
                </div>

                <div className="font-mono text-[10px] text-slate-500 flex items-center justify-end gap-1.5">
                  <Link className="w-3 h-3 text-slate-400" />
                  <span>prev: {evt.prevHashShort}</span>
                  <span>➔</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">curr: {evt.hashShort}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
