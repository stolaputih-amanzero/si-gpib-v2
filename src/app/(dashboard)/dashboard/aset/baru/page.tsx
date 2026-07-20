'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PackagePlus } from 'lucide-react';
import { AssetFormTabs } from '@/components/asset/AssetFormTabs';

function AssetBaruContent() {
  const searchParams = useSearchParams();
  // id_pos bisa didapat dari query params (?id_pos=POS-123)
  const idPos = searchParams.get('id_pos') || '';

  return (
    <div className="min-h-screen bg-surface-base pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/80 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <PackagePlus className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-text-high leading-tight">
              Tambah Aset Baru
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              {idPos ? `Pos Pelkes: ${idPos}` : 'Parameter Pos Pelkes Kosong'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {!idPos ? (
          <div className="p-4 bg-error/10 border border-error/20 rounded-md shadow-sm">
             <p className="text-sm font-medium text-error">
               Parameter id_pos tidak ditemukan. Silakan akses halaman ini dari menu Detail Pos Pelkes.
             </p>
          </div>
        ) : (
          <AssetFormTabs idPos={idPos} />
        )}
      </div>
    </div>
  );
}

export default function AssetBaruPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-text-muted animate-pulse font-medium">
        Memuat formulir aset...
      </div>
    }>
      <AssetBaruContent />
    </Suspense>
  );
}
