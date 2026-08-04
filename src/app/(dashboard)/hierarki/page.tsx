'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMupelList } from '@/hooks/use-hierarki';
import { useUserRoleScope } from '@/hooks/use-analitik';
import { ScopeIndicator } from '@/components/analitik/ScopeIndicator';
import { SearchBar } from '@/components/ui/search-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers, LayoutList, GitFork, Church, Sprout } from 'lucide-react';
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

  const { scope } = useUserRoleScope();
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
            <ScopeIndicator scope={scope} />
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

      {/* Horizontal Summary Metrics Strip */}
      <SummaryStrip
        metrics={[
          { label: 'Total Mupel', value: totalMupel, icon: <Layers size={16} className="text-purple-600 dark:text-purple-400" /> },
          { label: 'Total Jemaat Induk', value: totalJemaat, icon: <Church size={16} className="text-indigo-600 dark:text-indigo-400" /> },
          { label: 'Total Pos Pelkes', value: totalPos, icon: <Sprout size={16} className="text-blue-600 dark:text-blue-400" /> },
        ]}
        className="hairline-b bg-surface-1/40 rounded-xl py-2 px-3"
      />

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
        <div data-testid="mupel-list" className="space-y-3">
          <div className="bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-xs divide-y divide-line-hairline">
            {mupelList.map((mupel) => (
              <div key={mupel.id_mupel} className="divide-y divide-line-hairline">
                {/* 1. Mupel Row */}
                <ListRow
                  icon={<Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                  iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  title={mupel.nama_mupel}
                  subtitle={mupel.keterangan || mupel.id_mupel}
                  badge={
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300">
                      Mupel Induk
                    </span>
                  }
                  meta={
                    <span className="flex items-center gap-2 flex-wrap text-xs font-bold">
                      <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400" title="Jemaat Induk">
                        <Church size={13} />
                        <span>{mupel.jemaat_count ?? 0} Jemaat</span>
                      </span>
                      <span className="text-text-muted/40">•</span>
                      <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400" title="Pos Pelkes">
                        <Sprout size={13} />
                        <span>{mupel.pos_count ?? 0} Pos</span>
                      </span>
                    </span>
                  }
                  href={`/mupel/${encodeURIComponent(mupel.id_mupel)}`}
                />

                {/* 2. Direct Sub-items for Scoped Users (Jemaat Induk & Pos Pelkes) */}
                {scope && scope.isLocked && (
                  <>
                    {scope.id_induk && (
                      <ListRow
                        icon={<Church className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
                        iconClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        title="Jemaat Induk PAMA JUBATA"
                        subtitle={`ID: ${scope.id_induk} • Jemaat Induk Mandiri`}
                        badge={
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300">
                            Jemaat Induk Anda
                          </span>
                        }
                        href={`/jemaat/${encodeURIComponent(scope.id_induk)}`}
                      />
                    )}

                    {scope.id_pos && (
                      <ListRow
                        icon={<Sprout className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                        iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        title="Pos Pelkes PT. GAN"
                        subtitle={`ID: ${scope.id_pos} • Pos Pelkes Penugasan Active`}
                        badge={
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                            Pos Pelkes Penugasan Anda
                          </span>
                        }
                        href={`/dashboard/pos-pelkes/${encodeURIComponent(scope.id_pos)}`}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
