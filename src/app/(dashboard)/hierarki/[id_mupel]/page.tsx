'use client';

import { use, useState } from 'react';
import { useMupelDetail, useJemaatByMupel } from '@/hooks/use-hierarki';
import { BreadcrumbNav } from '@/components/hierarki/BreadcrumbNav';
import { JemaatCard } from '@/components/hierarki/JemaatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers, Church, Search, AlertCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{ id_mupel: string }>;
}

export default function MupelDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id_mupel = decodeURIComponent(resolvedParams.id_mupel);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: mupel, isLoading: isLoadingMupel } = useMupelDetail(id_mupel);
  const { data: jemaatList, isLoading: isLoadingJemaat, isError } = useJemaatByMupel(id_mupel, searchQuery);

  const totalPosCount = (jemaatList || []).reduce((acc, curr) => acc + (curr.pos_count || 0), 0);

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-sunken border border-border-subtle text-text-muted">
                  {id_mupel}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-text-high tracking-tight mt-0.5">
                  {mupel?.nama_mupel || id_mupel}
                </h1>
              </div>
            </div>

            {/* Quick Stat Badges */}
            <div className="flex items-center gap-2">
              <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl px-3 py-1.5 text-center">
                <span className="block text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">Jemaat Induk</span>
                <span className="text-sm font-black text-indigo-950 dark:text-indigo-200 tabular-nums">
                  {jemaatList?.length || 0}
                </span>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-1.5 text-center">
                <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Total Pos Pelkes</span>
                <span className="text-sm font-black text-emerald-950 dark:text-emerald-200 tabular-nums">
                  {totalPosCount}
                </span>
              </div>
            </div>
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

      {/* List Jemaat Induk */}
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
          <p className="text-sm font-semibold">Gagal memuat daftar Jemaat Induk.</p>
        </div>
      ) : !jemaatList || jemaatList.length === 0 ? (
        <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle text-text-muted space-y-2">
          <Church className="w-8 h-8 mx-auto opacity-50 text-indigo-500" />
          <p className="text-sm font-semibold">Tidak ada Jemaat Induk ditemukan di Mupel ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jemaatList.map((jemaat) => (
            <JemaatCard key={jemaat.id_induk} jemaat={jemaat} id_mupel={id_mupel} />
          ))}
        </div>
      )}
    </div>
  );
}
