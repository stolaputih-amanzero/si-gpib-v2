'use client';

import { use } from 'react';
import { AsetForm } from '@/components/aset/AsetForm';
import { KategoriAsetKode } from '@/lib/constants/aset';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AsetFormPage({ 
  params 
}: { 
  params: Promise<{ id_pos: string; kategori: string }> 
}) {
  const resolvedParams = use(params);
  const id_pos = resolvedParams.id_pos;
  const rawKategori = resolvedParams.kategori.toUpperCase();

  const validKategori: KategoriAsetKode = 
    rawKategori === 'BANGUNAN' ? 'BANGUNAN' : 
    rawKategori === 'BERGERAK' ? 'BERGERAK' : 'TANAH';

  return (
    <div className="w-full min-h-full bg-surface-base pb-32 md:pb-12">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/aset/${id_pos}`}
              className="w-10 h-10 rounded-xl bg-surface-sunken flex items-center justify-center text-text-high hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-brand-primary truncate max-w-[200px] sm:max-w-xs">
                Input Inventaris Aset
              </h1>
              <p className="text-xs text-text-muted">Pos Pelkes ID: {id_pos}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-surface-elevated p-4 sm:p-6 rounded-2xl border border-border-subtle shadow-soft">
          <AsetForm 
            id_pos={id_pos} 
            defaultKategori={validKategori} 
          />
        </div>
      </main>
    </div>
  );
}
