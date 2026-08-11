'use client';

import React, { useState } from 'react';
import { WebhookDeliveryItemViewModel } from '@/types/webhookEngineViewModel.types';
import { Filter, Search, Eye, Send, RotateCw, AlertTriangle } from 'lucide-react';

interface WebhookDeliveryStreamPanelProps {
  deliveries: WebhookDeliveryItemViewModel[];
  onSelectDelivery: (delivery: WebhookDeliveryItemViewModel) => void;
}

export const WebhookDeliveryStreamPanel: React.FC<WebhookDeliveryStreamPanelProps> = ({
  deliveries,
  onSelectDelivery
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'DELIVERED' | 'RETRY' | 'DLQ'>('ALL');

  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = d.delivery_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.event_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.endpoint_id.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'DELIVERED') return d.statusLabel.includes('DELIVERED');
    if (filterStatus === 'RETRY') return d.statusLabel.includes('RETRYING');
    if (filterStatus === 'DLQ') return d.isDLQ;
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
            placeholder="Cari Delivery ID, Event ID, Endpoint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${filterStatus === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            Semua ({deliveries.length})
          </button>
          <button
            onClick={() => setFilterStatus('DELIVERED')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${filterStatus === 'DELIVERED' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            Delivered
          </button>
          <button
            onClick={() => setFilterStatus('RETRY')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${filterStatus === 'RETRY' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            Retrying
          </button>
          <button
            onClick={() => setFilterStatus('DLQ')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${filterStatus === 'DLQ' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            DLQ
          </button>
        </div>
      </div>

      {/* Outbound Delivery List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {filteredDeliveries.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            Belum ada record delivery yang cocok dengan filter pencarian.
          </div>
        ) : (
          filteredDeliveries.map((del) => (
            <div
              key={del.delivery_id}
              onClick={() => onSelectDelivery(del)}
              className={`p-4 rounded-xl border space-y-3 cursor-pointer transition-all hover:shadow-xs ${del.isDLQ ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800' : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-purple-400'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <Send className="w-3.5 h-3.5 text-purple-500" />
                    {del.delivery_id}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${del.statusBadgeColor}`}>
                    {del.statusLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    Queued: {del.queuedAtFormatted}
                  </span>
                  <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  Event: {del.event_id}
                </span>

                <span className="font-mono text-[10px] text-slate-500 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                  Endpoint: {del.endpoint_id}
                </span>
              </div>

              {/* Delivery Attempts & Schedule Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <RotateCw className="w-3 h-3 text-slate-400" />
                  <span>Percobaan: {del.attemptsFormatted}</span>
                </div>

                <div className="font-mono text-[10px] text-slate-500 text-right">
                  {del.isDLQ ? (
                    <span className="text-rose-600 font-bold flex items-center justify-end gap-1">
                      <AlertTriangle className="w-3 h-3" /> DLQ Exhausted
                    </span>
                  ) : (
                    <span>Next Retry: {del.nextRetryFormatted}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
