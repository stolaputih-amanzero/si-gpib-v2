'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PackagePlus, Building, Loader2 } from 'lucide-react';
import { AssetFormTabs } from '@/components/asset/AssetFormTabs';
import { PosCascadingSelector, HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { createClient } from '@/lib/supabase/client';

function AssetBaruContent() {
  const searchParams = useSearchParams();
  const idPosQuery = searchParams.get('id_pos') || '';

  const [selectedPosId, setSelectedPosId] = useState<string>(idPosQuery);
  const [targetScope, setTargetScope] = useState<'pos' | 'jemaat'>('jemaat');
  const [hierarchyMeta, setHierarchyMeta] = useState<HierarchyMetaInfo | null>(null);
  const [isResolvingJemaatPos, setIsResolvingJemaatPos] = useState<boolean>(false);

  useEffect(() => {
    if (idPosQuery) {
      setSelectedPosId(idPosQuery);
    }
  }, [idPosQuery]);

  // Automatic Jemaat Pos resolver when targetScope is 'jemaat'
  useEffect(() => {
    if (targetScope === 'jemaat' && hierarchyMeta?.id_induk && !selectedPosId) {
      const resolveJemaatPos = async () => {
        setIsResolvingJemaatPos(true);
        try {
          const supabase = createClient();
          const jemaatId = hierarchyMeta.id_induk;

          const { data: posRows } = await supabase
            .from('m_pos_pelkes')
            .select('id_pos')
            .eq('id_induk', jemaatId)
            .limit(1);

          if (posRows && posRows[0]) {
            setSelectedPosId(posRows[0].id_pos);
          } else {
            const jemaatNama = hierarchyMeta.jemaatName || jemaatId;
            const createdPosId = `POS-${Math.floor(10000 + Math.random() * 90000)}`;
            const { error: insErr } = await supabase.from('m_pos_pelkes').insert({
              id_pos: createdPosId,
              id_induk: jemaatId,
              nama_pos: `Jemaat ${jemaatNama}`,
              kategori: 'Pos Pelkes',
            });
            if (!insErr) {
              setSelectedPosId(createdPosId);
            }
          }
        } catch (err) {
          console.error('Failed to resolve Jemaat Pos:', err);
        } finally {
          setIsResolvingJemaatPos(false);
        }
      };
      resolveJemaatPos();
    }
  }, [targetScope, hierarchyMeta, selectedPosId]);

  const handleScopeChange = (scope: 'jemaat' | 'pos') => {
    setTargetScope(scope);
    setSelectedPosId('');
  };

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
            <p className="text-xs text-text-muted mt-0.5">
              {targetScope === 'jemaat'
                ? `Wilayah Aset: Jemaat Induk ${hierarchyMeta?.jemaatName || ''}`
                : `Wilayah Aset: Pos Pelkes ${hierarchyMeta?.posName || selectedPosId || ''}`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Selector Target Lingkup & Cascading Selector */}
        <div className="bg-surface-elevated p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-soft space-y-4">
          {/* Target Lingkup Aset (Jemaat Induk vs Pos Pelkes) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Target Lingkup Aset *</label>
            <div className="grid grid-cols-2 gap-2 bg-surface-sunken p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleScopeChange('jemaat')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  targetScope === 'jemaat'
                    ? 'bg-surface-elevated text-brand-primary shadow-soft'
                    : 'text-text-muted hover:text-text-high'
                }`}
              >
                <span>⛪ Jemaat Induk</span>
              </button>
              <button
                type="button"
                onClick={() => handleScopeChange('pos')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  targetScope === 'pos'
                    ? 'bg-surface-elevated text-brand-primary shadow-soft'
                    : 'text-text-muted hover:text-text-high'
                }`}
              >
                <span>📍 Pos Pelkes / Bajem</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-bold text-text-high uppercase tracking-wider flex items-center gap-1.5">
                <Building size={14} className="text-brand-primary" />
                <span>Pilih Wilayah Lokasi Aset *</span>
              </h2>
              <span className="text-[11px] font-semibold text-text-muted">
                {targetScope === 'jemaat'
                  ? 'Pos Pelkes Opsional (Otomatis Level Jemaat)'
                  : 'Pos Pelkes Wajib Dipilih (Compulsory)'}
              </span>
            </div>

            <PosCascadingSelector
              value={selectedPosId}
              onChange={setSelectedPosId}
              onMetaChange={setHierarchyMeta}
              defaultPosId={idPosQuery || undefined}
              required={targetScope === 'pos'}
              hidePos={targetScope === 'jemaat'}
            />
          </div>
        </div>

        {/* Dynamic Form Content */}
        {isResolvingJemaatPos ? (
          <div className="p-8 bg-surface-elevated rounded-2xl border border-border-subtle text-center text-xs font-medium text-text-muted flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
            <span>Menyiapkan lokasi inventaris Aset Jemaat Induk...</span>
          </div>
        ) : selectedPosId ? (
          <AssetFormTabs idPos={selectedPosId} />
        ) : (
          <div className="p-5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 rounded-2xl text-xs font-medium text-center leading-relaxed">
            {targetScope === 'jemaat'
              ? 'Silakan pilih Mupel dan Jemaat Induk terlebih dahulu di atas untuk memasukkan data aset level Jemaat.'
              : 'Silakan pilih Mupel, Jemaat Induk, dan Pos Pelkes / Bajem (Wajib) di atas untuk memasukkan data aset.'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssetBaruPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-text-muted animate-pulse font-medium">
          Memuat formulir aset...
        </div>
      }
    >
      <AssetBaruContent />
    </Suspense>
  );
}
