import { Suspense } from 'react';
import { AssetFormClient } from '@/components/asset/AssetFormClient';

export default function AssetBaruPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-text-muted animate-pulse font-medium">
          Memuat formulir aset...
        </div>
      }
    >
      <AssetFormClient />
    </Suspense>
  );
}
