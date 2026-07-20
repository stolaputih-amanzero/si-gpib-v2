'use client';

import { use, useState } from 'react';
import { 
  usePendetaDetail, 
  useMutationHistory, 
  useSetKmj 
} from '@/hooks/use-pendeta';
import { MutationTimeline } from '@/components/pendeta/MutationTimeline';
import { MutasiForm } from '@/components/pendeta/MutasiForm';
import { 
  ArrowLeft, 
  Building2, 
  Crown, 
  ShieldCheck, 
  ArrowRightLeft, 
  Phone, 
  Calendar, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function PendetaDetailPage({ params }: { params: Promise<{ id_pendeta: string }> }) {
  const resolvedParams = use(params);
  const id_pendeta = resolvedParams.id_pendeta;

  const [showMutasiModal, setShowMutasiModal] = useState<boolean>(false);
  const [showSetKmjConfirm, setShowSetKmjConfirm] = useState<boolean>(false);
  const [kmjSuccessMsg, setKmjSuccessMsg] = useState<string | null>(null);

  const { data: pendeta, isLoading } = usePendetaDetail(id_pendeta);
  const { data: historyList, isLoading: historyLoading } = useMutationHistory(id_pendeta);
  const setKmjMutation = useSetKmj();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        <p className="text-sm text-text-muted">Memuat detail profil pendeta...</p>
      </div>
    );
  }

  if (!pendeta) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-amber-500" />
        <h2 className="text-xl font-bold text-text-high">Data Pendeta Tidak Ditemukan</h2>
        <Link
          href="/pendeta"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Pendeta</span>
        </Link>
      </div>
    );
  }

  const cleanPhone = pendeta.no_wa ? pendeta.no_wa.replace(/[^0-9]/g, '') : null;
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  const handleExecuteSetKmj = async () => {
    try {
      await setKmjMutation.mutateAsync({
        id_induk: pendeta.id_induk,
        id_pendeta: pendeta.id_pendeta,
      });
      setShowSetKmjConfirm(false);
      setKmjSuccessMsg('Berhasil diangkat menjadi Ketua Majelis Jemaat (KMJ)!');
      setTimeout(() => setKmjSuccessMsg(null), 5000);
    } catch (err: any) {
      setShowSetKmjConfirm(false);
      alert(err.message || 'Gagal mengangkat KMJ via RPC.');
    }
  };

  return (
    <div className="w-full min-h-full bg-surface-base pb-32 md:pb-12">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link
            href="/pendeta"
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand-primary min-h-[44px]"
          >
            <ArrowLeft size={18} />
            <span>Kembali</span>
          </Link>

          <span className="text-xs font-mono font-medium text-text-muted">ID: {pendeta.id_pendeta}</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {kmjSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{kmjSuccessMsg}</span>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-surface-elevated rounded-2xl p-6 border border-border-subtle shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-serif font-bold text-2xl shrink-0 border border-brand-primary/20">
                {pendeta.nama_lengkap.replace(/^(Pdt\.|Dkn\.|Pnt\.)\s*/i, '').charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-serif font-bold text-text-high">{pendeta.nama_lengkap}</h1>
                  {pendeta.is_kmj && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Crown size={12} className="text-amber-600" />
                      <span>KMJ</span>
                    </span>
                  )}
                  {pendeta.is_pj && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                      <ShieldCheck size={12} className="text-blue-600" />
                      <span>PJ Pos</span>
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-brand-primary mt-1">{pendeta.jabatan}</p>
                <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1">
                  <Building2 size={14} className="text-brand-primary shrink-0" />
                  <span>{pendeta.jemaat_induk?.nama_induk || pendeta.id_induk}</span>
                </p>
              </div>
            </div>

            {/* Action Bar Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {!pendeta.is_kmj && (
                <button
                  type="button"
                  onClick={() => setShowSetKmjConfirm(true)}
                  className="flex-1 sm:flex-none min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-500 text-white font-semibold text-xs hover:bg-amber-600 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                >
                  <Crown size={16} />
                  <span>Angkat KMJ</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowMutasiModal(true)}
                className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 rounded-xl bg-brand-primary text-white font-semibold text-xs hover:bg-blue-800 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                <ArrowRightLeft size={16} />
                <span>Mutasi Pendeta</span>
              </button>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border-subtle text-xs">
            <div>
              <p className="text-text-muted">Status</p>
              <p className="font-semibold text-text-high mt-0.5">{pendeta.status}</p>
            </div>
            <div>
              <p className="text-text-muted">Jenis Kelamin</p>
              <p className="font-semibold text-text-high mt-0.5">{pendeta.gender}</p>
            </div>
            <div>
              <p className="text-text-muted">WhatsApp</p>
              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <Phone size={12} />
                  <span>{pendeta.no_wa}</span>
                </a>
              ) : (
                <p className="text-text-muted mt-0.5">-</p>
              )}
            </div>
            <div>
              <p className="text-text-muted">Mulai Tugas</p>
              <p className="font-semibold text-text-high mt-0.5">{pendeta.tgl_tugas || '-'}</p>
            </div>
          </div>
        </div>

        {/* Mutation Timeline Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-brand-primary flex items-center gap-2">
              <Calendar size={18} />
              <span>Riwayat Mutasi & Penugasan</span>
            </h2>
          </div>

          <MutationTimeline historyList={historyList || []} isLoading={historyLoading} />
        </div>
      </main>

      {/* Modal Mutasi Form */}
      {showMutasiModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 border border-border-subtle shadow-float max-h-[90vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 className="text-base font-bold text-brand-primary">Mutasi Pendeta Ke Jemaat Induk Lain</h2>
              <button
                type="button"
                onClick={() => setShowMutasiModal(false)}
                className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high"
              >
                ✕
              </button>
            </div>

            <MutasiForm
              id_pendeta={pendeta.id_pendeta}
              nama_pendeta={pendeta.nama_lengkap}
              currentIdInduk={pendeta.id_induk}
              currentNamaInduk={pendeta.jemaat_induk?.nama_induk || pendeta.id_induk}
              onSuccess={() => setShowMutasiModal(false)}
              onCancel={() => setShowMutasiModal(false)}
            />
          </div>
        </div>
      )}

      {/* Confirm Set KMJ Modal */}
      {showSetKmjConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-elevated w-full max-w-md rounded-2xl p-5 border border-border-subtle shadow-float space-y-4 animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200">
              <Crown size={24} />
            </div>

            <h3 className="font-serif font-bold text-lg text-brand-primary">
              Angkat Sebagai Ketua Majelis Jemaat (KMJ)?
            </h3>
            <p className="text-xs text-text-muted">
              {pendeta.nama_lengkap} akan diangkat sebagai KMJ di <strong className="text-text-high">{pendeta.jemaat_induk?.nama_induk || pendeta.id_induk}</strong>. Status KMJ sebelumnya pada jemaat ini akan di-reset secara otomatis.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSetKmjConfirm(false)}
                className="flex-1 min-h-[44px] py-2 rounded-xl border border-border-subtle text-text-muted font-semibold text-xs hover:bg-surface-sunken"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteSetKmj}
                disabled={setKmjMutation.isPending}
                className="flex-1 min-h-[44px] py-2 rounded-xl bg-amber-500 text-white font-semibold text-xs hover:bg-amber-600 flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                {setKmjMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <span>Ya, Angkat KMJ</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
