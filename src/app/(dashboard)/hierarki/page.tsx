'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMupelList, MupelItem } from '@/hooks/use-hierarki';
import { HierarchyStats } from '@/components/hierarki/HierarchyStats';
import { MupelCard } from '@/components/hierarki/MupelCard';
import { BreadcrumbNav } from '@/components/hierarki/BreadcrumbNav';
import { MupelFormModal } from '@/components/hierarki/MupelFormModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers, Search, LayoutList, GitFork, AlertCircle, Plus } from 'lucide-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMupel, setEditMupel] = useState<MupelItem | null>(null);

  const { data: mupelList, isLoading, isError } = useMupelList(searchQuery);

  const handleOpenAddModal = () => {
    setEditMupel(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mupel: MupelItem) => {
    setEditMupel(mupel);
    setIsModalOpen(true);
  };

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

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-brand-primary text-white font-bold text-xs flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <Plus size={16} />
            <span>Tambah Mupel</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-surface-sunken rounded-xl border border-border-subtle">
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
        <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle text-text-muted space-y-2">
          <Layers className="w-8 h-8 mx-auto text-text-muted opacity-50" />
          <p className="text-sm font-semibold">Tidak ada Mupel yang ditemukan.</p>
        </div>
      ) : viewMode === 'tree' ? (
        <HierarchyTree mupelList={mupelList} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mupelList.map((mupel) => (
            <MupelCard key={mupel.id_mupel} mupel={mupel} onEdit={handleOpenEditModal} />
          ))}
        </div>
      )}

      {/* Mupel Form Modal */}
      <MupelFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editData={editMupel}
      />
    </div>
  );
}
