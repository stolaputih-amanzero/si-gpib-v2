'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mupelSchema, MupelInput } from '@/lib/validations/hierarki.schema';
import { useCreateMupel, useUpdateMupel, MupelItem } from '@/hooks/use-hierarki';
import { X, GitFork, Loader2, Save } from 'lucide-react';

interface MupelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: MupelItem | null;
}

export function MupelFormModal({ isOpen, onClose, editData }: MupelFormModalProps) {
  const isEdit = Boolean(editData);
  const createMutation = useCreateMupel();
  const updateMutation = useUpdateMupel();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MupelInput>({
    resolver: zodResolver(mupelSchema),
    defaultValues: {
      id_mupel: editData?.id_mupel || '',
      nama_mupel: editData?.nama_mupel || '',
      keterangan: editData?.keterangan || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        id_mupel: editData?.id_mupel || '',
        nama_mupel: editData?.nama_mupel || '',
        keterangan: editData?.keterangan || '',
      });
      setErrorMsg(null);
    }
  }, [isOpen, editData, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: MupelInput) => {
    setErrorMsg(null);
    try {
      if (isEdit && editData) {
        await updateMutation.mutateAsync({
          id_mupel: editData.id_mupel,
          payload: {
            nama_mupel: data.nama_mupel,
            keterangan: data.keterangan,
          },
        });
      } else {
        await createMutation.mutateAsync({
          id_mupel: data.id_mupel,
          nama_mupel: data.nama_mupel,
          keterangan: data.keterangan,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan data Mupel.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-surface-elevated rounded-t-3xl sm:rounded-2xl border border-border-subtle shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <GitFork size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-text-high leading-snug">
                {isEdit ? 'Edit Data Mupel' : 'Tambah Mupel Baru'}
              </h2>
              <p className="text-xs text-text-muted">Musyawarah Pelayanan (Tingkat Regional)</p>
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

          {/* ID Mupel */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-high">ID Mupel *</label>
            <input
              type="text"
              disabled={isEdit}
              placeholder="Contoh: MUPEL-BANTEN"
              {...register('id_mupel')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-60"
            />
            {errors.id_mupel && <p className="text-[10px] text-red-600 font-medium">{errors.id_mupel.message}</p>}
          </div>

          {/* Nama Mupel */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-high">Nama Mupel *</label>
            <input
              type="text"
              placeholder="Contoh: Mupel Banten"
              {...register('nama_mupel')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            {errors.nama_mupel && <p className="text-[10px] text-red-600 font-medium">{errors.nama_mupel.message}</p>}
          </div>

          {/* Keterangan */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-high">Keterangan / Catatan</label>
            <textarea
              rows={3}
              placeholder="Keterangan tambahan cakupan wilayah Mupel..."
              {...register('keterangan')}
              className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
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
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              className="min-h-[44px] px-5 rounded-xl bg-brand-primary text-white text-xs font-extrabold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50"
            >
              {(isSubmitting || createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Mupel'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
