'use client';

import React from 'react';
import { OfflineCommandItemViewModel } from '@/types/offlineSyncViewModel.types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConflictResolutionModalProps {
  item: OfflineCommandItemViewModel | null;
  onClose: () => void;
  onDiscard: (commandId: string) => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  item,
  onClose,
  onDiscard
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Inspeksi Penolakan Domain Server</h3>
              <p className="text-xs text-slate-500">Konflik Status Transaksi Server vs Antrian Lokal</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Entitas Target:</span>{' '}
            <span className="font-bold text-slate-900 dark:text-slate-100">{item.entity_type} ({item.entity_id})</span>
          </div>

          <div>
            <span className="text-slate-500 font-medium">Aksi Intent:</span>{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{item.action}</span>
          </div>

          <div>
            <span className="text-slate-500 font-medium">Kode Error Server:</span>{' '}
            <span className="font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold">
              {item.conflictDetails?.serverErrorCode || 'INVALID_TRANSITION'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-medium">Pesan Error Server:</span>
            <div className="mt-1 p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              {item.conflictDetails?.serverErrorMessage || item.errorMessage || 'Perintah ditolak oleh server.'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Tutup Inspeksi
          </button>

          <button
            onClick={() => {
              onDiscard(item.command_id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Buang Perintah Lokal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
