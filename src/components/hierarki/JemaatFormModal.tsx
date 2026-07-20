'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jemaatIndukSchema, JemaatIndukInput } from '@/lib/validations/hierarki.schema';
import { useCreateJemaat, useUpdateJemaat, JemaatIndukItem } from '@/hooks/use-hierarki';
import { X, Church, Loader2, Save, MapPin } from 'lucide-react';

interface JemaatFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  id_mupel: string;
  editData?: JemaatIndukItem | null;
}

export function JemaatFormModal({ isOpen, onClose, id_mupel, editData }: JemaatFormModalProps) {
  const isEdit = Boolean(editData);
  const createMutation = useCreateJemaat();
  const updateMutation = useUpdateJemaat();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(jemaatIndukSchema),
    defaultValues: {
      id_induk: editData?.id_induk || '',
      id_mupel: editData?.id_mupel || id_mupel,
      nama_induk: editData?.nama_induk || '',
      alamat: editData?.alamat || '',
      latitude: editData?.latitude ?? null,
      longitude: editData?.longitude ?? null,
      id_kmj: editData?.id_kmj || null,
      keterangan: editData?.keterangan || '',
      jumlah_sektor: editData?.jumlah_sektor ?? 0,
      jumlah_kk: editData?.jumlah_kk ?? 0,
      jumlah_jiwa: editData?.jumlah_jiwa ?? 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        id_induk: editData?.id_induk || '',
        id_mupel: editData?.id_mupel || id_mupel,
        nama_induk: editData?.nama_induk || '',
        alamat: editData?.alamat || '',
        latitude: editData?.latitude ?? null,
        longitude: editData?.longitude ?? null,
        id_kmj: editData?.id_kmj || null,
        keterangan: editData?.keterangan || '',
        jumlah_sektor: editData?.jumlah_sektor ?? 0,
        jumlah_kk: editData?.jumlah_kk ?? 0,
        jumlah_jiwa: editData?.jumlah_jiwa ?? 0,
      });
      setErrorMsg(null);
    }
  }, [isOpen, editData, id_mupel, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: JemaatIndukInput) => {
    setErrorMsg(null);
    try {
      if (isEdit && editData) {
        await updateMutation.mutateAsync({
          id_induk: editData.id_induk,
          payload: {
            nama_induk: data.nama_induk,
            alamat: data.alamat,
            latitude: data.latitude,
            longitude: data.longitude,
            id_kmj: data.id_kmj,
            keterangan: data.keterangan,
            jumlah_sektor: data.jumlah_sektor,
            jumlah_kk: data.jumlah_kk,
            jumlah_jiwa: data.jumlah_jiwa,
          },
        });
      } else {
        await createMutation.mutateAsync({
          id_induk: data.id_induk,
          id_mupel: data.id_mupel,
          nama_induk: data.nama_induk,
          alamat: data.alamat,
          latitude: data.latitude,
          longitude: data.longitude,
          id_kmj: data.id_kmj,
          keterangan: data.keterangan,
          jumlah_sektor: data.jumlah_sektor,
          jumlah_kk: data.jumlah_kk,
          jumlah_jiwa: data.jumlah_jiwa,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan data Jemaat Induk.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-surface-elevated rounded-t-3xl sm:rounded-2xl border border-border-subtle shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Church size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-text-high leading-snug">
                {isEdit ? 'Edit Jemaat Induk' : 'Tambah Jemaat Induk Baru'}
              </h2>
              <p className="text-xs text-text-muted">Mupel: {id_mupel}</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* ID Induk */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-high">ID Jemaat Induk *</label>
              <input
                type="text"
                disabled={isEdit}
                placeholder="Contoh: 02-01-BM"
                {...register('id_induk')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-60"
              />
              {errors.id_induk && <p className="text-[10px] text-red-600 font-medium">{errors.id_induk.message}</p>}
            </div>

            {/* Nama Induk */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-high">Nama Jemaat Induk *</label>
              <input
                type="text"
                placeholder="Contoh: GPIB Maranatha"
                {...register('nama_induk')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {errors.nama_induk && <p className="text-[10px] text-red-600 font-medium">{errors.nama_induk.message}</p>}
            </div>
          </div>

          {/* Alamat */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-high">Alamat Gereja</label>
            <textarea
              rows={2}
              placeholder="Alamat lengkap gereja induk..."
              {...register('alamat')}
              className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>

          {/* GPS Coordinates */}
          <div className="p-3 rounded-xl bg-surface-sunken border border-border-subtle space-y-2">
            <span className="text-[11px] font-bold text-text-muted flex items-center gap-1">
              <MapPin size={14} className="text-brand-primary" />
              Koordinat GPS (Optional)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="any"
                placeholder="Latitude (mis: -6.200)"
                {...register('latitude', { valueAsNumber: true })}
                className="w-full min-h-[40px] px-3 rounded-lg border border-border-subtle bg-surface-base text-xs font-medium text-text-high"
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude (mis: 106.816)"
                {...register('longitude', { valueAsNumber: true })}
                className="w-full min-h-[40px] px-3 rounded-lg border border-border-subtle bg-surface-base text-xs font-medium text-text-high"
              />
            </div>
          </div>

          {/* Statistik Master Data */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-high">Sektor</label>
              <input
                type="number"
                {...register('jumlah_sektor', { valueAsNumber: true })}
                className="w-full min-h-[40px] px-3 rounded-lg border border-border-subtle bg-surface-base text-xs font-bold text-text-high"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-high">KK</label>
              <input
                type="number"
                {...register('jumlah_kk', { valueAsNumber: true })}
                className="w-full min-h-[40px] px-3 rounded-lg border border-border-subtle bg-surface-base text-xs font-bold text-text-high"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-high">Jiwa</label>
              <input
                type="number"
                {...register('jumlah_jiwa', { valueAsNumber: true })}
                className="w-full min-h-[40px] px-3 rounded-lg border border-border-subtle bg-surface-base text-xs font-bold text-text-high"
              />
            </div>
          </div>

          {/* Keterangan */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-high">Keterangan / Catatan</label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan mengenai jemaat induk..."
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
                  <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Jemaat'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
