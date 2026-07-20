'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  potensiSchema,
  PotensiInput,
  KATEGORI_POTENSI_OPTIONS,
} from '@/lib/validations/wilayah.schema';
import { useCreatePotensi, usePosPelkesList } from '@/hooks/use-wilayah';
import { Loader2, CheckCircle2, AlertCircle, Save, Sparkles } from 'lucide-react';

interface PotensiFormProps {
  defaultPosId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PotensiForm({ defaultPosId, onSuccess, onCancel }: PotensiFormProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: posList, isLoading: isLoadingPos } = usePosPelkesList();
  const createMutation = useCreatePotensi();

  const form = useForm<PotensiInput>({
    resolver: zodResolver(potensiSchema),
    defaultValues: {
      id_pos: defaultPosId || '',
      nama_potensi: '',
      kategori: KATEGORI_POTENSI_OPTIONS[0],
      deskripsi: '',
      keterangan: '',
    },
  });

  const onSubmit = async (data: PotensiInput) => {
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await createMutation.mutateAsync(data);

      // Haptic Feedback saat sukses
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }

      setSuccessMsg('Data Potensi Wilayah berhasil disimpan!');
      form.reset({
        id_pos: defaultPosId || '',
        nama_potensi: '',
        kategori: KATEGORI_POTENSI_OPTIONS[0],
        deskripsi: '',
        keterangan: '',
      });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1200);
      }
    } catch (err: unknown) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
      const message = err instanceof Error ? err.message : 'Gagal menyimpan data potensi.';
      setErrorMsg(message);
    }
  };

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-subtle p-5 shadow-soft space-y-5">
      {/* Form Header */}
      <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-text-high text-base">Input Data Potensi Wilayah</h3>
          <p className="text-xs text-text-muted">Pendataan sumber daya manusia, alam, ekonomi, & fisik di Pos Pelkes (US-13.2)</p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-medium dark:bg-red-950/40 dark:text-red-300 dark:border-red-800">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Pilih Pos Pelkes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high flex items-center justify-between">
            <span>Pos Pelkes *</span>
            {isLoadingPos && <span className="text-[11px] text-text-muted">Memuat daftar Pos...</span>}
          </label>
          <select
            {...form.register('id_pos')}
            disabled={isLoadingPos}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">-- Pilih Pos Pelkes --</option>
            {posList?.map((pos) => (
              <option key={pos.id_pos} value={pos.id_pos}>
                {pos.nama_pos} {pos.mupel ? `(Mupel ${pos.mupel})` : ''}
              </option>
            ))}
          </select>
          {form.formState.errors.id_pos && (
            <p className="text-xs text-error font-medium">{form.formState.errors.id_pos.message}</p>
          )}
        </div>

        {/* Nama Potensi & Kategori */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Nama Potensi *</label>
            <input
              type="text"
              placeholder="Contoh: Lahan Pertanian Kakao, Kelompok Pengrajin Tenun"
              {...form.register('nama_potensi')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            {form.formState.errors.nama_potensi && (
              <p className="text-xs text-error font-medium">{form.formState.errors.nama_potensi.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Kategori Potensi *</label>
            <select
              {...form.register('kategori')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {KATEGORI_POTENSI_OPTIONS.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
            {form.formState.errors.kategori && (
              <p className="text-xs text-error font-medium">{form.formState.errors.kategori.message}</p>
            )}
          </div>
        </div>

        {/* Deskripsi Potensi */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Deskripsi Detail Potensi *</label>
          <textarea
            rows={3}
            placeholder="Jelaskan jenis potensi, perkiraan kapasitas/volume, keterlibatan warga pos, dll..."
            {...form.register('deskripsi')}
            className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {form.formState.errors.deskripsi && (
            <p className="text-xs text-error font-medium">{form.formState.errors.deskripsi.message}</p>
          )}
        </div>

        {/* Keterangan Tambahan */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Keterangan / Rencana Pengembangan (Opsional)</label>
          <textarea
            rows={2}
            placeholder="Catatan dukungan gereja induk, bantuan kemitraan yang dibutuhkan..."
            {...form.register('keterangan')}
            className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {form.formState.errors.keterangan && (
            <p className="text-xs text-error font-medium">{form.formState.errors.keterangan.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 min-h-[44px] px-4 rounded-xl border border-border-subtle text-text-muted hover:text-text-high text-xs font-semibold transition-colors"
            >
              Batal
            </button>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 min-h-[48px] bg-brand-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-soft"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Simpan Data Potensi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
