'use client';

import React from 'react';
import { OfflineCommandItemViewModel } from '@/types/offlineSyncViewModel.types';
import { Inbox, AlertTriangle, Trash2 } from 'lucide-react';

interface OfflineQueuePanelProps {
  items: OfflineCommandItemViewModel[];
  onInspectConflict: (item: OfflineCommandItemViewModel) => void;
  onDiscardItem: (commandId: string) => void;
}

export const OfflineQueuePanel: React.FC<OfflineQueuePanelProps> = ({
  items,
  onInspectConflict,
  onDiscardItem
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Antrian Perintah Lokal Kosong</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Seluruh perintah transaksi telah tersinkronisasi sempurna ke database server PostgreSQL.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Daftar Antrian Perintah Lokal ({items.length})</h2>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div
            key={item.command_id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${item.statusBadgeColor}`}>
                  {item.statusLabel}
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {item.command_id}</span>
              </div>

              <div className="text-[11px] text-slate-400">
                Dibuat: {item.createdAtFormatted}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="uppercase text-blue-600 dark:text-blue-400 font-extrabold">{item.action}</span>
                  <span>➔</span>
                  <span>{item.entity_type} ({item.entity_id})</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">Token Request ID: {item.request_id}</div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {item.status === 'CONFLICT' && (
                  <button
                    onClick={() => onInspectConflict(item)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold hover:bg-rose-100 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Inspeksi Konflik</span>
                  </button>
                )}

                <button
                  onClick={() => onDiscardItem(item.command_id)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="Buang dari Antrian"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
