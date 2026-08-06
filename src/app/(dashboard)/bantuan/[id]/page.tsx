// src/app/(dashboard)/bantuan/[id]/page.tsx
// Halaman: Detail Pengajuan Bantuan + Timeline + Aksi Kontekstual
// Ref: PRD US-10.2/10.3/10.4/10.5/10.6, EIA v0.1.1 §6.2 (Permission × State)

'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  Pencil,
  Send,
  Trash2,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BantuanStatusBadge } from '@/components/bantuan/BantuanStatusBadge';
import { BantuanTimeline } from '@/components/bantuan/BantuanTimeline';
import { BantuanReviewActions } from '@/components/bantuan/BantuanReviewActions';
import { AjukanUlangButton } from '@/components/bantuan/AjukanUlangButton';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useBantuanDetail,
  useSubmitBantuan,
  useDeleteBantuan,
} from '@/lib/domains/bantuan/bantuan.queries';
import { useCurrentProfile } from '@/hooks/use-current-profile';
import { haptic } from '@/lib/haptic/vibrate';
import { logger } from '@/lib/utils/logger';
import type {
  StatusBantuan,
  PengajuanBantuanWithRelations,
} from '@/lib/domains/bantuan/bantuan.types';

// ============================================================
// HELPERS
// ============================================================

const URGENSI_BADGE: Record<string, string> = {
  Rendah: 'bg-gray-100 text-gray-700',
  Sedang: 'bg-yellow-100 text-yellow-800',
  Tinggi: 'bg-orange-100 text-orange-800',
  Darurat: 'bg-red-100 text-red-800',
};

/**
 * Build langkah timeline dari data pengajuan.
 * Mengikuti urutan workflow: Draft → KMJ → Mupel → Sinode → Keputusan.
 */
function buildTimelineSteps(p: PengajuanBantuanWithRelations) {
  const finalStatus: StatusBantuan = p.status === 'Rejected' ? 'Rejected' : 'Approved';
  const finalLabel = p.status === 'Rejected' ? 'Ditolak' : 'Disetujui (Final)';

  return [
    {
      status: 'Draft' as StatusBantuan,
      label: 'Draft Dibuat',
      timestamp: p.created_at,
      actor: p.nama_pemohon,
      catatan: null,
    },
    {
      status: 'Pending_KMJ' as StatusBantuan,
      label: 'Diajukan ke KMJ',
      timestamp: p.tgl_diajukan,
      actor: p.nama_pemohon,
      catatan: null,
    },
    {
      status: 'Pending_Mupel' as StatusBantuan,
      label: 'Review KMJ',
      timestamp: p.tgl_review_kmj,
      actor: null,
      catatan: p.catatan_kmj,
    },
    {
      status: 'Pending_Sinode' as StatusBantuan,
      label: 'Review Admin Mupel',
      timestamp: p.tgl_review_mupel,
      actor: null,
      catatan: p.catatan_mupel,
    },
    {
      status: finalStatus,
      label: finalLabel,
      timestamp: p.tgl_keputusan_sinode,
      actor: null,
      catatan: p.catatan_sinode,
    },
  ];
}

function formatTanggal(iso: string | null | undefined): string {
  if (!iso) return '-';
  return format(new Date(iso), 'd MMM yyyy', { locale: localeId });
}

// ============================================================
// SKELETON & ERROR STATES
// ============================================================

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      <Skeleton className="h-11 w-11 rounded-full" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

function DetailError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h1 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        Gagal Memuat Data
      </h1>
      <p className="text-base text-gray-600 text-center mb-6 max-w-xs">{message}</p>
      <Button variant="outline" size="lg" onClick={onRetry} className="min-h-[48px]">
        <RefreshCw className="w-4 h-4 mr-2" />
        Coba Lagi
      </Button>
    </div>
  );
}

// ============================================================
// PAGE COMPONENT
// ============================================================

