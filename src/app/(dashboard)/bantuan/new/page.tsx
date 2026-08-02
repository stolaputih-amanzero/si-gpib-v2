import { Suspense } from 'react';
import { BantuanFormClient } from '@/components/bantuan/BantuanFormClient';

export default function BantuanNewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-text-muted animate-pulse font-medium">Memuat form pengajuan bantuan...</div>}>
      <BantuanFormClient />
    </Suspense>
  );
}
