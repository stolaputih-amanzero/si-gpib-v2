'use client';

import { X } from 'lucide-react';
import { MutasiForm } from './MutasiForm';

interface MutationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  id_pendeta: string;
  nama_pendeta: string;
  currentIdInduk: string;
  currentNamaInduk: string;
  onSuccess?: () => void;
}

export function MutationDialog({
  isOpen,
  onClose,
  id_pendeta,
  nama_pendeta,
  currentIdInduk,
  currentNamaInduk,
  onSuccess,
}: MutationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface-elevated w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-border-subtle shadow-float max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle shrink-0">
          <div>
            <h3 className="font-serif font-bold text-base text-brand-primary">
              Mutasi & Penugasan Pendeta
            </h3>
            <p className="text-xs text-text-muted">
              Pindahkan penugasan secara atomik di database
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-5 overflow-y-auto">
          <MutasiForm
            id_pendeta={id_pendeta}
            nama_pendeta={nama_pendeta}
            currentIdInduk={currentIdInduk}
            currentNamaInduk={currentNamaInduk}
            onSuccess={() => {
              if (onSuccess) onSuccess();
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}

export default MutationDialog;
