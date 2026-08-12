'use client';

import { OrgDirectoryHeader } from '@/components/org/OrgDirectoryHeader';
import { OrgDirectoryTabs } from '@/components/org/OrgDirectoryTabs';
import { OrgCard } from '@/components/org/OrgCard';
import { useOrgDirectory } from '@/hooks/use-org-directory';
import { Building2, AlertTriangle, Search } from 'lucide-react';

export default function OrgDirectoryPage() {
  const {
    items,
    stats,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isLoading,
    isError,
    refetch,
  } = useOrgDirectory();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto min-h-screen">
      {/* Header & Stats Widget */}
      <OrgDirectoryHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        stats={stats}
        isLoading={isLoading}
        onRefresh={refetch}
      />

      {/* Hierarchy Level Tabs */}
      <OrgDirectoryTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalCount={items.length}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-surface-elevated border border-border-subtle p-4 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-sunken" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-surface-sunken rounded w-3/4" />
                  <div className="h-3 bg-surface-sunken rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-surface-sunken rounded w-full" />
                <div className="h-3 bg-surface-sunken rounded w-2/3" />
              </div>
              <div className="h-4 bg-surface-sunken rounded w-1/4 self-end" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="p-8 sm:p-12 rounded-3xl bg-surface-elevated border border-border-subtle text-center space-y-3 my-6">
          <div className="w-14 h-14 rounded-2xl bg-surface-sunken flex items-center justify-center mx-auto text-text-muted">
            {searchQuery ? <Search size={28} /> : <Building2 size={28} />}
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-black text-text-high">
              {searchQuery
                ? `Tidak ada hasil untuk "${searchQuery}"`
                : 'Tidak Ada Data Organisasi'}
            </h3>
            <p className="text-xs text-text-muted mt-1">
              {searchQuery
                ? 'Coba gunakan kata kunci pencarian lain atau ubah filter level hierarki.'
                : 'Belum ada data organisasi yang tersedia pada ruang lingkup otorisasi Anda.'}
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

      {/* Directory Semantic Row List */}
      {!isLoading && !isError && items.length > 0 && (
        <div className="bg-surface-1 border border-border-subtle rounded-card overflow-hidden divide-y divide-border-subtle shadow-2xs">
          {items.map((item, idx) => (
            <OrgCard key={`${item.type}-${item.id}`} item={item} isLast={idx === items.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}
