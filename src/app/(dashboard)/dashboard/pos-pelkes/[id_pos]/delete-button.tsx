'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deletePosPelkes } from '../baru/actions';
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function DeletePosButton({ id_pos, nama_pos, iconOnly }: { id_pos: string; nama_pos: string; iconOnly?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isFinalConfirmed, setIsFinalConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMatched = confirmInput === nama_pos;

  const handleOpenModal = () => {
    setConfirmInput('');
    setIsFinalConfirmed(false);
    setIsOpen(true);
  };

  const handleConfirmDelete = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isMatched || !isFinalConfirmed) return;

    setIsDeleting(true);
    try {
      const result = await deletePosPelkes(id_pos);
      if (result?.error) {
        toast.error('Gagal Menghapus', result.error);
        setIsDeleting(false);
      } else {
        toast.success('Berhasil Dihapus', `Data ${nama_pos} telah dihapus.`);
        setIsOpen(false);
        router.push('/dashboard/pos-pelkes');
        router.refresh();
      }
    } catch (err: any) {
      toast.error('Gagal Menghapus', err.message || 'Terjadi kesalahan sistem.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        disabled={isDeleting}
        title={`Hapus ${nama_pos}`}
        className={
          iconOnly
            ? "w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shadow-xs"
            : "min-h-[40px] px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
        }
      >
        {isDeleting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
        {!iconOnly && <span>Hapus</span>}
      </button>

      {/* Confirmation Dialog Modal with Security Typing Check & Double Re-confirmation */}
      {isOpen && (
        <div 
          onClick={() => !isDeleting && setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <form 
            onSubmit={handleConfirmDelete}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-elevated w-full max-w-md rounded-2xl border border-border-subtle shadow-heavy p-6 space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-text-high text-base">Verifikasi Keamanan Hapus</h3>
                  <p className="text-xs text-text-muted">Tindakan ini permanen dan tidak dapat dibatalkan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="text-text-muted hover:text-text-high p-1 rounded-lg hover:bg-surface-sunken transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl text-xs text-text-high space-y-1.5">
              <p className="font-medium">
                Untuk mengonfirmasi penghapusan, ketik nama pos pelayanan berikut secara persis (Case-Sensitive):
              </p>
              <div className="p-2 rounded-lg bg-surface-sunken border border-border-subtle font-black text-red-600 dark:text-red-400 font-mono text-sm tracking-wide select-all text-center">
                {nama_pos}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-text-high uppercase tracking-wider">
                Ketik Ulang Nama Pos <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => {
                  setConfirmInput(e.target.value);
                  if (e.target.value !== nama_pos) {
                    setIsFinalConfirmed(false);
                  }
                }}
                placeholder={`Ketik "${nama_pos}" di sini...`}
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
                    Pernyataan Ulang: Saya benar-benar yakin dan paham bahwa seluruh data pos "{nama_pos}" akan DHIAPUS PERMANEN dari sistem.
                  </span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
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
      )}
    </>
  );
}
