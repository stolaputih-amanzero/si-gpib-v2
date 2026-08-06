// src/app/(dashboard)/bantuan/edit/[id]/page.tsx
// Halaman: Edit Draft Pengajuan Bantuan (hanya untuk status Draft)

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { BantuanForm } from '@/components/bantuan/BantuanForm';
import { useBantuanDetail } from '@/lib/domains/bantuan/bantuan.queries';
import { useCurrentProfile } from '@/hooks/use-current-profile';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/mobile/SkeletonList';

export default function EditBantuanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // Next.js 16 async params
  const router = useRouter();

  const { data: pengajuan, isLoading, isError } = useBantuanDetail(id);
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <SkeletonList count={4} />
      </div>
    );
  }

  if (isError || !pengajuan) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-base text-gray-700 text-center mb-4">
          Pengajuan tidak ditemukan.
        </p>
        <Button variant="outline" onClick={() => router.push('/bantuan')}>
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  // Guard: hanya Draft yang bisa diedit (EIA v0.1.1 — state machine)
  if (pengajuan.status !== 'Draft') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <p className="text-base text-gray-700 text-center mb-4">
          Pengajuan berstatus "{pengajuan.status}" tidak dapat diedit. Hanya Draft yang
          bisa diubah.
        </p>
        <Button variant="outline" onClick={() => router.push(`/bantuan/${id}`)}>
          Lihat Detail
        </Button>
      </div>
    );
  }

  // Guard: hanya pemohon atau super_user yang bisa edit
  const isPemohon = profile?.id === pengajuan.diajukan_oleh;
  const isSuperUser = profile?.role === 'super_user';
  if (!isPemohon && !isSuperUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-base text-gray-700 text-center mb-4">
          Anda tidak memiliki izin untuk mengedit pengajuan ini.
        </p>
        <Button variant="outline" onClick={() => router.push(`/bantuan/${id}`)}>
          Kembali ke Detail
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 pb-24">
      <BantuanForm
        mode="edit"
        initialData={{
          id_ajuan: pengajuan.id_ajuan,
          id_pos: pengajuan.id_pos,
          jenis_bantuan: pengajuan.jenis_bantuan,
          deskripsi: pengajuan.deskripsi,
          estimasi_biaya: pengajuan.estimasi_biaya,
          urgensi: pengajuan.urgensi,
          id_aset_tanah: pengajuan.id_aset_tanah,
          id_aset_bangunan: pengajuan.id_aset_bangunan,
          id_aset_bergerak: pengajuan.id_aset_bergerak,
        }}
      />
    </div>
  );
}
