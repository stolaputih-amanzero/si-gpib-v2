'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PackagePlus } from 'lucide-react';
import { AssetFormTabs } from '@/components/asset/AssetFormTabs';
import { PosCascadingSelector } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';

function AssetBaruContent() {
  const searchParams = useSearchParams();
  const idPosQuery = searchParams.get('id_pos') || '';
  const [selectedPosId, setSelectedPosId] = useState(idPosQuery);

  useEffect(() => {
    if (idPosQuery) {
      setSelectedPosId(idPosQuery);
    }
  }, [idPosQuery]);

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
              {selectedPosId ? `Pos Pelkes: ${selectedPosId}` : 'Pilih Pos Pelkes pemilik aset'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Selector jika id_pos belum dipilih */}
        <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft space-y-3">
          <h2 className="text-sm font-semibold text-text-high">Pilih Lokasi Pos Pelkes *</h2>
          <PosCascadingSelector
            value={selectedPosId}
            onChange={setSelectedPosId}
            defaultPosId={idPosQuery || undefined}
          />
        </div>

        {selectedPosId ? (
          <AssetFormTabs idPos={selectedPosId} />
        ) : (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-medium text-center">
            Silakan pilih Mupel, Jemaat, dan Pos Pelkes terlebih dahulu di atas untuk mengisi data aset.
          </div>
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
