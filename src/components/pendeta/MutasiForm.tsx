'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mutasiSchema, MutasiInput } from '@/lib/validations/pendeta.schema';
import { useMutasiPendeta } from '@/hooks/use-pendeta';
import { Loader2, ArrowRightLeft, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';

interface MutasiFormProps {
  id_pendeta: string;
  nama_pendeta: string;
  currentIdInduk: string;
  currentNamaInduk: string;
  jemaatIndukList?: Array<{ id_induk: string; nama_induk: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MutasiForm({
  id_pendeta,
  nama_pendeta,
  currentIdInduk,
  currentNamaInduk,
  jemaatIndukList = [],
  onSuccess,
  onCancel,
}: MutasiFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [pendingData, setPendingData] = useState<MutasiInput | null>(null);

  const mutasiMutation = useMutasiPendeta();

  // Filter out current Jemaat Induk asal so user cannot mutate to the same place
  const targetJemaatList = jemaatIndukList.filter(
    (j) => j.id_induk !== currentIdInduk
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MutasiInput>({
    resolver: zodResolver(mutasiSchema),
    defaultValues: {
      id_pendeta: id_pendeta,
      id_induk_baru: targetJemaatList.length > 0 ? targetJemaatList[0].id_induk : '',
      alasan: '',
    },
  });

  const handlePreSubmit = (data: MutasiInput) => {
    setErrorMsg(null);
    setPendingData(data);
    setShowConfirm(true);
  };

  const handleExecuteMutasi = async () => {
    if (!pendingData) return;

    try {
      await mutasiMutation.mutateAsync(pendingData);
      setShowConfirm(false);
      onSuccess();
    } catch (err: any) {
      setShowConfirm(false);
      setErrorMsg(err.message || 'Gagal mengeksekusi mutasi pendeta via Database RPC.');
    }
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-medium border border-red-200 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Info Pendeta Asal */}
      <div className="p-3.5 rounded-xl bg-surface-sunken border border-border-subtle space-y-1.5 text-xs">
        <p className="text-text-muted font-medium">Pendeta yang Dimutasi:</p>
        <p className="font-bold text-sm text-text-high">{nama_pendeta}</p>
        <p className="text-text-muted flex items-center gap-1">
          <Building2 size={13} className="text-brand-primary" />
          <span>Asal Jemaat Induk: <strong className="text-text-high">{currentNamaInduk}</strong></span>
        </p>
      </div>

      <form onSubmit={handleSubmit(handlePreSubmit)} className="space-y-4">
        {/* Dropdown Jemaat Tujuan */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">
            Jemaat Induk Tujuan Mutasi *
          </label>
          {targetJemaatList.length > 0 ? (
            <select
              {...register('id_induk_baru')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {targetJemaatList.map((j) => (
                <option key={j.id_induk} value={j.id_induk}>
                  {j.nama_induk} ({j.id_induk})
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Masukkan ID Jemaat Induk Tujuan (misal: IND-13056)"
              {...register('id_induk_baru')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          )}
          {errors.id_induk_baru && (
            <p className="text-xs text-error">{errors.id_induk_baru.message}</p>
          )}
        </div>

        {/* Alasan Mutasi */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">
            Alasan / Dasar Keputusan Mutasi (Min. 10 Karakter) *
          </label>
          <textarea
            rows={3}
            placeholder="Surat Keputusan Majelis Sinode No. XX, Keputusan Rapat BPH Sektor..."
            {...register('alasan')}
            className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-base text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.alasan && <p className="text-xs text-error">{errors.alasan.message}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-border-subtle text-text-muted hover:bg-surface-sunken text-xs font-semibold min-h-[44px]"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[44px] active:scale-[0.98]"
          >
            <ArrowRightLeft size={16} />
            <span>Lanjutkan Mutasi</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirm && pendingData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-elevated w-full max-w-md rounded-2xl p-5 border border-border-subtle shadow-float space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200">
              <ArrowRightLeft size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-brand-primary">
                Konfirmasi Mutasi Pendeta
              </h3>
              <p className="text-xs text-text-muted">
                Tindakan ini akan me-reset status KMJ/PJ lama dan menutup seluruh penugasan secara atomik via Supabase Database RPC.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-sunken text-xs space-y-1 border border-border-subtle">
              <p><strong className="text-text-muted">Pendeta:</strong> {nama_pendeta}</p>
              <p><strong className="text-text-muted">Tujuan Baru:</strong> {pendingData.id_induk_baru}</p>
              <p><strong className="text-text-muted">Alasan:</strong> "{pendingData.alasan}"</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 min-h-[44px] py-2 rounded-xl border border-border-subtle text-text-muted font-semibold text-xs hover:bg-surface-sunken"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteMutasi}
                disabled={mutasiMutation.isPending}
                className="flex-1 min-h-[44px] py-2 rounded-xl bg-brand-primary text-white font-semibold text-xs hover:bg-blue-800 flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                {mutasiMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Proses RPC...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Ya, Eksekusi Mutasi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
