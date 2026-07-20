'use client';

import { useState } from 'react';
import { useAsetList, useDeleteAset } from '@/hooks/use-aset';
import { AsetTabs } from '@/components/aset/AsetTabs';
import { AsetCard } from '@/components/aset/AsetCard';
import { Plus, Search, Box } from 'lucide-react';
import Link from 'next/link';

export default function AsetOverviewPage() {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPos] = useState<string>('');

  const { data: asetList, isLoading } = useAsetList({
    kategori: activeCategory || undefined,
    search: searchQuery || undefined,
    id_pos: selectedPos || undefined,
  });

  const deleteMutation = useDeleteAset();

  const handleDelete = async (id: string, kategori: 'TANAH' | 'BANGUNAN' | 'BERGERAK') => {
    if (confirm('Apakah Anda yakin ingin menghapus data aset ini? Dokumen lampiran juga akan terhapus.')) {
      await deleteMutation.mutateAsync({ id, kategori });
    }
  };

  // Calculate Category Counts
  const counts = {
    ALL: asetList?.length || 0,
    TANAH: asetList?.filter(a => a.kategori === 'TANAH').length || 0,
    BANGUNAN: asetList?.filter(a => a.kategori === 'BANGUNAN').length || 0,
    BERGERAK: asetList?.filter(a => a.kategori === 'BERGERAK').length || 0,
  };

  return (
    <div className="w-full min-h-full bg-surface-base pb-32 md:pb-12">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 bg-surface-elevated/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">Inventaris Aset Pos Pelkes</h1>
            <p className="text-xs md:text-sm text-text-muted mt-0.5">Pendataan Aset Tanah, Bangunan & Bergerak GPIB</p>
          </div>

          <Link
            href="/dashboard/pos-pelkes"
            className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Tambah Aset Baru</span>
            <span className="sm:hidden">+ Aset</span>
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-5 space-y-6">
        {/* KPI Cards Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-text-muted font-medium">Total Aset Recorded</p>
            <p className="text-2xl font-serif font-bold text-brand-primary tabular-nums mt-1">{counts.ALL}</p>
            <p className="text-[11px] text-text-muted mt-0.5">Seluruh Kategori</p>
          </div>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Aset Tanah</p>
            <p className="text-2xl font-serif font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-1">{counts.TANAH}</p>
            <p className="text-[11px] text-text-muted mt-0.5">Lahan Pos Pelkes</p>
          </div>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Aset Bangunan</p>
            <p className="text-2xl font-serif font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-1">{counts.BANGUNAN}</p>
            <p className="text-[11px] text-text-muted mt-0.5">Gereja / Pastori</p>
          </div>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">Aset Bergerak</p>
            <p className="text-2xl font-serif font-bold text-pink-600 dark:text-pink-400 tabular-nums mt-1">{counts.BERGERAK}</p>
            <p className="text-[11px] text-text-muted mt-0.5">Kendaraan / Peralatan</p>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Cari aset (nama pos, jenis, status hukum)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
            />
          </div>

          {/* Category Tabs */}
          <AsetTabs
            activeTab={activeCategory}
            onTabChange={setActiveCategory}
            counts={counts}
          />
        </div>

        {/* Assets Cards Grid / List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-high">
              Daftar Inventaris Aset {activeCategory ? `(${activeCategory})` : ''}
            </h2>
            <span className="text-xs text-text-muted">
              {isLoading ? 'Memuat...' : `${asetList?.length || 0} Aset Terdaftar`}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-surface-elevated p-4 rounded-xl border border-border-subtle animate-pulse space-y-3">
                  <div className="h-4 bg-surface-sunken rounded w-3/4"></div>
                  <div className="h-3 bg-surface-sunken rounded w-1/2"></div>
                  <div className="h-12 bg-surface-sunken rounded"></div>
                </div>
              ))}
            </div>
          ) : asetList && asetList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {asetList.map((item) => (
                <AsetCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-elevated rounded-xl p-8 text-center border border-border-subtle space-y-2">
              <Box size={36} className="mx-auto text-text-muted opacity-50" />
              <p className="font-semibold text-text-high text-sm">Belum Ada Aset Terdaftar</p>
              <p className="text-xs text-text-muted">
                {searchQuery || activeCategory
                  ? 'Tidak ada data aset yang cocok dengan kriteria pencarian.'
                  : 'Pilih Pos Pelkes untuk mulai memasukkan inventaris aset baru.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
