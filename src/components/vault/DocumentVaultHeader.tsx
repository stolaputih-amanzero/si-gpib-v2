'use client';

import React from 'react';
import { FileText, Upload, ShieldCheck } from 'lucide-react';
import { DocumentVaultSummaryViewModel } from '@/types/documentVaultViewModel.types';

interface DocumentVaultHeaderProps {
  summary: DocumentVaultSummaryViewModel;
  onOpenUploadModal: () => void;
}

export const DocumentVaultHeader: React.FC<DocumentVaultHeaderProps> = ({ summary, onOpenUploadModal }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              Document Vault & Object Storage Lifecycle
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            Document Vault ({summary.entity_type.replace('_', ' ').toUpperCase()}: {summary.entity_id})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manajemen dokumen terikat entitas, otorisasi Supabase Storage RLS, dan pengiriman via Temporary Signed URL.
          </p>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Unggah Dokumen Baru</span>
        </button>
      </div>
    </div>
  );
};
