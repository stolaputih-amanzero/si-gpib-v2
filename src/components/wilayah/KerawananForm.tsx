'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  kerawananSchema,
  KerawananInput,
  KATEGORI_KERAWANAN_OPTIONS,
} from '@/lib/validations/wilayah.schema';
import { useCreateKerawanan } from '@/hooks/use-wilayah';
import { Loader2, CheckCircle2, AlertCircle, Save, ShieldAlert } from 'lucide-react';
import { PosCascadingSelector } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { Controller } from 'react-hook-form';

interface KerawananFormProps {
  defaultPosId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FREKUENSI_OPTIONS = [
  { value: 'Rendah', label: 'Rendah', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  { value: 'Sedang', label: 'Sedang', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  { value: 'Tinggi', label: 'Tinggi', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800' },
  { value: 'Kritis', label: 'Kritis', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' },
] as const;

export function KerawananForm({ defaultPosId, onSuccess, onCancel }: KerawananFormProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createMutation = useCreateKerawanan();

  const form = useForm<KerawananInput>({
    resolver: zodResolver(kerawananSchema),
    defaultValues: {
      id_pos: defaultPosId || '',
      kategori: KATEGORI_KERAWANAN_OPTIONS[0],
      jenis_risiko: '',
      frekuensi: 'Sedang',
      keterangan: '',
    },
  });

  const selectedFrekuensi = form.watch('frekuensi');

  const onSubmit = async (data: KerawananInput) => {
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await createMutation.mutateAsync(data);
      
      // Haptic Feedback saat sukses
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }

      setSuccessMsg('Data Kerawanan Wilayah berhasil disimpan!');
      form.reset({
        id_pos: defaultPosId || '',
        kategori: KATEGORI_KERAWANAN_OPTIONS[0],
        jenis_risiko: '',
        frekuensi: 'Sedang',
        keterangan: '',
      });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1200);
      }
    } catch (err: unknown) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
      const message = err instanceof Error ? err.message : 'Gagal menyimpan data kerawanan.';
      setErrorMsg(message);
    }
  };

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-subtle p-5 shadow-soft space-y-5">
      {/* Form Header */}
      <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-text-high text-base">Input Data Kerawanan Wilayah</h3>
          <p className="text-xs text-text-muted">Pendataan risiko bencana, sosial, & infrastruktur di Pos Pelkes (US-13.1)</p>
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
        <div className="space-y-1.5 w-full">
          <Controller
            name="id_pos"
            control={form.control}
            render={({ field }) => (
              <PosCascadingSelector
                value={field.value}
                onChange={field.onChange}
                error={form.formState.errors.id_pos?.message}
                defaultPosId={defaultPosId}
                disabled={createMutation.isPending}
              />
            )}
          />
        </div>

        {/* Kategori & Jenis Risiko */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Kategori Risiko *</label>
            <select
              {...form.register('kategori')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {KATEGORI_KERAWANAN_OPTIONS.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
            {form.formState.errors.kategori && (
              <p className="text-xs text-error font-medium">{form.formState.errors.kategori.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Jenis Risiko / Ancaman *</label>
            <input
              type="text"
              placeholder="Contoh: Banjir Bandang, Tanah Longsor, Konflik Lahan"
              {...form.register('jenis_risiko')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            {form.formState.errors.jenis_risiko && (
              <p className="text-xs text-error font-medium">{form.formState.errors.jenis_risiko.message}</p>
            )}
          </div>
        </div>

        {/* Frekuensi Kerawanan (Radio Badges dengan Warna Semantik) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-high">Tingkat Frekuensi Kerawanan *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FREKUENSI_OPTIONS.map((opt) => {
              const isSelected = selectedFrekuensi === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`min-h-[44px] p-2.5 rounded-xl border cursor-pointer flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    opt.color
                  } ${
                    isSelected
                      ? 'ring-2 ring-brand-primary scale-[1.02] shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...form.register('frekuensi')}
                    className="sr-only"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
          {form.formState.errors.frekuensi && (
            <p className="text-xs text-error font-medium">{form.formState.errors.frekuensi.message}</p>
          )}
        </div>

        {/* Keterangan Tambahan */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Keterangan & Mitigasi (Opsional)</label>
          <textarea
            rows={3}
            placeholder="Catatan historis kejadian, langkah mitigasi yang diperlukan..."
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
                <span>Simpan Data Kerawanan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
