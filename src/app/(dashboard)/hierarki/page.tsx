'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMupelList } from '@/hooks/use-hierarki';
import { HierarchyStats } from '@/components/hierarki/HierarchyStats';
import { SearchBar } from '@/components/ui/search-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers, LayoutList, GitFork, Church } from 'lucide-react';
import { ListRow } from '@/components/list/ListRow';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';

const HierarchyTree = dynamic(
  () => import('@/components/hierarki/HierarchyTree').then((mod) => mod.HierarchyTree),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 rounded-2xl w-full" />,
  }
);

type ViewMode = 'list' | 'tree';

export default function HierarkiEntryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: mupelList, isLoading, isError } = useMupelList(searchQuery);

  const totalMupel = mupelList?.length || 0;
  const totalJemaat = mupelList?.reduce((acc, m) => acc + (m.jemaat_count || 0), 0) || 0;
  const totalPos = mupelList?.reduce((acc, m) => acc + (m.pos_count || 0), 0) || 0;

  return (
    <div className="space-y-4 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-1 p-5 rounded-2xl border border-border-subtle shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-surface-brand text-brand-600">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight">
              Hierarki Organisasi GPIB
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-ink-tertiary">
            Struktur Terintegrasi Mupel, Jemaat dan Pos Pelkes GPIB
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-surface-sunken rounded-xl border border-border-subtle shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'list'
                ? 'bg-surface-1 text-brand-600 shadow-xs'
                : 'text-ink-tertiary hover:text-ink-primary'
            }`}
          >
            <LayoutList size={16} />
            <span>List View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('tree')}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'tree'
                ? 'bg-surface-1 text-brand-600 shadow-xs'
                : 'text-ink-tertiary hover:text-ink-primary'
            }`}
          >
            <GitFork size={16} />
            <span>Tree View</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Strip */}
      <SummaryStrip
        metrics={[
          { label: 'Total Mupel', value: totalMupel, icon: <Layers size={16} className="text-purple-600 dark:text-purple-400" /> },
          { label: 'Total Jemaat Induk', value: totalJemaat, icon: <Church size={16} className="text-indigo-600 dark:text-indigo-400" /> },
          { label: 'Total Pos Pelkes', value: totalPos, icon: <Church size={16} className="text-blue-600 dark:text-blue-400" /> },
        ]}
        className="hairline-b bg-surface-1/40 rounded-xl py-2 px-3"
      />

      {/* Global Hierarchy Stats Widget */}
      <HierarchyStats />

      {/* Search Input Bar */}
      <div className="bg-surface-1 p-3 rounded-2xl border border-border-subtle shadow-xs">
        <SearchBar
          placeholder="Cari mupel, ID, jemaat induk, atau pos pelkes secara global..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <ListSkeleton count={6} />
      ) : isError ? (
        <EmptyState
          icon={Layers}
          title="Gagal Memuat Data Mupel"
          description="Pastikan koneksi internet terhubung dan coba muat ulang."
        />
      ) : !mupelList || mupelList.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Tidak Ada Mupel Ditemukan"
          description="Tidak ada Musyawarah Pelayanan (Mupel) yang cocok dengan pencarian Anda."
        />
      ) : viewMode === 'tree' ? (
        <HierarchyTree mupelList={mupelList} />
      ) : (
        <div data-testid="mupel-list" className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden">
          {mupelList.map((mupel) => (
            <ListRow
              key={mupel.id_mupel}
              icon={<Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
              iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
              title={mupel.nama_mupel}
              subtitle={mupel.keterangan || `Kode Mupel: ${mupel.id_mupel}`}
              meta={
                <span>
                  {mupel.jemaat_count ?? 0} Jemaat · {mupel.bajem_count ?? 0} Bajem · {mupel.pos_count ?? 0} Pos Pelkes
                </span>
              }
              href={`/hierarki/${encodeURIComponent(mupel.id_mupel)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
