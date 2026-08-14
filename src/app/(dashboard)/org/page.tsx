'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrgDirectoryHeader, OrgViewMode } from '@/components/org/OrgDirectoryHeader';
import { OrgCard } from '@/components/org/OrgCard';
import { HierarchyTree } from '@/components/hierarki/HierarchyTree';
import { useOrgDirectory } from '@/hooks/use-org-directory';
import { Building2, AlertTriangle, Search } from 'lucide-react';

export default function OrgDirectoryPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');

  // Default is 'tree' (Hierarki), kecuali jika datang dari URL query tab (misal klik StatCard di Beranda -> 'filtered')
  const [viewMode, setViewMode] = useState<OrgViewMode>(tabParam ? 'filtered' : 'tree');

  const {
    items,
    mupelList,
    stats,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isLoading,
    isError,
    refetch,
  } = useOrgDirectory();

  // Otomatis aktifkan view 'filtered' jika tabParam di URL berubah (misal navigasi dari deep link / statcard beranda)
  useEffect(() => {
    if (tabParam && ['mupel', 'jemaat', 'bajem', 'pos'].includes(tabParam)) {
      setViewMode('filtered');
    }
  }, [tabParam]);

  return (
    <div className="w-full min-h-screen bg-surface-base pb-28 pt-1 sm:pt-3">
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header & Interactive StatCard Filter Widget */}
        <OrgDirectoryHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          stats={stats}
          isLoading={isLoading}
          onRefresh={refetch}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          totalFilteredCount={items.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Error State */}
        {isError && (
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400 mx-auto" />
            <div>
              <h3 className="text-sm font-extrabold text-red-900 dark:text-red-300">
                Gagal Memuat Data Direktori Organisasi
              </h3>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Terjadi kesalahan saat memuat data dari server. Silakan periksa koneksi jaringan Anda.
              </p>
            </div>
            <button
              type="button"
              onClick={refetch}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-xs"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !isError && (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-surface-elevated border border-border-subtle p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-sunken" />
                  <div className="space-y-1.5">
                    <div className="h-4 bg-surface-sunken rounded w-48" />
                    <div className="h-3 bg-surface-sunken rounded w-32" />
                  </div>
                </div>
                <div className="h-4 bg-surface-sunken rounded w-16" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State (Khusus saat viewMode filtered kosong) */}
        {!isLoading && !isError && viewMode === 'filtered' && items.length === 0 && (
          <div className="p-8 sm:p-12 rounded-3xl bg-surface-elevated border border-border-subtle text-center space-y-3 my-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-sunken flex items-center justify-center mx-auto text-text-muted">
              {searchQuery ? <Search size={28} /> : <Building2 size={28} />}
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-black text-text-high">
                {searchQuery
                  ? `Tidak ada hasil untuk "${searchQuery}"`
                  : 'Tidak Ada Data Unit Terfilter'}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                {searchQuery
                  ? 'Coba gunakan kata kunci pencarian lain atau ubah filter level hierarki.'
                  : 'Belum ada data pada filter level hierarki yang dipilih.'}
              </p>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-xl transition-all"
              >
                Bersihkan Pencarian
              </button>
            )}
          </div>
        )}

        {/* Dynamic Display: Tree vs Filtered */}
        {!isLoading && !isError && (
          viewMode === 'tree' ? (
            /* Hierarchy Dropdown Tree View (Default) */
            <div className="space-y-4">
              <HierarchyTree mupelList={mupelList} searchQuery={searchQuery} />
            </div>
          ) : (
            /* Filtered Flat Semantic Row List */
            items.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1 text-xs text-ink-secondary">
                  <span>
                    Menampilkan <strong className="text-ink-primary">{items.length}</strong> unit{' '}
                    {activeTab !== 'all' ? `(${activeTab.toUpperCase()})` : ''} terfilter
                  </span>
                  {activeTab !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Lihat Semua
                    </button>
                  )}
                </div>

                <div className="bg-surface-1 border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden divide-y divide-stone-200/70 dark:divide-stone-800/80 shadow-xs">
                  {items.map((item, idx) => (
                    <OrgCard key={`${item.type}-${item.id}`} item={item} isLast={idx === items.length - 1} />
                  ))}
                </div>
              </div>
            )
          )
        )}
      </main>
    </div>
  );
}
