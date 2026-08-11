'use client';

import React, { useState } from 'react';
import { DocumentVisibilityTier, DocumentEntityType } from '@/types/documentVault.types';
import { Upload, X, Loader2 } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    entityType: DocumentEntityType,
    entityId: string,
    fileName: string,
    sizeBytes: number,
    mimeType: string,
    visibilityTier: DocumentVisibilityTier
  ) => Promise<void>;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const [entityType, setEntityType] = useState<DocumentEntityType>('aid_request');
  const [entityId, setEntityId] = useState('AJUAN-TEST-001');
  const [fileName, setFileName] = useState('proposal_lampiran.pdf');
  const [sizeBytes, setSizeBytes] = useState(1048576);
  const [mimeType] = useState('application/pdf');
  const [visibilityTier, setVisibilityTier] = useState<DocumentVisibilityTier>('ORG_WIDE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpload(entityType, entityId, fileName, Number(sizeBytes), mimeType, visibilityTier);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Unggah Dokumen Baru (Protokol Dua-Fase)</h3>
              <p className="text-xs text-slate-500">Mendaftarkan Intent Metadata ➔ Upload Biner ➔ Konfirmasi</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Tipe Entitas Canonical</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as DocumentEntityType)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="aid_request">Aid Request (Pengajuan Bantuan)</option>
              <option value="person">Person (Warga Jemaat)</option>
              <option value="organization">Organization (Pos/Mupel)</option>
              <option value="asset">Asset (Tanah/Bangunan/Bergerak)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">ID Entitas Target</label>
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Nama Berkas (File Name)</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Ukuran (Bytes)</label>
              <input
                type="number"
                value={sizeBytes}
                onChange={(e) => setSizeBytes(Number(e.target.value))}
                required
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Tier Akses Otorisasi</label>
              <select
                value={visibilityTier}
                onChange={(e) => setVisibilityTier(e.target.value as DocumentVisibilityTier)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="PUBLIC">PUBLIC (Anggota Terotentikasi)</option>
                <option value="ORG_WIDE">ORG_WIDE (Hierarki Organisasi)</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL (Admin Rahasia)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>Jalankan Dua-Fase Upload</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
