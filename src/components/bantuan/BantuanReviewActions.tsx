'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  useReviewKMJ,
  useReviewAdminMupel,
  useReviewSuperUser,
} from '@/lib/domains/bantuan/bantuan.queries';
import { haptic } from '@/lib/haptic/vibrate';
import { logger } from '@/lib/utils/logger';
import type { StatusBantuan } from '@/lib/domains/bantuan/bantuan.types';

interface BantuanReviewActionsProps {
  idAjuan: string;
  status: StatusBantuan;
  /** Role user yang sedang login */
  userRole: 'super_user' | 'admin_mupel' | 'kmj' | 'pj' | 'user';
}

interface RoleReviewConfig {
  title: string;
  description: string;
  expectedStatus: StatusBantuan;
  approveLabel: string;
  rejectLabel: string;
}

const ROLE_CONFIG: Record<string, RoleReviewConfig> = {
  kmj: {
    title: 'Review KMJ',
    description: 'Anda sebagai Ketua Majelis Jemaat. Tinjau dan ambil keputusan.',
    expectedStatus: 'Pending_KMJ',
    approveLabel: 'Setujui (Lanjut ke Mupel)',
    rejectLabel: 'Tolak',
  },
  admin_mupel: {
    title: 'Review Admin Mupel',
    description: 'Anda sebagai Admin Mupel. Tinjau pengajuan yang sudah disetujui KMJ.',
    expectedStatus: 'Pending_Mupel',
    approveLabel: 'Setujui (Lanjut ke Sinode)',
    rejectLabel: 'Tolak',
  },
  super_user: {
    title: 'Keputusan Akhir Sinode',
    description: 'Anda sebagai Super User Sinode. Berikan keputusan final.',
    expectedStatus: 'Pending_Sinode',
    approveLabel: 'Setujui (Final)',
    rejectLabel: 'Tolak',
  },
};

export function BantuanReviewActions({
  idAjuan,
  status,
  userRole,
}: BantuanReviewActionsProps) {
  const router = useRouter();
  const [catatan, setCatatan] = useState('');
  const [isPending, startTransition] = useTransition();

  const reviewKMJ = useReviewKMJ();
  const reviewMupel = useReviewAdminMupel();
  const reviewSinode = useReviewSuperUser();

  const config = ROLE_CONFIG[userRole];

  // Guard: tidak ada config = role bukan reviewer
  if (!config) return null;

  // Guard: status tidak sesuai expected = bukan giliran role ini
  if (status !== config.expectedStatus) return null;

  const getMutation = () => {
    if (userRole === 'kmj') return reviewKMJ;
    if (userRole === 'admin_mupel') return reviewMupel;
    return reviewSinode;
  };

  const handleReview = (keputusan: 'approve' | 'reject') => {
    // Reject wajib ada catatan
    if (keputusan === 'reject' && catatan.trim().length < 5) {
      toast.error('Catatan penolakan wajib diisi', {
        description: 'Minimal 5 karakter untuk alasan penolakan',
      });
      return;
    }

    startTransition(async () => {
      try {
        const mutation = getMutation();
        await mutation.mutateAsync({
          id_ajuan: idAjuan,
          keputusan,
          catatan: catatan.trim() || null,
        });
        haptic('success');
        toast.success(
          keputusan === 'approve'
            ? 'Pengajuan disetujui'
            : 'Pengajuan ditolak'
        );
        router.refresh();
      } catch (err) {
        haptic('error');
        logger.error('Gagal proses review bantuan', err as Error);
        toast.error('Gagal memproses review', {
          description: (err as Error).message,
        });
      }
    });
  };

  const isSubmitting =
    isPending || reviewKMJ.isPending || reviewMupel.isPending || reviewSinode.isPending;

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          {config.title}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">{config.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Catatan Reviewer */}
        <div className="space-y-2">
          <Label htmlFor="catatan-review" className="text-sm font-medium">
            Catatan Review {status === 'Pending_KMJ' ? '(Opsional)' : '(Wajib jika menolak)'}
          </Label>
          <Textarea
            id="catatan-review"
            placeholder="Tulis catatan, pertanyaan, atau alasan keputusan Anda..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="text-base min-h-[80px] resize-none"
            disabled={isSubmitting}
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 text-right">
            {catatan.length}/1000
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-[48px] border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => handleReview('reject')}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            {config.rejectLabel}
          </Button>
          <Button
            type="button"
            size="lg"
            className="min-h-[48px] bg-green-600 hover:bg-green-700"
            onClick={() => handleReview('approve')}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            {config.approveLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
