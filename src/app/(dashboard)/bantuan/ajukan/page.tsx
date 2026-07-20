'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  pengajuanBantuanSchema, 
  PengajuanBantuanInput, 
  URGENSI_OPTIONS 
} from '@/lib/validations/bantuan.schema';
import { useCreatePengajuan } from '@/hooks/use-bantuan';
import { useAsetList } from '@/hooks/use-aset';
import { ArrowLeft, Send, Loader2, CheckCircle2, AlertCircle, DollarSign, Box } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PosCascadingSelector } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';

export default function AjukanBantuanPage() {
  const router = useRouter();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createMutation = useCreatePengajuan();

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PengajuanBantuanInput>({
    resolver: zodResolver(pengajuanBantuanSchema),
    defaultValues: {
      id_pos: '',
      jenis_bantuan: '',
      biaya: 5000000,
      urgensi: 'Sedang',
      keterangan: '',
    },
  });

  const selectedPos = watch('id_pos');
  const { data: asetList } = useAsetList({ id_pos: selectedPos });

  const onSubmit = async (data: PengajuanBantuanInput) => {
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await createMutation.mutateAsync(data);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([10, 50, 10]);
      setSuccessMsg('Pengajuan bantuan berhasil dikirim! Status saat ini: Pending Review KMJ.');
      setTimeout(() => {
        router.push('/bantuan');
      }, 1200);
    } catch (err: any) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([50, 100, 50]);
      setErrorMsg(err.message || 'Gagal membuat pengajuan bantuan.');
    }
  };

  return (
    <div className="w-full min-h-full bg-surface-base pb-32 md:pb-12">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/bantuan"
              className="w-10 h-10 rounded-xl bg-surface-sunken flex items-center justify-center text-text-high hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-brand-primary truncate max-w-[200px] sm:max-w-xs">
                Form Pengajuan Bantuan
              </h1>
              <p className="text-xs text-text-muted">Pos Pelkes GPIB</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-surface-elevated p-4 sm:p-6 rounded-2xl border border-border-subtle shadow-soft space-y-4">

          {successMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-medium">
              <AlertCircle size={18} className="text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Pos Pelkes Cascading Selector */}
            <div className="space-y-1.5 w-full">
              <Controller
                name="id_pos"
                control={control}
                render={({ field }) => (
                  <PosCascadingSelector
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.id_pos?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            {/* Jenis Bantuan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-high">Jenis Permohonan Bantuan *</label>
              <input
                type="text"
                placeholder="Misal: Renovasi Atap Pastori Bocor, Pengadaan Motor Dinas, Genset"
                {...register('jenis_bantuan')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {errors.jenis_bantuan && (
                <p className="text-xs text-error">{errors.jenis_bantuan.message}</p>
              )}
            </div>

            {/* Link to Asset (Optional) */}
            {asetList && asetList.length > 0 && (
              <div className="space-y-1.5 p-3 rounded-xl bg-surface-sunken border border-border-subtle">
                <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
                  <Box size={15} className="text-brand-primary" />
                  <span>Kaitkan dengan Aset Pos (Opsional)</span>
                </label>
                <select
                  onChange={(e) => {
                    const selected = asetList.find((a) => a.id === e.target.value);
                    if (selected) {
                      if (selected.kategori === 'TANAH') setValue('id_aset_tanah', selected.id);
                      else if (selected.kategori === 'BANGUNAN') setValue('id_aset_bangunan', selected.id);
                      else if (selected.kategori === 'BERGERAK') setValue('id_aset_bergerak', selected.id);
                    } else {
                      setValue('id_aset_tanah', null);
                      setValue('id_aset_bangunan', null);
                      setValue('id_aset_bergerak', null);
                    }
                  }}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-border-subtle bg-surface-elevated text-xs font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">-- Pilih Aset Terkait (Opsional) --</option>
                  {asetList.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.kategori}] {a.judul}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Biaya & Urgensi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
                  <DollarSign size={15} className="text-emerald-600" />
                  <span>Estimasi Biaya Bantuan (IDR) *</span>
                </label>
                <input
                  type="number"
                  step="100000"
                  {...register('biaya', { valueAsNumber: true })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-bold text-text-high tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                {errors.biaya && <p className="text-xs text-error">{errors.biaya.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Tingkat Urgensi *</label>
                <select
                  {...register('urgensi')}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  {URGENSI_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.urgensi && <p className="text-xs text-error">{errors.urgensi.message}</p>}
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-high">Keterangan / Latar Belakang Permohonan *</label>
              <textarea
                rows={4}
                placeholder="Jelaskan secara mendetail kondisi lapangan, kebutuhan perbaikan, dan dampak pelayanan..."
                {...register('keterangan')}
                className="w-full p-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {errors.keterangan && (
                <p className="text-xs text-error">{errors.keterangan.message}</p>
              )}
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
                  <span>Mengirim Pengajuan...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Kirim Pengajuan Bantuan</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
