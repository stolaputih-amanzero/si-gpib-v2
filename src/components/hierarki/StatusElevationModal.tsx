'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { elevateStatusSchema, ElevateStatusInput } from '@/lib/validations/hierarki.schema';
import { useElevateStatus } from '@/hooks/use-hierarki';
import { X, TrendingUp, Calendar, FileText, Church, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface StatusElevationModalProps {
  isOpen: boolean;
  onClose: () => void;
  posItem: {
    id_pos: string;
    nama_pos: string;
    kategori?: string | null;
    id_induk: string;
  };
}

export function StatusElevationModal({ isOpen, onClose, posItem }: StatusElevationModalProps) {
  const currentKategori = posItem.kategori || 'Pos Pelkes';
  const defaultTarget = currentKategori === 'Bajem' ? 'JEMAAT_INDUK' : 'BAJEM';

  const elevateStatusMutation = useElevateStatus();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ElevateStatusInput>({
    resolver: zodResolver(elevateStatusSchema),
    defaultValues: {
      id_pos: posItem.id_pos,
      target_status: defaultTarget,
      tanggal_perubahan: format(new Date(), 'yyyy-MM-dd'),
      keterangan_perubahan: '',
      id_induk_baru: '',
      nama_induk_baru: '',
    },
  });

  const selectedTarget = watch('target_status');

  if (!isOpen) return null;

  const onSubmit = async (data: ElevateStatusInput) => {
    setErrorMsg(null);
    try {
      await elevateStatusMutation.mutateAsync({
        id_pos: data.id_pos,
        target_status: data.target_status,
        tanggal_perubahan: data.tanggal_perubahan,
        keterangan_perubahan: data.keterangan_perubahan,
        id_induk_baru: data.id_induk_baru,
        nama_induk_baru: data.nama_induk_baru,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal memproses peningkatan status.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-surface-elevated rounded-t-3xl sm:rounded-2xl border border-border-subtle shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-text-high leading-snug">
                Tingkatkan Status Pelayanan
              </h2>
              <p className="text-xs text-text-muted">{posItem.nama_pos} ({posItem.id_pos})</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:bg-surface-elevated transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 text-xs font-semibold border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Current vs Target Status Banner */}
          <div className="p-3.5 rounded-2xl bg-surface-sunken border border-border-subtle flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-text-muted uppercase">Status Saat Ini</span>
              <p className="font-black text-text-high">{currentKategori}</p>
            </div>
            <ArrowRight size={18} className="text-brand-primary shrink-0" />
            <div className="space-y-0.5 text-right">
              <span className="text-[10px] font-bold text-brand-primary uppercase">Status Baru</span>
              <p className="font-black text-brand-primary">
                {selectedTarget === 'BAJEM' ? 'Bakal Jemaat (Bajem)' : 'Jemaat Induk Mandiri'}
              </p>
            </div>
          </div>

          {/* Target Status Choice */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-high">Pilih Target Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue('target_status', 'BAJEM')}
                className={`min-h-[44px] p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedTarget === 'BAJEM'
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-xs'
                    : 'border-border-subtle bg-surface-base text-text-muted hover:text-text-high'
                }`}
              >
                <Sparkles size={16} />
                <span>Bakal Jemaat (Bajem)</span>
              </button>

              <button
                type="button"
                onClick={() => setValue('target_status', 'JEMAAT_INDUK')}
                className={`min-h-[44px] p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedTarget === 'JEMAAT_INDUK'
                    ? 'border-purple-600 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'border-border-subtle bg-surface-base text-text-muted hover:text-text-high'
                }`}
              >
                <Church size={16} />
                <span>Jemaat Induk</span>
              </button>
            </div>
          </div>

          {/* Kondisional Field untuk JEMAAT_INDUK */}
          {selectedTarget === 'JEMAAT_INDUK' && (
            <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 space-y-3 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                <Church size={14} />
                Data Jemaat Induk Mandiri Baru
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-high">ID Jemaat Baru *</label>
                  <input
                    type="text"
                    placeholder="Contoh: 25-01-MT"
                    {...register('id_induk_baru')}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  {errors.id_induk_baru && (
                    <p className="text-[10px] text-red-600 font-medium">{errors.id_induk_baru.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-high">Nama Jemaat Induk Baru *</label>
                  <input
                    type="text"
                    placeholder="Contoh: GPIB Martin Luther"
                    {...register('nama_induk_baru')}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  {errors.nama_induk_baru && (
                    <p className="text-[10px] text-red-600 font-medium">{errors.nama_induk_baru.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tanggal Perubahan */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-high flex items-center gap-1.5">
              <Calendar size={14} className="text-brand-primary" />
              Tanggal Perubahan Status *
            </label>
            <input
              type="date"
              {...register('tanggal_perubahan')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            {errors.tanggal_perubahan && (
              <p className="text-[10px] text-red-600 font-medium">{errors.tanggal_perubahan.message}</p>
            )}
          </div>

          {/* Keterangan / Nomor SK */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-high flex items-center gap-1.5">
              <FileText size={14} className="text-brand-primary" />
              Nomor SK / Keterangan Perubahan Status *
            </label>
            <textarea
              rows={3}
              placeholder="Masukkan nomor SK Sinode, keputusan sidang majelis, atau catatan latar belakang peningkatan status..."
              {...register('keterangan_perubahan')}
              className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
            {errors.keterangan_perubahan && (
              <p className="text-[10px] text-red-600 font-medium">{errors.keterangan_perubahan.message}</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 rounded-xl border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-xs font-bold text-text-high transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || elevateStatusMutation.isPending}
              className="min-h-[44px] px-5 rounded-xl bg-brand-primary text-white text-xs font-extrabold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50"
            >
              {(isSubmitting || elevateStatusMutation.isPending) ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <TrendingUp size={16} />
                  <span>Proses Peningkatan Status</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
