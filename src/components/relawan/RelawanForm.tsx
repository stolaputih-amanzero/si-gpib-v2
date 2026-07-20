'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { relawanSchema, RelawanInput, KATEGORI_RELAWAN } from '@/lib/validations/relawan.schema';
import { useCreateRelawan, useUpdateRelawan, RelawanItem } from '@/hooks/use-relawan';
import { Loader2, Save, AlertCircle, Phone, Award } from 'lucide-react';
import { PosCascadingSelector } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { Controller } from 'react-hook-form';

interface RelawanFormProps {
  id_pos?: string;
  initialData?: RelawanItem | null;
  onSuccess: () => void;
}

export function RelawanForm({ id_pos = 'POS-001', initialData, onSuccess }: RelawanFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createMutation = useCreateRelawan();
  const updateMutation = useUpdateRelawan();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RelawanInput>({
    resolver: zodResolver(relawanSchema),
    defaultValues: {
      id_pos: initialData?.id_pos || id_pos,
      nama: initialData?.nama || '',
      no_wa: initialData?.no_wa || '+628',
      gender: initialData?.gender || 'Laki-laki',
      kategori: initialData?.kategori || KATEGORI_RELAWAN[0],
      pelatihan: initialData?.pelatihan || '',
      keterangan: initialData?.keterangan || '',
    },
  });

  const onSubmit = async (data: RelawanInput) => {
    setErrorMsg(null);
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id_relawan: initialData.id_relawan, input: data });
      } else {
        await createMutation.mutateAsync(data);
      }

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }

      onSuccess();
    } catch (err: any) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
      setErrorMsg(err.message || 'Gagal menyimpan data relawan.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-medium border border-red-200 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ID Pos Input */}
      <div className="space-y-1.5">
        <Controller
          name="id_pos"
          control={control}
          render={({ field }) => (
            <PosCascadingSelector
              value={field.value}
              onChange={field.onChange}
              error={errors.id_pos?.message}
              defaultPosId={initialData?.id_pos || id_pos}
              disabled={isSubmitting}
            />
          )}
        />
      </div>

      {/* Nama & No WA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Nama Lengkap Relawan *</label>
          <input
            type="text"
            placeholder="Nama relawan..."
            {...register('nama')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.nama && <p className="text-xs text-error">{errors.nama.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
            <Phone size={14} className="text-emerald-600" />
            <span>Nomor WhatsApp (+62...) *</span>
          </label>
          <input
            type="text"
            placeholder="+6281234567890"
            {...register('no_wa')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-mono text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.no_wa && <p className="text-xs text-error">{errors.no_wa.message}</p>}
        </div>
      </div>

      {/* Kategori & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Kategori Relawan *</label>
          <select
            {...register('kategori')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {KATEGORI_RELAWAN.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
          {errors.kategori && <p className="text-xs text-error">{errors.kategori.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Jenis Kelamin *</label>
          <select
            {...register('gender')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
          {errors.gender && <p className="text-xs text-error">{errors.gender.message}</p>}
        </div>
      </div>

      {/* Pelatihan */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
          <Award size={14} className="text-amber-500" />
          <span>Pelatihan yang Pernah Diikuti (Opsional)</span>
        </label>
        <input
          type="text"
          placeholder="Misal: Pelatihan Tanggap Bencana, Pertolongan Pertama, Sekolah Minggu"
          {...register('pelatihan')}
          className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {/* Keterangan */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high">Keterangan Tambahan</label>
        <textarea
          rows={2}
          placeholder="Catatan keahlian khusus, domisili..."
          {...register('keterangan')}
          className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-base text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[48px] bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Menyimpan Relawan...</span>
          </>
        ) : (
          <>
            <Save size={18} />
            <span>{initialData ? 'Perbarui Data Relawan' : 'Simpan Relawan Baru'}</span>
          </>
        )}
      </button>
    </form>
  );
}
