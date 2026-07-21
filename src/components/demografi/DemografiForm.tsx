'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { demografiSchema, DemografiInput } from '@/lib/validations/demografi.schema';
import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';
import { useUpsertDemografi } from '@/hooks/use-demografi';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { PosCascadingSelector, HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { formatPastoralKegiatanText } from '@/lib/formatters/pastoral-text';
import { createClient } from '@/lib/supabase/client';

interface DemografiFormProps {
  id_pos?: string;
  initialData?: Partial<DemografiInput>;
  onSuccess?: (savedData: DemografiInput, metaInfo?: HierarchyMetaInfo | null) => void;
}

export function DemografiForm({ id_pos, initialData, onSuccess }: DemografiFormProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hierarchyMeta, setHierarchyMeta] = useState<HierarchyMetaInfo | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DemografiInput>({
    resolver: zodResolver(demografiSchema),
    defaultValues: {
      id_pos: id_pos || initialData?.id_pos || '',
      kategori_pelkat: (initialData?.kategori_pelkat as any) || 'PA',
      jml_kk: initialData?.jml_kk || 0,
      laki: initialData?.laki || 0,
      perempuan: initialData?.perempuan || 0,
      profesi: initialData?.profesi || '',
      pendidikan: initialData?.pendidikan || '',
      keterangan: initialData?.keterangan || '',
    },
  });

  const upsertMutation = useUpsertDemografi();
  const laki = watch('laki') || 0;
  const perempuan = watch('perempuan') || 0;
  const totalJiwa = Number(laki) + Number(perempuan);

  const onSubmit = async (data: DemografiInput) => {
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      let targetPosId = data.id_pos;

      // Jika Pos Pelkes tidak dipilih (opsional), cari default pos milik id_induk yang dipilih
      if ((!targetPosId || targetPosId.trim() === '') && hierarchyMeta?.id_induk) {
        const supabase = createClient();
        const { data: posRows } = await supabase
          .from('m_pos_pelkes')
          .select('id_pos')
          .eq('id_induk', hierarchyMeta.id_induk)
          .limit(1);

        if (posRows && posRows[0]) {
          targetPosId = posRows[0].id_pos;
        }
      }

      if (!targetPosId || targetPosId.trim() === '') {
        throw new Error('Silakan pilih Wilayah Jemaat Induk & Pos Pelkes terkait terlebih dahulu.');
      }

      // Aplikasikan Smart Masking / Kapitalisasi pada Profesi, Pendidikan, & Catatan Keterangan
      const formattedProfesi = data.profesi ? formatPastoralKegiatanText(data.profesi) : '';
      const formattedPendidikan = data.pendidikan ? formatPastoralKegiatanText(data.pendidikan) : '';
      const formattedKeterangan = data.keterangan ? formatPastoralKegiatanText(data.keterangan) : '';

      const finalPayload: DemografiInput = {
        ...data,
        id_pos: targetPosId,
        profesi: formattedProfesi,
        pendidikan: formattedPendidikan,
        keterangan: formattedKeterangan,
      };

      await upsertMutation.mutateAsync(finalPayload);

      // Haptic feedback for mobile devices
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }

      setSuccessMsg('Data demografi berhasil disimpan!');
      if (onSuccess) {
        onSuccess(finalPayload, hierarchyMeta);
      }

    } catch (error: any) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
      setErrorMsg(error.message || 'Gagal menyimpan data demografi');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Pos Pelkes Cascading Selector (jika id_pos tidak di-lock) */}
      {!id_pos ? (
        <div className="space-y-1.5 w-full">
          <Controller
            name="id_pos"
            control={control}
            render={({ field }) => (
              <PosCascadingSelector
                value={field.value}
                onChange={field.onChange}
                onMetaChange={(meta) => setHierarchyMeta(meta)}
                error={errors.id_pos?.message}
                defaultPosId={initialData?.id_pos}
                disabled={isSubmitting}
                required={false}
              />
            )}
          />
        </div>
      ) : (
        <input type="hidden" {...register('id_pos')} value={id_pos} />
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-medium animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Kategori Pelkat Select */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-high flex items-center justify-between">
          <span>Kategori Pelkat *</span>
          <span className="text-[10px] text-text-muted font-normal">Resmi 6 Pelkat GPIB</span>
        </label>
        <select
          {...register('kategori_pelkat')}
          className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          {KATEGORI_PELKAT.map((kat) => (
            <option key={kat.kode} value={kat.kode}>
              {kat.icon} {kat.nama} ({kat.kode}) - {kat.deskripsi}
            </option>
          ))}
        </select>
        {errors.kategori_pelkat && (
          <p className="text-xs text-error mt-1">{errors.kategori_pelkat.message}</p>
        )}
      </div>

      {/* Grid: Laki & Perempuan */}
      <div className="grid grid-cols-2 gap-3">
        {/* Laki-Laki */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-blue-700 dark:text-blue-400">
            Laki-Laki *
          </label>
          <input
            type="number"
            min={0}
            {...register('laki', { valueAsNumber: true })}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-surface-elevated text-base font-bold text-text-high tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.laki && (
            <p className="text-[11px] text-error">{errors.laki.message}</p>
          )}
        </div>

        {/* Perempuan */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-pink-700 dark:text-pink-400">
            Perempuan *
          </label>
          <input
            type="number"
            min={0}
            {...register('perempuan', { valueAsNumber: true })}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-pink-200 dark:border-pink-900 bg-surface-elevated text-base font-bold text-text-high tabular-nums focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          {errors.perempuan && (
            <p className="text-[11px] text-error">{errors.perempuan.message}</p>
          )}
        </div>
      </div>

      {/* Jumlah KK */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-high">
          Jumlah KK (Kepala Keluarga) *
        </label>
        <input
          type="number"
          min={0}
          {...register('jml_kk', { valueAsNumber: true })}
          className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-base font-medium text-text-high tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        {errors.jml_kk && (
          <p className="text-xs text-error">{errors.jml_kk.message}</p>
        )}
      </div>

      {/* Total Jiwa (Auto-Calculated Read-only Box) */}
      <div className="p-3.5 rounded-xl bg-surface-sunken border border-border-subtle flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted">Total Jiwa (Kalkulasi Otomatis)</p>
          <p className="text-[11px] text-text-muted">Laki-Laki + Perempuan</p>
        </div>
        <p className="text-2xl font-extrabold text-brand-primary tabular-nums">
          {totalJiwa} <span className="text-xs font-normal text-text-muted">Jiwa</span>
        </p>
      </div>

      {/* Profesi & Pendidikan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-high">
            Dominasi Profesi (Opsional)
          </label>
          <input
            type="text"
            placeholder="Misal: Petani, PNS, Wiraswasta"
            {...register('profesi')}
            onBlur={(e) => setValue('profesi', formatPastoralKegiatanText(e.target.value))}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-high">
            Tingkat Pendidikan (Opsional)
          </label>
          <input
            type="text"
            placeholder="Misal: SMA, Sarjana"
            {...register('pendidikan')}
            onBlur={(e) => setValue('pendidikan', formatPastoralKegiatanText(e.target.value))}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Keterangan */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-high">
          Catatan Tambahan / Keterangan
        </label>
        <textarea
          rows={2}
          placeholder="Catatan khusus mengenai kategori pelkat ini..."
          {...register('keterangan')}
          onBlur={(e) => setValue('keterangan', formatPastoralKegiatanText(e.target.value))}
          className="w-full p-3 rounded-xl border border-border-subtle bg-surface-elevated text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[48px] bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <span>Simpan Data Demografi</span>
        )}
      </button>
    </form>
  );
}