export default function BantuanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 16: params adalah Promise — gunakan use()
  const { id } = use(params);
  const router = useRouter();

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { data: pengajuan, isLoading, isError, error, refetch } = useBantuanDetail(id);
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const submitMutation = useSubmitBantuan();
  const deleteMutation = useDeleteBantuan();

  // Loading
  if (isLoading || profileLoading) {
    return <DetailSkeleton />;
  }

  // Error
  if (isError) {
    return (
      <DetailError
        message={(error as Error).message}
        onRetry={() => refetch()}
      />
    );
  }

  if (!pengajuan) {
    return (
      <DetailError message="Pengajuan bantuan tidak ditemukan." onRetry={() => refetch()} />
    );
  }

  // Derived state
  const isPemohon = profile?.id === pengajuan.diajukan_oleh;
  const isDraft = pengajuan.status === 'Draft';
  const canEditOrSubmitOrDelete = isDraft && isPemohon;
  const timelineSteps = buildTimelineSteps(pengajuan);

  // ============================================================
  // HANDLERS (Draft actions)
  // ============================================================

  const handleSubmitDraft = () => {
    submitMutation.mutate(pengajuan.id_ajuan, {
      onSuccess: () => {
        haptic('success');
        toast.success('Pengajuan berhasil dikirim', {
          description: 'Status berubah menjadi "Menunggu KMJ"',
        });
      },
      onError: (err) => {
        haptic('error');
        logger.error('Gagal submit pengajuan bantuan', err as Error);
        toast.error('Gagal mengirim pengajuan', {
          description: (err as Error).message,
        });
      },
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(pengajuan.id_ajuan, {
      onSuccess: () => {
        haptic('success');
        toast.success('Draft pengajuan dihapus');
        router.push('/bantuan');
      },
      onError: (err) => {
        haptic('error');
        logger.error('Gagal hapus pengajuan bantuan', err as Error);
        toast.error('Gagal menghapus pengajuan', {
          description: (err as Error).message,
        });
        setConfirmingDelete(false);
      },
    });
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ===== Header ===== */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 flex-shrink-0"
            onClick={() => router.back()}
            aria-label="Kembali ke daftar bantuan"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              Detail Pengajuan
            </h1>
            <p className="text-xs text-gray-500">{pengajuan.id_ajuan}</p>
          </div>
          <BantuanStatusBadge status={pengajuan.status} />
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* ===== Badge "Pengajuan Ulang" (jika ada referensi ke pengajuan lama) ===== */}
        {pengajuan.id_pengajuan_sebelumnya && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <RefreshCw className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              Ini adalah pengajuan ulang dari{' '}
              <span className="font-semibold">{pengajuan.id_pengajuan_sebelumnya}</span>{' '}
              yang ditolak.
            </p>
          </div>
        )}

        {/* ===== Card Info Utama ===== */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{pengajuan.jenis_bantuan}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-base text-gray-700 leading-relaxed">
              {pengajuan.deskripsi}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">Estimasi Biaya</p>
                <p className="text-base font-semibold text-gray-900">
                  Rp {pengajuan.estimasi_biaya.toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Tingkat Urgensi</p>
                <span
                  className={`inline-block text-sm font-medium px-2.5 py-0.5 rounded-full ${
                    URGENSI_BADGE[pengajuan.urgensi] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {pengajuan.urgensi}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{pengajuan.nama_pos}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Diajukan oleh {pengajuan.nama_pemohon}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Dibuat {formatTanggal(pengajuan.created_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== Timeline Status (PRD US-10.5) ===== */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Status Pengajuan</CardTitle>
          </CardHeader>
          <CardContent>
            <BantuanTimeline steps={timelineSteps} currentStatus={pengajuan.status} />
          </CardContent>
        </Card>

        {/* ===== Aksi Kontekstual Berdasarkan Role & Status (EIA §6.2) ===== */}
        {profile && (
          <BantuanReviewActions
            idAjuan={pengajuan.id_ajuan}
            status={pengajuan.status}
            userRole={profile.role}
          />
        )}

        {/* ===== Tombol "Ajukan Ulang" (status=Rejected + pemohon) ===== */}
        {profile && (
          <AjukanUlangButton
            idAjuanLama={pengajuan.id_ajuan}
            currentUserId={profile.id}
            diajukanOleh={pengajuan.diajukan_oleh}
            status={pengajuan.status}
          />
        )}

        {/* ===== Draft Actions: Edit / Submit / Delete (pemohon + status Draft) ===== */}
        {canEditOrSubmitOrDelete && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Aksi Draft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                size="lg"
                className="w-full min-h-[48px]"
                onClick={handleSubmitDraft}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit untuk Review KMJ
              </Button>

              <Link href={`/bantuan/edit/${pengajuan.id_ajuan}`} className="block">
                <Button variant="outline" size="lg" className="w-full min-h-[48px]">
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Draft
                </Button>
              </Link>

              {/* Delete dengan konfirmasi inline dua-tahap */}
              {!confirmingDelete ? (
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full min-h-[48px] text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setConfirmingDelete(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Draft
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 min-h-[48px]"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleteMutation.isPending}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="flex-1 min-h-[48px]"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Yakin Hapus
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
