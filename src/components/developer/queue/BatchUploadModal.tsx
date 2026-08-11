'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileCode, CheckCircle2 } from 'lucide-react';
import { BatchAtomicityPolicy } from '@/types/batchProcessing.types';

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitUpload: (targetEntity: string, policy: BatchAtomicityPolicy, rawPayload: any[]) => Promise<void>;
}

export const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmitUpload
}) => {
  const [targetEntity, setTargetEntity] = useState<string>('person');
  const [policy, setPolicy] = useState<BatchAtomicityPolicy>('ALL_OR_NOTHING');
  const [jsonContent, setJsonContent] = useState<string>(
    JSON.stringify(
      [
        { nama_lengkap: 'Budi Santoso', no_anggota: 'JMT-001' },
        { nama_lengkap: 'Siti Rahma', no_anggota: 'JMT-002' },
        { nama_lengkap: '', no_anggota: 'JMT-003' } // Intentional invalid row for dry-run testing
      ],
      null,
      2
    )
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(jsonContent);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setErrorMsg('Payload harus berupa JSON Array bertipe objek.');
        return;
      }

      setIsSubmitting(true);
      await onSubmitUpload(targetEntity, policy, parsed);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('Format JSON tidak valid: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Upload Batch Payload Impor Baru</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Entity Selector */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Target Entitas Domain</label>
            <select
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
            >
              <option value="person">Person (Anggota Jemaat / Pelayan)</option>
              <option value="asset">Asset (Inventaris Aset Fisik)</option>
              <option value="organization">Organization (Struktur Organisasi)</option>
            </select>
          </div>

          {/* Atomicity Policy Selector */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Kebijakan Atomisitas Batch</label>
            <select
              value={policy}
              onChange={(e) => setPolicy(e.target.value as BatchAtomicityPolicy)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
            >
              <option value="ALL_OR_NOTHING">ALL_OR_NOTHING (Rollback Total Jika Ada 1 Invalid)</option>
              <option value="PARTIAL_ALLOW_VALID">PARTIAL_ALLOW_VALID (Izinkan Mutasi Row Valid, Rekonsiliasi Row Error)</option>
            </select>
          </div>

          {/* Raw Payload Area */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Raw JSON Payload Array</label>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <FileCode className="w-3 h-3" /> Parser Agnostic
              </span>
            </div>
            <textarea
              rows={8}
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-[11px] text-slate-800 dark:text-slate-200"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Meng-upload...' : 'Simpan Ke Staging (STAGED)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
