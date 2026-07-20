'use client';

import { use, useState } from 'react';
import { usePengajuanDetail, useProcessApproval, useDeletePengajuan } from '@/hooks/use-bantuan';
import { WorkflowTimeline } from '@/components/bantuan/WorkflowTimeline';
import { UrgencyBadge } from '@/components/bantuan/UrgencyBadge';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  MapPin, 
  Loader2, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShareButton } from '@/components/mobile/ShareButton';

export default function PengajuanDetailPage({ params }: { params: Promise<{ id_ajuan: string }> }) {
  const resolvedParams = use(params);
  const id_ajuan = resolvedParams.id_ajuan;
  const router = useRouter();

  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'revision' | null>(null);
  const [catatan, setCatatan] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: item, isLoading, error } = usePengajuanDetail(id_ajuan);
  const processApprovalMutation = useProcessApproval();
  const deleteMutation = useDeletePengajuan();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleActionSubmit = async () => {
    if (!modalAction) return;
    if (!catatan || catatan.trim().length < 5) {
      setErrorMsg('Catatan persetujuan/penolakan wajib diisi minimal 5 karakter.');
      return;
    }

    setErrorMsg(null);
    try {
      await processApprovalMutation.mutateAsync({
        id_ajuan,
        aksi: modalAction,
        catatan: catatan.trim(),
      });

      if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([10, 50, 10]);
      setModalAction(null);
      setCatatan('');
    } catch (err: any) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([50, 100, 50]);
      setErrorMsg(err.message || 'Gagal memproses aksi persetujuan.');
    }
  };

  const handleDelete = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus data pengajuan ini?')) {
      await deleteMutation.mutateAsync(id_ajuan);
      router.push('/bantuan');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-base p-6 space-y-4">
        <div className="h-8 bg-surface-sunken rounded w-1/3 animate-pulse"></div>
        <div className="h-40 bg-surface-elevated rounded-xl animate-pulse"></div>
        <div className="h-60 bg-surface-elevated rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-surface-base p-6 text-center space-y-3">
        <AlertCircle size={36} className="mx-auto text-red-500" />
        <h2 className="text-base font-bold text-text-high">Pengajuan Tidak Ditemukan</h2>
        <Link href="/bantuan" className="text-xs text-brand-primary underline">
          Kembali ke Daftar Pengajuan
        </Link>
      </div>
    );
  }

  const isFinalStatus = item.status === 'Approved' || item.status === 'Rejected';

  return (
    <div className="w-full min-h-full bg-surface-base pb-36 md:pb-16">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-surface-elevated/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/bantuan"
              className="w-10 h-10 rounded-xl bg-surface-sunken flex items-center justify-center text-text-high hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-base font-bold text-brand-primary truncate max-w-[200px] sm:max-w-xs">
                Detail Pengajuan Bantuan
              </h1>
              <p className="text-xs text-text-muted">ID: {item.id_ajuan}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ShareButton
              title={`Permohonan Bantuan: ${item.jenis_bantuan}`}
              text={`Pos Pelkes: ${item.pos?.nama_pos || item.id_pos}\nStatus: ${item.status}\nUrgensi: ${item.urgensi}\nEstimasi Biaya: Rp ${item.biaya?.toLocaleString('id-ID')}`}
              variant="ghost"
              iconOnly
            />
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-xl text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Hapus Pengajuan"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-6">
        {/* Main Request Summary Card */}
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <UrgencyBadge urgensi={item.urgensi} />
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
                  {item.status}
                </span>
              </div>
              <h2 className="text-xl font-serif font-bold text-text-high pt-1">{item.jenis_bantuan}</h2>
              <p className="text-xs text-text-muted flex items-center gap-1">
                <MapPin size={14} className="text-brand-primary shrink-0" />
                <span>{item.pos?.nama_pos || item.id_pos}</span>
                {item.pos?.jemaat_induk?.nama_induk && (
                  <span>({item.pos.jemaat_induk.nama_induk})</span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-subtle">
            <div className="bg-surface-sunken p-3 rounded-xl">
              <p className="text-[11px] text-text-muted">Estimasi Biaya</p>
              <p className="text-lg font-serif font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                {formatCurrency(item.biaya)}
              </p>
            </div>
            <div className="bg-surface-sunken p-3 rounded-xl">
              <p className="text-[11px] text-text-muted">Tanggal Pengajuan</p>
              <p className="text-xs font-semibold text-text-high mt-1">{formatDate(item.created_at)}</p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <h4 className="text-xs font-semibold text-text-high uppercase tracking-wider">Keterangan & Latar Belakang</h4>
            <div className="p-3.5 rounded-xl bg-surface-sunken text-xs text-text-high leading-relaxed whitespace-pre-line border border-border-subtle">
              {item.keterangan || 'Tidak ada keterangan tambahan.'}
            </div>
          </div>
        </div>

        {/* Workflow Timeline */}
        <WorkflowTimeline
          status={item.status}
          approvalHistory={item.approval_history}
          createdAt={item.created_at}
        />
      </main>

      {/* Sticky Bottom Action Bar for Approval */}
      {!isFinalStatus && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-elevated/90 backdrop-blur-md border-t border-border-subtle p-3.5 pb-safe">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalAction('approve')}
              className="flex-1 min-h-[48px] px-4 bg-emerald-600 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm"
            >
              <CheckCircle2 size={18} />
              <span>Approve (Setujui)</span>
            </button>

            <button
              type="button"
              onClick={() => setModalAction('revision')}
              className="min-h-[48px] px-3.5 bg-amber-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-600 active:scale-[0.98] transition-all"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Minta Revisi</span>
            </button>

            <button
              type="button"
              onClick={() => setModalAction('reject')}
              className="min-h-[48px] px-3.5 bg-red-600 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-red-700 active:scale-[0.98] transition-all"
            >
              <XCircle size={16} />
              <span className="hidden sm:inline">Tolak</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal / Bottom Sheet Catatan Approval */}
      {modalAction && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 border border-border-subtle shadow-float space-y-4 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-base font-bold text-brand-primary">
                {modalAction === 'approve'
                  ? 'Konfirmasi Persetujuan (Approve)'
                  : modalAction === 'revision'
                  ? 'Minta Revisi Pengajuan'
                  : 'Konfirmasi Penolakan (Reject)'}
              </h3>
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-medium border border-red-200">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-high">
                Catatan & Pertimbangan Approval *
              </label>
              <textarea
                rows={3}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tuliskan alasan/catatan persetujuan atau poin revisi minimal 5 karakter..."
                className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="min-h-[44px] px-4 rounded-xl text-xs font-semibold text-text-muted hover:bg-surface-sunken"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleActionSubmit}
                disabled={processApprovalMutation.isPending}
                className={`min-h-[44px] px-5 rounded-xl text-xs font-semibold text-white flex items-center gap-2 shadow-sm ${
                  modalAction === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : modalAction === 'revision'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processApprovalMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Kirim Keputusan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
