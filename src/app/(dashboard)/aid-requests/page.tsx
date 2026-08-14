'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Filter,
  Search,
  Loader2,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BantuanCard } from '@/components/bantuan/BantuanCard';
import { SkeletonList } from '@/components/mobile/SkeletonList';
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

  const { data, isLoading, isFetching, isError, error } = useBantuanList(filters);

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/bantuan?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    // Debounce via URL param
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.replace(`/bantuan?${params.toString()}`);
  };

  const hasActiveFilters = statusFilter || urgensiFilter || search;

  return (
    <div className="min-h-screen bg-surface-base pb-24">
      {/* Header */}
      <header className="bg-surface-elevated border-b border-border-subtle sticky top-0 z-20 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-semibold text-text-high">
              Aid Review Queue
            </h1>
            <p className="text-xs text-text-muted">
              {data?.pagination.total ?? 0} pengajuan
              {isFetching && !isLoading && (
                <Loader2 className="w-3 h-3 inline-block ml-1 animate-spin" />
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 text-text-muted hover:text-text-high"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filter"
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            type="search"
            placeholder="Cari jenis bantuan atau deskripsi..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 min-h-[44px] text-base bg-surface-1 border-border-subtle text-text-high"
          />
        </div>

        {/* Filter Panel (Collapsible) */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-border-subtle grid grid-cols-2 gap-2">
            <Select
              value={statusFilter ?? 'all'}
              onValueChange={(v) =>
                updateFilter('status', (v as string) === 'all' ? undefined : (v as string))
              }
            >
              <SelectTrigger className="min-h-[40px] text-sm bg-surface-1 border-border-subtle text-text-high">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-surface-elevated border-border-subtle">
                <SelectItem value="all">Semua Status</SelectItem>
                {STATUS_BANTUAN.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={urgensiFilter ?? 'all'}
              onValueChange={(v) =>
                updateFilter('urgensi', (v as string) === 'all' ? undefined : (v as string))
              }
            >
              <SelectTrigger className="min-h-[40px] text-sm bg-surface-1 border-border-subtle text-text-high">
                <SelectValue placeholder="Urgensi" />
              </SelectTrigger>
              <SelectContent className="bg-surface-elevated border-border-subtle">
                <SelectItem value="all">Semua Urgensi</SelectItem>
                {URGENSI_LEVEL.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="col-span-2 text-xs text-text-muted hover:text-text-high"
                onClick={() => router.push('/bantuan')}
              >
                Reset semua filter
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="p-4 space-y-3">
        {isLoading && <SkeletonList count={5} />}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-sm text-red-800">
              Gagal memuat data: {(error as Error).message}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => router.refresh()}
            >
              Coba lagi
            </Button>
          </div>
        )}

        {!isLoading && !isError && data?.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">
              {hasActiveFilters
                ? 'Tidak ada hasil untuk filter ini'
                : 'Belum ada pengajuan bantuan'}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mb-4">
              {hasActiveFilters
                ? 'Coba ubah atau reset filter untuk melihat antrean lain.'
                : 'Tidak ada pengajuan bantuan yang perlu direview saat ini.'}
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          data?.data.map((bantuan) => (
            <BantuanCard key={bantuan.id_ajuan} bantuan={bantuan} />
          ))}

        {/* Load More / Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="pt-4 flex justify-center">
            <p className="text-xs text-gray-500">
              Halaman {data.pagination.page} dari {data.pagination.totalPages}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
