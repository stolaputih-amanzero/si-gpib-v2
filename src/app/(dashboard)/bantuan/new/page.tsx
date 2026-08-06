// src/app/(dashboard)/bantuan/new/page.tsx
// Halaman: Buat Pengajuan Bantuan Baru (PRD US-10.1)

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin, Info } from 'lucide-react';
import { BantuanForm } from '@/components/bantuan/BantuanForm';
import { useCurrentProfile } from '@/hooks/use-current-profile';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/mobile/SkeletonList';

export default function BantuanNewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idPosParam = searchParams.get('id_pos');

  const { data: profile, isLoading } = useCurrentProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <SkeletonList count={4} />
      </div>
    );
  }

  // Tentukan id_pos: prioritas dari query param, lalu dari profil user (pj/user).
  const initialIdPos = idPosParam ?? profile?.id_pos ?? undefined;

  // Guard: jika tidak ada id_pos, tuntun user untuk memilih Pos terlebih dahulu.
  if (!initialIdPos) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900 text-center mb-2">
          Pilih Pos Pelkes Dahulu
        </h1>
        <p className="text-base text-gray-600 text-center max-w-xs mb-6">
          Pengajuan bantuan harus dikaitkan dengan satu Pos Pelkes. Silakan pilih Pos
          yang ingin Anda ajukan bantuannya.
        </p>
        <Button
          size="lg"
          className="min-h-[48px]"
          onClick={() => router.push('/dashboard/pos-pelkes')}
        >
          Buka Daftar Pos Pelkes
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 pb-24">
      {/* Info banner: Pos yang sedang dipilih */}
      <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900">
          Pengajuan untuk Pos Pelkes:{' '}
          <span className="font-semibold">{initialIdPos}</span>
        </p>
      </div>

      <BantuanForm mode="create" initialIdPos={initialIdPos} />
    </div>
  );
}
