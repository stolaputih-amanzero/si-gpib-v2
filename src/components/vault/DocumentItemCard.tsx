'use client';

import React, { useState } from 'react';
import { DocumentItemViewModel } from '@/types/documentVaultViewModel.types';
import { FileText, Download, Trash2, Shield, Loader2, ExternalLink } from 'lucide-react';

interface DocumentItemCardProps {
  item: DocumentItemViewModel;
  onGetSignedUrl: (idDokumen: string) => Promise<string | null>;
  onSoftDelete: (idDokumen: string) => Promise<void>;
}

export const DocumentItemCard: React.FC<DocumentItemCardProps> = ({
  item,
  onGetSignedUrl,
  onSoftDelete
}) => {
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsLoadingUrl(true);
    try {
      const url = await onGetSignedUrl(item.id_dokumen);
      if (url) {
        setSignedUrl(url);
        window.open(url, '_blank');
      }
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Apakah Anda yakin ingin menghapus dokumen '${item.nama_file}'?`)) {
      setIsDeleting(true);
      try {
        await onSoftDelete(item.id_dokumen);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{item.nama_file}</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{item.sizeFormatted}</span>
              <span>•</span>
              <span>{item.mimeBadgeLabel}</span>
              <span>•</span>
              <span>{item.createdAtFormatted}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${item.visibilityBadgeColor} flex items-center gap-1`}>
            <Shield className="w-3 h-3" />
            {item.visibilityLabel}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${item.statusBadgeColor}`}>
            {item.statusLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60 gap-3">
        <div className="text-[11px] font-mono text-slate-400 truncate max-w-md">
          Storage Path: {item.storage_path}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={handleDownload}
            disabled={isLoadingUrl || item.status !== 'ACTIVE'}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {isLoadingUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Minta Signed URL</span>
          </button>

          {signedUrl && (
            <a 
              href={signedUrl} 
              target="_blank" 
              rel="noreferrer"
              className="p-1.5 rounded-lg border border-blue-200 text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition-colors"
              title="Buka Berkas Biner"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors disabled:opacity-50"
            title="Hapus Dokumen"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
