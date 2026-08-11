'use client';

import React, { useState } from 'react';
import { BatchRowItemViewModel } from '@/types/batchProcessingViewModel.types';
import { Filter, AlertTriangle, ShieldAlert } from 'lucide-react';

interface StagingDataGridPanelProps {
  rows: BatchRowItemViewModel[];
  reconciliationItems: BatchRowItemViewModel[];
}

export const StagingDataGridPanel: React.FC<StagingDataGridPanelProps> = ({
  rows,
  reconciliationItems
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [viewTab, setViewTab] = useState<'ALL_STAGING' | 'RECONCILIATION'>('ALL_STAGING');

  const filteredRows = rows.filter(r => {
    if (activeFilter === 'ALL') return true;
    return r.row_status === activeFilter;
  });

  const displayList = viewTab === 'RECONCILIATION' ? reconciliationItems : filteredRows;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Top Workspace Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTab('ALL_STAGING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              viewTab === 'ALL_STAGING'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Semua Data Staging ({rows.length})
          </button>

          <button
            onClick={() => setViewTab('RECONCILIATION')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              viewTab === 'RECONCILIATION'
                ? 'bg-rose-600 text-white'
                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Antrean Rekonsiliasi Error ({reconciliationItems.length})</span>
          </button>
        </div>

        {/* Semantic Status Filter */}
        {viewTab === 'ALL_STAGING' && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${activeFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveFilter('VALID')}
              className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${activeFilter === 'VALID' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Valid
            </button>
            <button
              onClick={() => setActiveFilter('INVALID')}
              className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${activeFilter === 'INVALID' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Invalid
            </button>
            <button
              onClick={() => setActiveFilter('COMMITTED')}
              className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${activeFilter === 'COMMITTED' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Committed
            </button>
          </div>
        )}
      </div>

      {/* Staging Data Cards List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {displayList.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            {viewTab === 'RECONCILIATION'
              ? '🎉 Selamat! Tidak ada baris error yang membutuhkan rekonsiliasi.'
              : 'Tidak ada data staging yang cocok dengan filter.'}
          </div>
        ) : (
          displayList.map((row) => (
            <div
              key={row.id_staging}
              className={`p-4 rounded-xl border space-y-3 transition-all ${
                row.hasError
                  ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                  : row.row_status === 'COMMITTED'
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {row.rowNumberFormatted}
                </span>

                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${row.statusBadgeColor}`}>
                  {row.statusLabel}
                </span>
              </div>

              {/* Payload Field List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs">
                {row.displayPayload.map(item => (
                  <div key={item.key} className="space-y-0.5">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{item.label}</div>
                    <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Error & Reconciliation Box */}
              {row.hasError && (
                <div className="bg-rose-100/70 dark:bg-rose-900/40 border border-rose-300 dark:border-rose-800 rounded-lg p-3 space-y-1 text-xs text-rose-800 dark:text-rose-200">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>Kode Error: {row.error_code || 'INVALID_FORMAT'}</span>
                  </div>
                  <p className="text-[11px] pl-5 opacity-90">{row.error_message}</p>
                  {row.reconciliation_notes && (
                    <div className="text-[10px] italic pl-5 text-rose-700 dark:text-rose-300 pt-0.5">
                      Saran Rekonsiliasi: {row.reconciliation_notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
