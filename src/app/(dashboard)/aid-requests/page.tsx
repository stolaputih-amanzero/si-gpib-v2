'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Filter,
  Search,
  HeartHandshake
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BantuanCard } from '@/components/bantuan/BantuanCard';
import { SkeletonList } from '@/components/mobile/SkeletonList';
import { StatusPill } from '@/components/ui/StatusPill';
import { useBantuanList } from '@/lib/domains/bantuan/bantuan.queries';
import {
  STATUS_BANTUAN,
  URGENSI_LEVEL,
  type StatusBantuan,
  type UrgensiLevel,
} from '@/lib/domains/bantuan/bantuan.types';

const STATUS_LABELS: Record<StatusBantuan, string> = {
  Draft: 'Draft',
  Pending_KMJ: 'Menunggu KMJ',
  Pending_Mupel: 'Menunggu Mupel',
  Pending_Sinode: 'Menunggu Sinode',
  Approved: 'Disetujui',
  Rejected: 'Ditolak',
};

export default function AidReviewQueueProjection() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  const statusFilter = (searchParams.get('status') as StatusBantuan) ?? undefined;
  const urgensiFilter = (searchParams.get('urgensi') as UrgensiLevel) ?? undefined;

  const filters = useMemo(
    () => ({
      status: statusFilter,
      urgensi: urgensiFilter,
      search: search || undefined,
    }),
    [statusFilter, urgensiFilter, search]
  );

  const { data, isLoading, isError, error } = useBantuanList(filters);

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/aid-requests?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.replace(`/aid-requests?${params.toString()}`);
  };

  const hasActiveFilters = statusFilter || urgensiFilter || search;

  return (
    <div className="w-full min-h-screen bg-surface-base pb-28 pt-1 sm:pt-3">
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Open Canvas Hero */}
        <section className="pt-2 sm:pt-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <StatusPill variant="gold" dot={true}>
                Sinode GPIB
              </StatusPill>
              <StatusPill variant="blue" dot={false}>
                Antrean &amp; Verifikasi
              </StatusPill>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-ink-primary bg-surface-1 border border-stone-200/80 dark:border-stone-800 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                aria-label="Toggle filter antrean bantuan"
              >
                <Filter className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-ink-primary tracking-tight leading-[1.15]">
              Antrean <span className="font-editorial-italic font-normal text-amber-700 dark:text-amber-400">Permohonan Bantuan.</span>
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
              Pusat tinjauan &amp; persetujuan usulan dana/bantuan operasional pos pelkes ({data?.pagination.total ?? 0} pengajuan terdaftar).
            </p>
          </div>
        </section>

        {/* Search & Filter Section */}
        <section className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-tertiary pointer-events-none" />
            <input
              type="search"
              placeholder="Cari jenis bantuan, pos pelkes, atau deskripsi..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-surface-1 border border-stone-200/80 dark:border-stone-800 text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-xs transition-all"
            />
          </div>

          {/* Filter Panel (Collapsible) */}
          {showFilters && (
            <div className="p-4 rounded-2xl bg-surface-1 border border-stone-200/80 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="micro-label text-ink-tertiary block mb-1">Status Persetujuan</label>
                <Select
                  value={statusFilter ?? 'all'}
                  onValueChange={(v) =>
                    updateFilter('status', (v as string) === 'all' ? undefined : (v as string))
                  }
                >
                  <SelectTrigger className="min-h-[40px] text-xs rounded-xl bg-surface-base border-stone-200/80 dark:border-stone-700">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-1 border-stone-200/80 dark:border-stone-700">
                    <SelectItem value="all">Semua Status</SelectItem>
                    {STATUS_BANTUAN.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="micro-label text-ink-tertiary block mb-1">Tingkat Urgensi</label>
                <Select
                  value={urgensiFilter ?? 'all'}
                  onValueChange={(v) =>
                    updateFilter('urgensi', (v as string) === 'all' ? undefined : (v as string))
                  }
                >
                  <SelectTrigger className="min-h-[40px] text-xs rounded-xl bg-surface-base border-stone-200/80 dark:border-stone-700">
                    <SelectValue placeholder="Semua Urgensi" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-1 border-stone-200/80 dark:border-stone-700">
                    <SelectItem value="all">Semua Urgensi</SelectItem>
                    {URGENSI_LEVEL.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="sm:col-span-2 pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.push('/aid-requests')}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Reset Semua Filter
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Content List */}
        <section className="space-y-3">
          {isLoading && <SkeletonList count={4} />}

          {isError && (
            <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-center space-y-2">
              <p className="text-sm font-bold text-red-800 dark:text-red-300">
                Gagal memuat data: {(error as Error).message}
              </p>
              <button
                type="button"
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-xl"
                onClick={() => router.refresh()}
              >
                Coba lagi
              </button>
            </div>
          )}

          {!isLoading && !isError && data?.data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
                <HeartHandshake className="size-7" />
              </div>
              <h3 className="text-base font-bold text-ink-primary mb-1">
                {hasActiveFilters
                  ? 'Tidak ada hasil untuk filter ini'
                  : 'Belum ada pengajuan bantuan'}
              </h3>
              <p className="text-xs text-ink-secondary max-w-xs">
                {hasActiveFilters
                  ? 'Coba ubah kata kunci pencarian atau reset filter status.'
                  : 'Tidak ada permohonan bantuan yang sedang menunggu review saat ini.'}
              </p>
            </div>
          )}

          {!isLoading &&
            !isError &&
            data?.data.map((bantuan) => (
              <BantuanCard key={bantuan.id_ajuan} bantuan={bantuan} />
            ))}

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="pt-4 flex justify-center">
              <p className="text-xs text-ink-tertiary">
                Halaman {data.pagination.page} dari {data.pagination.totalPages}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
