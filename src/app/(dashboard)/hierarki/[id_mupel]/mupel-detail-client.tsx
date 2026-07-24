'use client';

import { useState, useEffect } from 'react';
import { useMupelDetail, useJemaatByMupel, JemaatIndukItem } from '@/hooks/use-hierarki';
import { BreadcrumbNav } from '@/components/hierarki/BreadcrumbNav';
import { JemaatCard } from '@/components/hierarki/JemaatCard';
import { JemaatFormModal } from '@/components/hierarki/JemaatFormModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers, Church, Search, AlertCircle, Plus } from 'lucide-react';

interface MupelDetailClientProps {
  id_mupel: string;
}

export function MupelDetailClient({ id_mupel }: MupelDetailClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editJemaat, setEditJemaat] = useState<JemaatIndukItem | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: mupel, isLoading: isLoadingMupel } = useMupelDetail(id_mupel);
  const { data: jemaatList, isLoading: isLoadingJemaat, isError } = useJemaatByMupel(id_mupel, searchQuery);

  const totalBajemCount = (jemaatList || []).reduce((acc, curr) => acc + (curr.bajem_count || 0), 0);
  const totalPosPelkesCount = (jemaatList || []).reduce((acc, curr) => acc + (curr.pos_count || 0), 0);

  const handleOpenAddModal = () => {
    setEditJemaat(null);
    setIsModalOpen(true);
  };

  if (!mounted) {
    return (
      <div className="space-y-6 pb-12">
        <BreadcrumbNav items={[{ label: id_mupel, isCurrent: true }]} />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Nav */}
      <BreadcrumbNav
        items={[
          { label: mupel?.nama_mupel || id_mupel, isCurrent: true },
        ]}
      />

      {/* Header Banner Mupel */}
      {isLoadingMupel ? (
        <Skeleton className="h-28 w-full rounded-2xl" />
      ) : (
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft space-y-3">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-brand-primary/10 text-brand-primary shrink-0 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-sunken border border-border-subtle text-text-muted">
                  {id_mupel}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-text-high tracking-tight leading-tight mt-0.5">
                {mupel?.nama_mupel || id_mupel}
              </h1>
            </div>
          </div>

          {/* Quick Stat Summary (3 Rows Full Width + Add Button on Far Right) */}
          <div className="w-full bg-surface-sunken p-3 rounded-2xl border border-border-subtle flex items-center justify-between gap-3">
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center justify-between px-2 py-0.5 text-xs sm:text-sm">
                <span className="font-bold text-text-muted">Jemaat Induk</span>
                <span className="font-black text-indigo-700 dark:text-indigo-300 text-sm sm:text-base tabular-nums">
                  {jemaatList?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-0.5 text-xs sm:text-sm border-t border-border-subtle/60 pt-1.5">
                <span className="font-bold text-text-muted">Bajem</span>
                <span className="font-black text-purple-700 dark:text-purple-300 text-sm sm:text-base tabular-nums">
                  {totalBajemCount}
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-0.5 text-xs sm:text-sm border-t border-border-subtle/60 pt-1.5">
                <span className="font-bold text-text-muted">Pos Pelkes</span>
                <span className="font-black text-emerald-700 dark:text-emerald-300 text-sm sm:text-base tabular-nums">
                  {totalPosPelkesCount}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all shadow-xs"
              title="Tambah Jemaat Induk Baru"
              aria-label="Tambah Jemaat Induk Baru"
            >
              <Plus size={18} className="stroke-[2.5px]" />
            </button>
          </div>

          {mupel?.keterangan && (
            <p className="text-xs sm:text-sm text-text-muted bg-surface-sunken p-3 rounded-xl border border-border-subtle">
              {mupel.keterangan}
            </p>
          )}
        </div>
      )}

      {/* Search Input Bar */}
      <div className="relative bg-surface-elevated p-3 rounded-2xl border border-border-subtle shadow-soft">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Cari Jemaat Induk atau nama KMJ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-border-subtle bg-surface-base text-xs sm:text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {/* Main Jemaat List */}
      {isLoadingJemaat ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle text-red-600 space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p className="text-sm font-semibold">Gagal memuat data Jemaat Induk.</p>
        </div>
      ) : !jemaatList || jemaatList.length === 0 ? (
        <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle text-text-muted space-y-2">
          <Church className="w-8 h-8 mx-auto text-text-muted opacity-50" />
          <p className="text-sm font-semibold">Tidak ada Jemaat Induk di bawah Mupel ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jemaatList.map((jemaat) => (
            <JemaatCard
              key={jemaat.id_induk}
              jemaat={jemaat}
              id_mupel={id_mupel}
            />
          ))}
        </div>
      )}

      {/* Jemaat Form Modal */}
      <JemaatFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        id_mupel={id_mupel}
        editData={editJemaat}
      />
    </div>
  );
}
