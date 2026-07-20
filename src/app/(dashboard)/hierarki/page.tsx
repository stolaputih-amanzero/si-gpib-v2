'use client';

import { useState } from 'react';
import { useMupelList } from '@/hooks/use-hierarki';
import { HierarchyStats } from '@/components/hierarki/HierarchyStats';
import { MupelCard } from '@/components/hierarki/MupelCard';
import { HierarchyTree } from '@/components/hierarki/HierarchyTree';
import { BreadcrumbNav } from '@/components/hierarki/BreadcrumbNav';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers, Search, LayoutList, GitFork, AlertCircle } from 'lucide-react';

type ViewMode = 'list' | 'tree';

export default function HierarkiEntryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: mupelList, isLoading, isError } = useMupelList(searchQuery);

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Nav */}
      <BreadcrumbNav items={[]} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-text-high tracking-tight">
              Hierarki Organisasi GPIB
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted">
            Struktur Terintegrasi Mupel (25) → Jemaat Induk (350+) → Pos Pelkes (500+)
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-surface-sunken rounded-xl border border-border-subtle self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'list'
                ? 'bg-surface-elevated text-brand-primary shadow-sm'
                : 'text-text-muted hover:text-text-high'
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
                ? 'bg-surface-elevated text-brand-primary shadow-sm'
                : 'text-text-muted hover:text-text-high'
            }`}
          >
            <GitFork size={16} />
            <span>Tree View</span>
          </button>
        </div>
      </div>

      {/* Global Hierarchy Stats */}
      <HierarchyStats />

      {/* Search Input Bar */}
      <div className="relative bg-surface-elevated p-3 rounded-2xl border border-border-subtle shadow-soft">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Cari Mupel (contoh: M - 02 BABEL)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-border-subtle bg-surface-base text-xs sm:text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle text-red-600 space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p className="text-sm font-semibold">Gagal memuat data Mupel.</p>
          <p className="text-xs text-text-muted">Pastikan koneksi internet terhubung dan coba muat ulang.</p>
        </div>
      ) : !mupelList || mupelList.length === 0 ? (
        <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle text-text-muted">
          <p className="text-sm font-semibold">Tidak ada data Mupel yang sesuai pencarian.</p>
        </div>
      ) : viewMode === 'tree' ? (
        <HierarchyTree mupelList={mupelList} searchQuery={searchQuery} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mupelList.map((mupel) => (
            <MupelCard key={mupel.id_mupel} mupel={mupel} />
          ))}
        </div>
      )}
    </div>
  );
}
