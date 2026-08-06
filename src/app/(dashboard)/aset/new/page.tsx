import { Suspense } from 'react';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { AsetForm } from '@/components/aset/AsetForm';
import type { Metadata } from 'next';
import type { JenisAset } from '@/lib/domains/aset/aset.types';

export const metadata: Metadata = {
  title: 'Tambah Aset | SI GPIB',
};

const VALID_JENIS: JenisAset[] = ['tanah', 'bangunan', 'bergerak'];

interface Props {
  searchParams: Promise<{ jenis?: string; pos?: string }>;
}

export default async function NewAsetPage({ searchParams }: Props) {
  const params = await searchParams;
  const jenis = (params.jenis as JenisAset) || 'tanah';
  const idPos = params.pos;

  if (!VALID_JENIS.includes(jenis)) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <MobileHeader />
        <main className="flex-1 p-4 text-center text-red-600">
          Jenis aset tidak valid: {jenis}
        </main>
      </div>
    );
  }

  if (!idPos) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <MobileHeader />
        <main className="flex-1 p-4 text-center text-red-600">
          ID Pos tidak ditemukan. Silakan akses dari halaman Pos Pelkes.
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MobileHeader />
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<div className="p-4 text-center">Memuat...</div>}>
          <AsetForm jenis={jenis} idPos={idPos} />
        </Suspense>
      </main>
    </div>
  );
}
