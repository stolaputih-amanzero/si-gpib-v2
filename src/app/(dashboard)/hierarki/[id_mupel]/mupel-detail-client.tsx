'use client';

import { useState, useEffect } from 'react';
import { useMupelDetail, useJemaatByMupel, JemaatIndukItem } from '@/hooks/use-hierarki';
import { BreadcrumbNav } from '@/components/hierarki/BreadcrumbNav';
import { JemaatFormModal } from '@/components/hierarki/JemaatFormModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers, Church, Search, Plus, Sprout } from 'lucide-react';
import { ListRow } from '@/components/list/ListRow';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';

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
        <ListSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
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
        <div className="bg-surface-1 p-5 rounded-2xl border border-border-subtle shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-sunken border border-border-subtle text-ink-tertiary w-max">
                  {id_mupel}
                </span>
                <h1 className="font-display text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight leading-tight mt-0.5 truncate">
                  {mupel?.nama_mupel || id_mupel}
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-3.5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 min-h-[44px]"
              title="Tambah Jemaat Baru"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Tambah Jemaat</span>
            </button>
          </div>

          {mupel?.keterangan && (
            <p className="text-xs sm:text-sm text-ink-secondary bg-surface-sunken p-3 rounded-xl border border-border-subtle">
              {mupel.keterangan}
            </p>
          )}
        </div>
      )}

      {/* Summary Metrics Strip */}
      <SummaryStrip
        metrics={[
          { label: 'Jemaat Induk', value: jemaatList?.length || 0, icon: <Church size={16} className="text-indigo-600 dark:text-indigo-400" /> },
          { label: 'Bajem', value: totalBajemCount, icon: <Sprout size={16} className="text-emerald-600 dark:text-emerald-400" /> },
          { label: 'Pos Pelkes', value: totalPosPelkesCount, icon: <Church size={16} className="text-blue-600 dark:text-blue-400" /> },
        ]}
        className="hairline-b bg-surface-1/40 rounded-xl py-2 px-3"
      />

      {/* Search Input Bar */}
      <div className="relative bg-surface-1 p-3 rounded-2xl border border-border-subtle shadow-xs">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-ink-tertiary" />
        <input
          type="text"
          placeholder="Cari Jemaat Induk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      {/* Main Jemaat List */}
      {isLoadingJemaat ? (
        <ListSkeleton count={6} />
      ) : isError ? (
        <EmptyState
          icon={Church}
          title="Gagal Memuat Data Jemaat"
          description="Terjadi kesalahan saat mengambil daftar Jemaat Induk."
        />
      ) : !jemaatList || jemaatList.length === 0 ? (
        <EmptyState
          icon={Church}
          title="Tidak Ada Jemaat Induk"
          description="Belum ada Jemaat Induk yang terdaftar di bawah Mupel ini."
          action={{
            label: 'Tambah Jemaat Baru',
            onClick: handleOpenAddModal,
            variant: 'primary',
          }}
        />
      ) : (
        <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden">
          {jemaatList.map((jemaat) => (
            <ListRow
              key={jemaat.id_induk}
              icon={<Church className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
              iconClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              title={jemaat.nama_induk}
              subtitle={
                <span>
                  ID: {jemaat.id_induk} · Alamat: {jemaat.alamat || '—'}
                </span>
              }
              meta={
                <span>
                  {jemaat.pos_count || 0} Pos Pelkes · {jemaat.bajem_count || 0} Bajem
                </span>
              }
              href={`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(jemaat.id_induk)}`}
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
