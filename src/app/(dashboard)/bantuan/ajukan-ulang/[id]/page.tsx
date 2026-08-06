// src/app/(dashboard)/bantuan/ajukan-ulang/[id]/page.tsx
// Halaman: Ajukan Ulang Bantuan yang Ditolak (PRD US-10.6, EIA v0.1.1)
// Membuat record BARU berstatus Draft yang mereferensikan record lama.

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { BantuanForm } from '@/components/bantuan/BantuanForm';
import { useBantuanDetail } from '@/lib/domains/bantuan/bantuan.queries';
import { useCurrentProfile } from '@/hooks/use-current-profile';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/mobile/SkeletonList';

export default function AjukanUlangPage({
  params,
}: {
  params: Promise<{ id: string }>; // id = pengajuan lama yang ditolak
}) {
  const { id } = use(params); // Next.js 16 async params
  const router = useRouter();

  const { data: pengajuanLama, isLoading, isError } = useBantuanDetail(id);
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <SkeletonList count={4} />
      </div>
    );
  }

  if (isError || !pengajuanLama) {
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

  // Guard: hanya pengajuan Rejected yang bisa diajukan ulang (EIA v0.1.1 §5.1)
  if (pengajuanLama.status !== 'Rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <p className="text-base text-gray-700 text-center mb-4">
          Hanya pengajuan berstatus "Ditolak" yang dapat diajukan ulang. Pengajuan ini
          berstatus "{pengajuanLama.status}".
        </p>
        <Button variant="outline" onClick={() => router.push(`/bantuan/${id}`)}>
          Lihat Detail
        </Button>
      </div>
    );
  }

  // Guard: hanya pemohon asli yang bisa ajukan ulang (EIA v0.1.1 §6.2)
  if (profile?.id !== pengajuanLama.diajukan_oleh) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-base text-gray-700 text-center mb-4">
          Hanya pemohon asli yang dapat mengajukan ulang pengajuan ini.
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
        mode="ajukan-ulang"
        initialData={{
          id_ajuan_lama: pengajuanLama.id_ajuan,
          id_pos: pengajuanLama.id_pos,
          jenis_bantuan: pengajuanLama.jenis_bantuan,
          deskripsi: pengajuanLama.deskripsi,
          estimasi_biaya: pengajuanLama.estimasi_biaya,
          urgensi: pengajuanLama.urgensi,
          id_aset_tanah: pengajuanLama.id_aset_tanah,
          id_aset_bangunan: pengajuanLama.id_aset_bangunan,
          id_aset_bergerak: pengajuanLama.id_aset_bergerak,
        }}
      />
    </div>
  );
}
