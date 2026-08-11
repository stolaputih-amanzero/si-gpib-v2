'use client';

import { useState } from 'react';
import { UnifiedAidRequestData } from '@/lib/services/aid-request';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Building, Car, Clock, CheckCircle2, XCircle, AlertCircle, Send, FileEdit, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import { processApprovalAction, submitBantuanAction } from '@/app/actions/bantuan';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AidRequestFormSheet } from '@/components/bantuan/AidRequestFormSheet';

interface AidRequestDetailClientProps {
  data: UnifiedAidRequestData;
  contextId: string;
}

export function AidRequestDetailClient({ data }: AidRequestDetailClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState<'approve' | 'reject' | 'submit' | null>(null);
  const [catatan, setCatatan] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResubmitOpen, setIsResubmitOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-state-warning/10 text-state-warning';
      case 'Pending_KMJ': 
      case 'Pending_Mupel':
      case 'Pending_Sinode': return 'bg-brand-secondary/10 text-brand-secondary';
      case 'Approved': return 'bg-state-success/10 text-state-success';
      case 'Rejected': return 'bg-state-error/10 text-state-error';
      default: return 'bg-bg-subtle text-text-subtle';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft': return <FileEdit size={16} />;
      case 'Pending_KMJ': 
      case 'Pending_Mupel':
      case 'Pending_Sinode': return <Clock size={16} />;
      case 'Approved': return <CheckCircle2 size={16} />;
      case 'Rejected': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const handleAction = async () => {
    if (!showConfirm) return;
    setIsProcessing(true);
    try {
      if (showConfirm === 'approve') {
        const step = data.status === 'Pending_KMJ' ? 1 : 2;
        await processApprovalAction({ id_ajuan: data.id_ajuan, aksi: 'approve', catatan, step });
        toast.success('Pengajuan disetujui');
      } else if (showConfirm === 'reject') {
        await processApprovalAction({ id_ajuan: data.id_ajuan, aksi: 'reject', catatan });
        toast.success('Pengajuan ditolak');
      } else if (showConfirm === 'submit') {
        await submitBantuanAction(data.id_ajuan);
        toast.success('Pengajuan berhasil disubmit');
      }
      setShowConfirm(null);
      setCatatan('');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-base pb-32">
      {/* Header */}
      <header className="bg-bg-surface border-b border-border-subtle pt-12 pb-6 px-4 sticky top-0 z-20">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-xl font-bold text-text-strong leading-tight">
              {data.judul_ajuan}
            </h1>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold ${getStatusColor(data.status)}`}>
                {getStatusIcon(data.status)}
                {data.status.replace('_', ' ')}
              </div>
              {data.canEdit && (
                <button 
                  onClick={() => setIsEditOpen(true)} 
                  className="p-1.5 text-brand-primary hover:bg-brand-primary/10 rounded-full transition-colors flex-shrink-0"
                  title="Edit Pengajuan"
                >
                  <FileEdit size={18} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-subtle">
            <span className="font-semibold text-brand-primary">Rp {formatNumber(data.estimasi_biaya)}</span>
            <span>•</span>
            <Link href={`/org/${data.id_pos}`} className="hover:underline flex items-center gap-1">
              <Building size={14} />
              {data.nama_pos}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {/* Detail Section */}
        <section>
          <h2 className="text-sm font-bold text-text-strong uppercase tracking-wider mb-3">Detail & Justifikasi</h2>
          <Card className="bg-bg-surface border-border-subtle">
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-xs text-text-muted uppercase mb-1">Kategori Bantuan</p>
                <p className="font-medium text-text-strong">{data.jenis_bantuan}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase mb-1">Urgensi</p>
                <p className="font-medium text-text-strong">{data.urgensi}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase mb-1">Deskripsi</p>
                <p className="text-sm text-text-strong whitespace-pre-wrap">{data.deskripsi}</p>
              </div>
              
              {data.aset_terkait && (
                <div className="pt-4 border-t border-border-subtle">
                  <p className="text-xs text-text-muted uppercase mb-2">Aset Terkait</p>
                  <Link href={`/assets/${data.id_pos}`}>
                    <div className="flex items-center gap-3 p-3 bg-bg-base rounded-lg active:scale-[0.98] transition-transform">
                      {data.aset_terkait.kategori === 'Tanah' && <MapPin className="text-brand-primary" />}
                      {data.aset_terkait.kategori === 'Bangunan' && <Building className="text-brand-secondary" />}
                      {data.aset_terkait.kategori === 'Bergerak' && <Car className="text-brand-tertiary" />}
                      <div>
                        <p className="font-medium text-sm text-text-strong">{data.aset_terkait.kategori}</p>
                        <p className="text-xs text-text-subtle">{data.aset_terkait.keterangan}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Workflow Timeline Section */}
        <section>
          <h2 className="text-sm font-bold text-text-strong uppercase tracking-wider mb-3">Workflow Timeline</h2>
          <Card className="bg-bg-surface border-border-subtle">
            <CardContent className="p-4">
              <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2.5 before:w-0.5 before:-translate-x-px before:bg-border-subtle">
                {/* Initial Submit */}
                <div className="relative">
                  <div className="absolute -left-8 w-5 h-5 rounded-full border-4 border-bg-surface bg-brand-primary flex items-center justify-center">
                    <Send size={10} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-strong text-sm">Diajukan</h3>
                    <p className="text-xs text-text-subtle mt-0.5">Oleh {data.diajukan_oleh_nama}</p>
                    <time className="text-xs text-text-muted">{new Date(data.tgl_diajukan || '').toLocaleString('id-ID')}</time>
                  </div>
                </div>

                {/* Timeline Items */}
                {data.timeline.map((item) => (
                  <div key={item.id_approval} className="relative">
                    <div className={`absolute -left-8 w-5 h-5 rounded-full border-4 border-bg-surface flex items-center justify-center ${
                      item.aksi === 'Approved' ? 'bg-state-success' : 'bg-state-error'
                    }`}>
                      {item.aksi === 'Approved' ? <CheckCircle2 size={10} className="text-white" /> : <XCircle size={10} className="text-white" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-strong text-sm">
                        {item.aksi === 'Approved' ? 'Disetujui' : 'Ditolak'} ({item.role_approver})
                      </h3>
                      <p className="text-xs text-text-subtle mt-0.5">Oleh {item.approver_nama}</p>
                      <time className="text-xs text-text-muted">{new Date(item.created_at).toLocaleString('id-ID')}</time>
                      {item.catatan && (
                        <p className="text-sm text-text-strong mt-2 p-2 bg-bg-base rounded-md border border-border-subtle border-l-2 border-l-state-info">
                          "{item.catatan}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Sticky Bottom Action Bar */}
      {(data.canApprove || data.canSubmit || data.canResubmit) && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-bg-surface border-t border-border-subtle shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-30 flex gap-3 pb-safe">
          {data.canApprove && (
            <>
              <button 
                onClick={() => setShowConfirm('reject')}
                className="flex-1 py-3 px-4 rounded-xl border border-state-error text-state-error font-semibold text-center hover:bg-state-error/5 active:scale-95 transition-all"
              >
                Tolak
              </button>
              <button 
                onClick={() => setShowConfirm('approve')}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-primary text-white font-semibold text-center hover:bg-brand-primary/90 active:scale-95 transition-all shadow-md shadow-brand-primary/20"
              >
                Setujui
              </button>
            </>
          )}
          {data.canSubmit && (
            <button 
              onClick={() => setShowConfirm('submit')}
              className="w-full py-3 px-4 rounded-xl bg-brand-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-brand-primary/90 active:scale-95 transition-all shadow-md shadow-brand-primary/20"
            >
              <Send size={18} />
              Kirim Pengajuan
            </button>
          )}
          {data.canResubmit && (
            <button 
              onClick={() => setIsResubmitOpen(true)}
              className="w-full py-3 px-4 rounded-xl border border-border-strong text-text-strong font-semibold flex items-center justify-center gap-2 hover:bg-bg-subtle active:scale-95 transition-all"
            >
              <RefreshCw size={18} />
              Ajukan Ulang
            </button>
          )}
        </div>
      )}

      {/* Forms (Bottom Sheets) */}
      <AidRequestFormSheet
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        mode="edit"
        initialData={{
          id_ajuan: data.id_ajuan,
          jenis_bantuan: data.jenis_bantuan,
          deskripsi: data.deskripsi,
          estimasi_biaya: data.estimasi_biaya,
          urgensi: data.urgensi,
          id_aset_terkait: data.aset_terkait?.id || null,
        }}
      />
      <AidRequestFormSheet
        isOpen={isResubmitOpen}
        onClose={() => setIsResubmitOpen(false)}
        mode="ajukan-ulang"
        initialData={{
          id_ajuan_lama: data.id_ajuan,
          jenis_bantuan: data.jenis_bantuan,
          deskripsi: data.deskripsi,
          estimasi_biaya: data.estimasi_biaya,
          urgensi: data.urgensi,
          id_aset_terkait: data.aset_terkait?.id || null,
        }}
      />

      {/* Bottom Sheet Confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-bg-surface w-full max-w-md rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom-8">
            <h3 className="text-lg font-bold mb-2">Konfirmasi Aksi</h3>
            <p className="text-sm text-text-subtle mb-4">
              Apakah Anda yakin ingin {showConfirm === 'approve' ? 'menyetujui' : showConfirm === 'reject' ? 'menolak' : 'melanjutkan aksi pada'} pengajuan ini?
            </p>
            
            {(showConfirm === 'approve' || showConfirm === 'reject') && (
              <textarea 
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                placeholder="Tambahkan catatan (opsional)"
                className="w-full p-3 bg-bg-base border border-border-subtle rounded-xl text-sm mb-4 min-h-[100px] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
              />
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-border-strong text-text-strong font-semibold"
                disabled={isProcessing}
              >
                Batal
              </button>
              <button 
                onClick={handleAction}
                disabled={isProcessing || (showConfirm === 'reject' && !catatan)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white ${
                  showConfirm === 'reject' ? 'bg-state-error' : 'bg-brand-primary'
                } disabled:opacity-50 flex justify-center items-center`}
              >
                {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
