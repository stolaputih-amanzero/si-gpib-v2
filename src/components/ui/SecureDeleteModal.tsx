'use client';

import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react';

interface SecureDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  targetName: string;
  targetId?: string;
  itemType?: string; // e.g. "Pos Pelkes", "Jemaat Induk", "Aset", "Pengguna"
  isDeleting?: boolean;
}

export function SecureDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Verifikasi Keamanan Hapus',
  targetName,
  targetId,
  itemType = 'data ini',
  isDeleting = false,
}: SecureDeleteModalProps) {
  const [confirmInput, setConfirmInput] = useState('');
  const [isFinalConfirmed, setIsFinalConfirmed] = useState(false);

  if (!isOpen) return null;

  const isMatched = confirmInput.trim() === targetName.trim();

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmInput('');
    setIsFinalConfirmed(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatched || !isFinalConfirmed || isDeleting) return;
    await onConfirm();
  };

  return (
    <div 
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <form 
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-elevated w-full max-w-md rounded-2xl border border-border-subtle shadow-heavy p-6 space-y-5 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-text-high text-base">{title}</h3>
              <p className="text-xs text-text-muted">Tindakan ini permanen & tidak dapat dibatalkan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="text-text-muted hover:text-text-high p-1 rounded-lg hover:bg-surface-sunken transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Box Target */}
        <div className="p-3.5 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl text-xs text-text-high space-y-1.5">
          <p className="font-medium">
            Untuk mengonfirmasi penghapusan, ketik nama {itemType} berikut secara persis (Case-Sensitive):
          </p>
          <div className="p-2 rounded-lg bg-surface-sunken border border-border-subtle font-black text-red-600 dark:text-red-400 font-mono text-sm tracking-wide select-all text-center">
            {targetName}
          </div>
          {targetId && (
            <p className="text-[10px] text-text-muted text-center font-mono">ID: {targetId}</p>
          )}
        </div>

        {/* Case Sensitive Input */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-text-high uppercase tracking-wider">
            Ketik Ulang Nama <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => {
              setConfirmInput(e.target.value);
              if (e.target.value.trim() !== targetName.trim()) {
                setIsFinalConfirmed(false);
              }
            }}
            placeholder={`Ketik "${targetName}" di sini...`}
            disabled={isDeleting}
            autoFocus
            className="w-full px-3.5 py-2.5 rounded-xl border border-border-strong bg-surface-sunken text-text-high text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
          />
          {confirmInput.length > 0 && !isMatched && (
            <p className="text-[11px] text-red-500 font-bold">Nama belum sesuai (perhatikan huruf besar/kecil)</p>
          )}
        </div>

        {/* Double Re-confirmation Checkbox Step */}
        {isMatched && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs space-y-2 animate-in fade-in duration-200">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isFinalConfirmed}
                onChange={(e) => setIsFinalConfirmed(e.target.checked)}
                disabled={isDeleting}
                className="mt-0.5 w-4 h-4 rounded border-amber-300 text-red-600 focus:ring-red-500 shrink-0"
              />
              <span className="font-bold leading-tight">
                Pernyataan Ulang: Saya benar-benar yakin dan paham bahwa seluruh data "{targetName}" akan DIHAPUS PERMANEN dari sistem.
              </span>
            </label>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-xs font-bold text-text-high transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={!isMatched || !isFinalConfirmed || isDeleting}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-soft disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <><Loader2 size={14} className="animate-spin" /> Menghapus...</>
            ) : (
              <><Trash2 size={14} /> Ya, Hapus Permanen Data Ini</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
