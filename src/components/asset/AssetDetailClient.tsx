'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Building, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';
import type { JenisAset } from '@/lib/domains/aset/aset.types';

export function AssetDetailClient({ asset, idAsset }: { asset: any, idAsset: string }) {
  const router = useRouter();
  const jenis: JenisAset = asset.type;

  return (
    <div className="min-h-screen bg-bg-base pb-24">
      {/* Sticky Header */}
      <header className="bg-bg-surface border-b border-border-subtle sticky top-0 z-20 pt-safe">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 text-text-muted hover:bg-bg-base"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-text-strong leading-tight">
              Detail Aset
            </h1>
            <p className="text-xs text-text-subtle capitalize">
              {jenis}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
              {jenis === 'tanah' && <MapPin size={24} />}
              {jenis === 'bangunan' && <Building size={24} />}
              {jenis === 'bergerak' && <Car size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-strong">
                {asset.m_pos_pelkes?.nama_pos || asset.merk_tipe || asset.nama || 'Data Aset'}
              </h2>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-surface-sunken text-text-muted rounded border border-border-subtle">
                ID: {idAsset.substring(0, 8)}...
              </span>
            </div>
          </div>

          <hr className="border-border-subtle my-2" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            {jenis === 'tanah' && (
              <>
                <div>
                  <p className="text-text-subtle text-xs mb-1">Luas (m²)</p>
                  <p className="font-medium text-text-strong">{formatNumber(asset.luas_m2 || 0)} m²</p>
                </div>
                <div>
                  <p className="text-text-subtle text-xs mb-1">Status Hukum</p>
                  <p className="font-medium text-text-strong">{asset.status_hukum || '-'}</p>
                </div>
                <div>
                  <p className="text-text-subtle text-xs mb-1">Kondisi</p>
                  <p className="font-medium text-text-strong">{asset.kondisi || '-'}</p>
                </div>
                <div>
                  <p className="text-text-subtle text-xs mb-1">Tahun Perolehan</p>
                  <p className="font-medium text-text-strong">{asset.thn_perolehan || '-'}</p>
                </div>
              </>
            )}

            {jenis === 'bangunan' && (
              <>
                <div>
                  <p className="text-text-subtle text-xs mb-1">Fungsi</p>
                  <p className="font-medium text-text-strong">{asset.fungsi || '-'}</p>
                </div>
                <div>
                  <p className="text-text-subtle text-xs mb-1">Kondisi</p>
                  <p className="font-medium text-text-strong">{asset.kondisi || '-'}</p>
                </div>
                <div>
                  <p className="text-text-subtle text-xs mb-1">Tahun Berdiri</p>
                  <p className="font-medium text-text-strong">{asset.thn_berdiri || '-'}</p>
                </div>
              </>
            )}

            {jenis === 'bergerak' && (
              <>
                <div>
                  <p className="text-text-subtle text-xs mb-1">Jenis</p>
                  <p className="font-medium text-text-strong">{asset.jenis || '-'}</p>
                </div>
                <div>
                  <p className="text-text-subtle text-xs mb-1">Merk / Tipe</p>
                  <p className="font-medium text-text-strong">{asset.merk_tipe || '-'}</p>
                </div>
                <div>
                  <p className="text-text-subtle text-xs mb-1">Tahun Perolehan</p>
                  <p className="font-medium text-text-strong">{asset.thn_perolehan || '-'}</p>
                </div>
                {asset.no_polisi && (
                  <div>
                    <p className="text-text-subtle text-xs mb-1">No Polisi</p>
                    <p className="font-medium text-text-strong font-mono uppercase">{asset.no_polisi}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {asset.keterangan && (
            <div className="pt-2">
              <p className="text-text-subtle text-xs mb-1">Keterangan</p>
              <p className="font-medium text-text-strong whitespace-pre-wrap text-sm leading-relaxed">
                {asset.keterangan}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
