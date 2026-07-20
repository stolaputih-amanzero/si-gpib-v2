'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pelayanSchema, PelayanInput } from '@/lib/validations/pelayan.schema';
import { useCreatePelayan, useUpdatePelayan, PelayanItem } from '@/hooks/use-pelayan';
import { Loader2, Save, AlertCircle, Phone } from 'lucide-react';
import { PosCascadingSelector } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { Controller } from 'react-hook-form';

interface PelayanFormProps {
  id_pos?: string;
  initialData?: PelayanItem | null;
  onSuccess: () => void;
}

export function PelayanForm({ id_pos = 'POS-001', initialData, onSuccess }: PelayanFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createMutation = useCreatePelayan();
  const updateMutation = useUpdatePelayan();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PelayanInput>({
    resolver: zodResolver(pelayanSchema),
    defaultValues: {
      id_pos: initialData?.id_pos || id_pos,
      nama: initialData?.nama || '',
      no_wa: initialData?.no_wa || '+628',
      jabatan: initialData?.jabatan || 'Ketua Pengurus Pos',
      tgl_lahir: initialData?.tgl_lahir || '',
      gender: initialData?.gender || 'Laki-laki',
      status: initialData?.status || 'Aktif',
      keterangan: initialData?.keterangan || '',
    },
  });

  const onSubmit = async (data: PelayanInput) => {
    setErrorMsg(null);
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id_pelayan: initialData.id_pelayan, input: data });
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
      setErrorMsg(err.message || 'Gagal menyimpan data pelayan.');
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
      <div className="space-y-1.5 w-full">
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

      {/* Nama & Jabatan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Nama Lengkap Pelayan *</label>
          <input
            type="text"
            placeholder="Pdt. Otniel / Dkn. Maria"
            {...register('nama')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.nama && <p className="text-xs text-error">{errors.nama.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Jabatan Pelayanan *</label>
          <input
            type="text"
            placeholder="Misal: Pendeta Pos / Penatua / Diaken"
            {...register('jabatan')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.jabatan && <p className="text-xs text-error">{errors.jabatan.message}</p>}
        </div>
      </div>

      {/* No WA & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Tanggal Lahir & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Tanggal Lahir (Opsional)</label>
          <input
            type="date"
            {...register('tgl_lahir')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Status Pelayanan *</label>
          <select
            {...register('status')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Keterangan */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high">Keterangan Tambahan</label>
        <textarea
          rows={2}
          placeholder="Catatan khusus, bidang pelayanan utama..."
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
            <span>Menyimpan Pelayan...</span>
          </>
        ) : (
          <>
            <Save size={18} />
            <span>{initialData ? 'Perbarui Data Pelayan' : 'Simpan Pelayan Baru'}</span>
          </>
        )}
      </button>
    </form>
  );
}
