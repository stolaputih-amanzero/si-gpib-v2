'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pendetaSchema, PendetaInput } from '@/lib/validations/pendeta.schema';
import { useCreatePendeta, useUpdatePendeta, PendetaItem } from '@/hooks/use-pendeta';
import { Loader2, Save, AlertCircle, Phone } from 'lucide-react';
import { JemaatCascadingSelector } from '@/components/hierarki/HierarkiSelector/JemaatCascadingSelector';
import { Controller } from 'react-hook-form';

interface PendetaFormProps {
  id_induk?: string;
  initialData?: PendetaItem | null;
  onSuccess: () => void;
}

export function PendetaForm({ id_induk = 'IND-13055', initialData, onSuccess }: PendetaFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createMutation = useCreatePendeta();
  const updateMutation = useUpdatePendeta();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PendetaInput>({
    resolver: zodResolver(pendetaSchema) as any,
    defaultValues: {
      id_induk: initialData?.id_induk || id_induk,
      nama_lengkap: initialData?.nama_lengkap || '',
      no_wa: initialData?.no_wa || '+628',
      jabatan: initialData?.jabatan || 'Pendeta Jemaat',
      gender: initialData?.gender || 'Laki-laki',
      status: (initialData?.status as any) || 'Aktif',
      tgl_lahir: initialData?.tgl_lahir ? new Date(initialData.tgl_lahir).toISOString().split('T')[0] : '',
      tgl_tugas: initialData?.tgl_tugas ? new Date(initialData.tgl_tugas).toISOString().split('T')[0] : '',
      keterangan: initialData?.keterangan || '',
      jenis_pendeta: initialData?.jenis_pendeta || 'Organik',
      tgl_mulai_kontrak: initialData?.tgl_mulai_kontrak ? new Date(initialData.tgl_mulai_kontrak).toISOString().split('T')[0] : '',
      tgl_akhir_kontrak: initialData?.tgl_akhir_kontrak ? new Date(initialData.tgl_akhir_kontrak).toISOString().split('T')[0] : '',
      sumber_pembiayaan: initialData?.sumber_pembiayaan || '',
      eligible_rotasi: initialData?.eligible_rotasi ?? true,
      gereja_asal: initialData?.gereja_asal || '',
    } as any,
  });

  const jenisPendeta = useWatch({
    control,
    name: 'jenis_pendeta',
  });

  const onSubmit = async (data: PendetaInput) => {
    setErrorMsg(null);
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id_pendeta: initialData.id_pendeta, input: data });
      } else {
        await createMutation.mutateAsync(data);
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data pendeta.');
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

      {/* ID Jemaat Induk */}
      <div className="space-y-1.5 w-full">
        <Controller
          name="id_induk"
          control={control}
          render={({ field }) => (
            <JemaatCascadingSelector
              value={field.value}
              onChange={field.onChange}
              error={errors.id_induk?.message}
              defaultIndukId={initialData?.id_induk || id_induk}
              disabled={isSubmitting}
            />
          )}
        />
      </div>

      {/* Nama Lengkap & Jabatan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Nama Lengkap Pendeta (Gelar) *</label>
          <input
            type="text"
            placeholder="Pdt. Otniel Ferly..."
            {...register('nama_lengkap')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.nama_lengkap && <p className="text-xs text-error">{errors.nama_lengkap.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Jabatan Pelayanan *</label>
          <input
            type="text"
            placeholder="Misal: KMJ / Pendeta Jemaat / Pendeta Tugas Khusus"
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

      {/* Tanggal Tugas & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Tanggal Mulai Tugas</label>
          <input
            type="date"
            {...register('tgl_tugas')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Status Pendeta *</label>
          <select
            {...register('status')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="Aktif">Aktif</option>
            <option value="Emeritus">Emeritus</option>
            <option value="Cuti">Cuti</option>
            <option value="Mutasi">Mutasi</option>
          </select>
        </div>
      </div>

      {/* Jenis Pendeta & Sumber Pembiayaan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-subtle pt-4 mt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Jenis Pendeta *</label>
          <select
            {...register('jenis_pendeta')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="Organik">Organik</option>
            <option value="Non-Organik">Non-Organik</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Sumber Pembiayaan</label>
          <input
            type="text"
            placeholder="Misal: Kas Sinode, Kas Jemaat"
            {...register('sumber_pembiayaan')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Kontrak (Hanya untuk Non-Organik) */}
      {jenisPendeta === 'Non-Organik' && (
        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-4 animate-fadeIn">
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400">Detail Kontrak (Non-Organik)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-900 dark:text-amber-300">Tanggal Mulai Kontrak</label>
              <input
                type="date"
                {...register('tgl_mulai_kontrak')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-amber-300 bg-white dark:bg-surface-elevated text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-900 dark:text-amber-300">Tanggal Akhir Kontrak *</label>
              <input
                type="date"
                {...register('tgl_akhir_kontrak')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-amber-300 bg-white dark:bg-surface-elevated text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {errors.tgl_akhir_kontrak && <p className="text-xs text-error">{errors.tgl_akhir_kontrak.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-900 dark:text-amber-300">Gereja Asal</label>
            <input
              type="text"
              placeholder="Misal: GMIM, HKBP, dll"
              {...register('gereja_asal')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-amber-300 bg-white dark:bg-surface-elevated text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      )}

      {/* Keterangan */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high">Keterangan Tambahan</label>
        <textarea
          rows={2}
          placeholder="Catatan riwayat tahbisan, penugasan khusus..."
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
            <span>Menyimpan Pendeta...</span>
          </>
        ) : (
          <>
            <Save size={18} />
            <span>{initialData ? 'Perbarui Data Pendeta' : 'Simpan Pendeta Baru'}</span>
          </>
        )}
      </button>
    </form>
  );
}
