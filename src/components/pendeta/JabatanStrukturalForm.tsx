'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  jabatanStrukturalSchema, 
  JabatanStrukturalInput, 
  KATEGORI_JABATAN, 
  TINGKAT_JABATAN,
  NAMA_JABATAN_BP_MUPEL,
  NAMA_JABATAN_UMUM
} from '@/lib/validations/jabatan-struktural.schema';
import { useCreateJabatan, useUpdateJabatan, JabatanStrukturalItem } from '@/hooks/use-jabatan-struktural';
import { Loader2, Save, AlertCircle } from 'lucide-react';

interface JabatanStrukturalFormProps {
  id_pendeta: string;
  initialData?: JabatanStrukturalItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function JabatanStrukturalForm({ id_pendeta, initialData, onSuccess, onCancel }: JabatanStrukturalFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createMutation = useCreateJabatan();
  const updateMutation = useUpdateJabatan();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<JabatanStrukturalInput>({
    resolver: zodResolver(jabatanStrukturalSchema) as any,
    defaultValues: {
      id_pendeta,
      kategori: initialData?.kategori as any || 'BP Mupel',
      nama_jabatan: initialData?.nama_jabatan || '',
      tingkat: initialData?.tingkat as any || 'Mupel',
      status: initialData?.status as any || 'Aktif',
      tgl_mulai: initialData?.tgl_mulai ? new Date(initialData.tgl_mulai).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      tgl_selesai: initialData?.tgl_selesai ? new Date(initialData.tgl_selesai).toISOString().split('T')[0] : '',
      no_sk: initialData?.no_sk || '',
      tgl_sk: initialData?.tgl_sk ? new Date(initialData.tgl_sk).toISOString().split('T')[0] : '',
      keterangan: initialData?.keterangan || '',
    } as any,
  });

  const watchKategori = useWatch({ control, name: 'kategori' });
  
  // Set tingkat automatically based on kategori
  const handleKategoriChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'BP Mupel' || val === 'Kepanitiaan Mupel') {
      setValue('tingkat', 'Mupel');
    } else if (val === 'Kepanitiaan Sinode') {
      setValue('tingkat', 'Sinode');
    } else if (val === 'Kepanitiaan Jemaat') {
      setValue('tingkat', 'Jemaat');
    }
  };

  const onSubmit = async (data: JabatanStrukturalInput) => {
    setErrorMsg(null);
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id_jabatan: initialData.id_jabatan, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data jabatan.');
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Kategori Jabatan *</label>
          <select
            {...register('kategori')}
            onChange={(e) => {
              register('kategori').onChange(e);
              handleKategoriChange(e);
              setValue('nama_jabatan', '');
            }}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {KATEGORI_JABATAN.map((kat) => (
              <option key={kat} value={kat}>{kat}</option>
            ))}
          </select>
          {errors.kategori && <p className="text-xs text-error">{errors.kategori.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Tingkat Organisasi *</label>
          <select
            {...register('tingkat')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {TINGKAT_JABATAN.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.tingkat && <p className="text-xs text-error">{errors.tingkat.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high">Nama Jabatan *</label>
        {watchKategori === 'BP Mupel' ? (
          <select
            {...register('nama_jabatan')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">-- Pilih Jabatan --</option>
            {NAMA_JABATAN_BP_MUPEL.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            list="nama-jabatan-umum"
            placeholder="Ketik atau pilih jabatan..."
            {...register('nama_jabatan')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        )}
        <datalist id="nama-jabatan-umum">
          {NAMA_JABATAN_UMUM.map((j) => (
            <option key={j} value={j} />
          ))}
        </datalist>
        {errors.nama_jabatan && <p className="text-xs text-error">{errors.nama_jabatan.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Tanggal Mulai *</label>
          <input
            type="date"
            {...register('tgl_mulai')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.tgl_mulai && <p className="text-xs text-error">{errors.tgl_mulai.message}</p>}
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Tanggal Selesai</label>
          <input
            type="date"
            {...register('tgl_selesai')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.tgl_selesai && <p className="text-xs text-error">{errors.tgl_selesai.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Nomor SK</label>
          <input
            type="text"
            {...register('no_sk')}
            placeholder="No. Surat Keputusan"
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Tanggal SK</label>
          <input
            type="date"
            {...register('tgl_sk')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Status *</label>
          <select
            {...register('status')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="Aktif">Aktif</option>
            <option value="Selesai">Selesai</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high">Keterangan Tambahan</label>
        <textarea
          rows={2}
          {...register('keterangan')}
          placeholder="Catatan tambahan (opsional)"
          className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border-subtle mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 min-h-[44px] px-4 rounded-xl border border-border-subtle text-sm font-semibold text-text-muted hover:text-text-high hover:bg-surface-sunken transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 min-h-[44px] bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-soft"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Simpan Jabatan</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
