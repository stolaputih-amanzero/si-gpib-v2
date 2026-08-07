'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus, TrendingUp, Church, Sprout, Layers, SearchX, Map, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cleanQuotes, cn } from '@/lib/utils';
import { StatusElevationModal } from '@/components/hierarki/StatusElevationModal';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { haptic } from '@/lib/haptic/vibrate';
import { normalizePosName } from '@/lib/utils/normalize-pos-name';
import { PosName } from '@/components/ui/PosName';
import { useCurrentUser, isSuperUserRole } from '@/hooks/use-current-user';
import { detectPosType } from '@/lib/utils/pos-type';
import { usePosPelkes, PosPelkesItem } from '@/hooks/use-pos-pelkes';
import { ListRow } from '@/components/list/ListRow';
import { FilterChips, FilterChip } from '@/components/list/FilterChips';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function PosPelkesList({
  initialData,
  initialFilter = 'all',
}: {
  initialData: PosPelkesItem[];
  initialFilter?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: currentUser } = useCurrentUser();
  const canElevate = isSuperUserRole(currentUser?.role);

  // TanStack Query Data Hook (5 min stale time, enabled auth guard)
  const {
    data: dataList = initialData || [],
    isPending,
    isFetching,
    isError,
    refetch,
  } = usePosPelkes({ initialData });

  const urlFilterParam = searchParams.get('filter') || searchParams.get('kategori') || initialFilter || '';
  const initialCategoryFilter = useMemo(() => {
    const norm = (urlFilterParam || initialFilter || '').toLowerCase();
    if (norm === 'bajem') return 'bajem';
    if (norm === 'pos_pelkes' || norm === 'pos') return 'pos_pelkes';
    return 'all';
  }, [urlFilterParam, initialFilter]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(initialCategoryFilter);
  const [selectedJemaat, setSelectedJemaat] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Synchronize state dynamically whenever URL searchParams change
  useEffect(() => {
    const norm = (urlFilterParam || '').toLowerCase();
    if (norm === 'bajem') {
      setSelectedCategoryFilter('bajem');
      setSelectedJemaat('');
      setCurrentPage(1);
    } else if (norm === 'pos_pelkes' || norm === 'pos') {
      setSelectedCategoryFilter('pos_pelkes');
      setSelectedJemaat('');
      setCurrentPage(1);
    } else if (norm === 'all') {
      setSelectedCategoryFilter('all');
      setSelectedJemaat('');
      setCurrentPage(1);
    }
  }, [urlFilterParam]);
  const [elevatePosItem, setElevatePosItem] = useState<{
    id_pos: string;
    nama_pos: string;
    kategori?: string | null;
    id_induk: string;
  } | null>(null);

  const itemsPerPage = 10;

  const handleRefresh = async () => {
    haptic.light();
    await refetch();
  };

  // Jemaat Options for Filtering (client-side computed in memory)
  const jemaatOptions = useMemo(() => {
    const jemaats: Record<string, string> = {};
    dataList.forEach((pos) => {
      const jemaatObj = pos.jemaat_induk;
      const j = Array.isArray(jemaatObj) ? jemaatObj[0] : jemaatObj;
      if (j?.id_induk && j?.nama_induk) {
        jemaats[j.id_induk] = cleanQuotes(j.nama_induk);
      }
    });
    return Object.entries(jemaats)
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [dataList]);

  // Main Filtered Data (client-side in-memory filter — fast, instant, zero flicker)
  const filteredData = useMemo(() => {
    const list = dataList.filter((pos) => {
      // 1. Filter Category (Semua vs Pos Pelkes vs Bajem)
      const posType = detectPosType(pos);
      if (selectedCategoryFilter === 'pos_pelkes' && posType !== 'pos_pelkes') {
        return false;
      }
      if (selectedCategoryFilter === 'bajem' && posType !== 'bajem') {
        return false;
      }

      // 2. Filter Jemaat Induk
      const jemaatObj = pos.jemaat_induk;
      const j = Array.isArray(jemaatObj) ? jemaatObj[0] : jemaatObj;
      if (selectedJemaat && j?.id_induk !== selectedJemaat) {
        return false;
      }

      // 3. Search Query Matching
      if (searchQuery) {
        const query = searchQuery.trim().toLowerCase();
        const rawName = pos.nama_pos || '';
        const normalizedName = normalizePosName(rawName).toLowerCase();
        const cleanedName = cleanQuotes(rawName).toLowerCase();
        const matchesName = normalizedName.includes(query) || cleanedName.includes(query);
        const matchesId = pos.id_pos ? pos.id_pos.toLowerCase().includes(query) : false;
        const matchesAddress = pos.alamat ? cleanQuotes(pos.alamat).toLowerCase().includes(query) : false;

        const mupelObj = j?.mupel;
        const m = Array.isArray(mupelObj) ? mupelObj[0] : mupelObj;
        const jemaatName = j?.nama_induk ? cleanQuotes(j.nama_induk).toLowerCase() : '';
        const mupelName = m?.nama_mupel ? cleanQuotes(m.nama_mupel).toLowerCase() : '';

        const matchesJemaat = jemaatName.includes(query);
        const matchesMupel = mupelName.includes(query);

        if (!matchesName && !matchesId && !matchesAddress && !matchesJemaat && !matchesMupel) {
          return false;
        }
      }

      return true;
    });

    // Sort by relevance if search query exists
    if (searchQuery) {
      const query = searchQuery.trim().toLowerCase();
      const getRelevanceScore = (posItem: PosPelkesItem) => {
        const name = posItem.nama_pos ? normalizePosName(posItem.nama_pos).toLowerCase() : '';
        let score = 0;
        if (name === query) score += 100;
        else if (name.startsWith(query)) score += 50;
        else if (name.includes(query)) score += 20;

        const id = posItem.id_pos ? posItem.id_pos.toLowerCase() : '';
        if (id === query) score += 40;
        else if (id.includes(query)) score += 10;
        return score;
      };
      return [...list].sort((a, b) => getRelevanceScore(b) - getRelevanceScore(a));
    }

    return list;
  }, [dataList, searchQuery, selectedCategoryFilter, selectedJemaat]);

  // Counts for Summary Strip & Chips
  const posPelkesCount = useMemo(() => {
    return dataList.filter((p) => detectPosType(p) === 'pos_pelkes').length;
  }, [dataList]);

  const bajemCount = useMemo(() => {
    return dataList.filter((p) => detectPosType(p) === 'bajem').length;
  }, [dataList]);

  const activeFilteredPosCount = filteredData.filter((p) => detectPosType(p) === 'pos_pelkes').length;
  const activeFilteredBajemCount = filteredData.filter((p) => detectPosType(p) === 'bajem').length;

  // Filter Chips Config
  // Filter Chips Config
  const filterChips: FilterChip[] = useMemo(() => {
    const chips: FilterChip[] = [
      { key: 'all', label: 'Semua', count: dataList.length },
      { key: 'pos_pelkes', label: 'Pos Pelkes', count: posPelkesCount },
      { key: 'bajem', label: 'Bajem', count: bajemCount },
    ];

    if (jemaatOptions.length > 1) {
      jemaatOptions.forEach((j) => {
        chips.push({
          key: `jemaat_${j.id}`,
          label: j.name,
        });
      });
    }

    return chips;
  }, [dataList.length, posPelkesCount, bajemCount, jemaatOptions]);

  const handleChipSelect = (key: string) => {
    setCurrentPage(1);
    if (key.startsWith('jemaat_')) {
      const jId = key.replace('jemaat_', '');
      setSelectedJemaat(jId);
    } else {
      setSelectedJemaat('');
      setSelectedCategoryFilter(key);
    }
  };

  const selectedChipId = selectedJemaat ? `jemaat_${selectedJemaat}` : selectedCategoryFilter;

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleOpenElevate = (e: React.MouseEvent, pos: PosPelkesItem) => {
    e.preventDefault();
    e.stopPropagation();
    haptic.medium();
    setElevatePosItem({
      id_pos: pos.id_pos,
      nama_pos: pos.nama_pos,
      kategori: pos.kategori,
      id_induk: pos.id_induk || '',
    });
  };

  const isFilterActive = Boolean(searchQuery || selectedCategoryFilter !== 'all' || selectedJemaat);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryFilter('all');
    setSelectedJemaat('');
    setCurrentPage(1);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-surface-base pb-36 relative">
        {/* Subtle Top Progress Bar during background refetch (WCAG 2.1 AA compliant) */}
        {isFetching && !isPending && (
          <div
            role="progressbar"
            aria-label="Memuat data"
            className="h-0.5 bg-brand-500 animate-pulse w-full sticky top-[57px] z-50"
          />
        )}

        {/* 1. Sticky Header */}
        <div className="sticky top-0 z-40 bg-surface-1/85 backdrop-blur-md hairline-b pt-safe px-4 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <h1 className="font-display text-2xl font-semibold text-ink-primary tracking-tight truncate">
                Pos Pelkes & Bajem
              </h1>
              <span className="bg-surface-brand text-brand-600 text-sm font-medium px-2.5 py-0.5 rounded-full tnum shrink-0 border border-brand-500/20">
                {filteredData.length} Pos
              </span>
            </div>

            <Link href="/dashboard/peta" onClick={() => haptic.light()}>
              <Button variant="ghost" size="sm" type="button" className="min-h-[44px] shrink-0 text-brand-600 hover:bg-surface-brand">
                <Map size={18} className="mr-1.5" />
                <span className="hidden sm:inline">Peta</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. Tonal Search Bar */}
        <div className="px-4 pt-3 pb-1">
          <div className="relative h-12 rounded-xl bg-surface-sunken flex items-center px-3.5 transition-all focus-within:ring-2 focus-within:ring-brand-400/20 focus-within:bg-surface-1 focus-within:border-brand-400 border border-transparent">
            <Search className="h-5 w-5 text-ink-tertiary mr-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Cari pos, bajem, ID, atau jemaat..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-base text-ink-primary placeholder:text-ink-tertiary focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-ink-tertiary hover:text-ink-primary px-2 py-1"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* 3. Horizontal Filter Chips (Height 44px) */}
        <FilterChips
          items={filterChips}
          active={selectedChipId}
          onChange={handleChipSelect}
        />

        {/* 4. Fraunces Summary Strip */}
        <SummaryStrip
          metrics={[
            { label: 'Pos Pelkes', value: activeFilteredPosCount, icon: <Sprout size={16} className="text-blue-600 dark:text-blue-400" /> },
            { label: 'Bajem', value: activeFilteredBajemCount, icon: <Church size={16} className="text-emerald-600 dark:text-emerald-400" /> },
            { label: 'Total Scoped', value: filteredData.length, icon: <Layers size={16} className="text-purple-600 dark:text-purple-400" /> },
          ]}
          className="hairline-b bg-surface-1/40"
        />

        {/* 5. Content Area: Cardless List or Loading/Empty State */}
        <div className="pt-1">
          {/* 🔴 SKELETON HANYA SAAT INITIAL LOAD TANPA DATA (isPending) */}
          {isPending && dataList.length === 0 ? (
            <ListSkeleton count={6} />
          ) : isError && dataList.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Gagal Memuat Data"
              description="Terjadi kesalahan koneksi saat memuat data Pos Pelkes."
              action={{
                label: 'Coba Lagi',
                onClick: () => refetch(),
                variant: 'primary',
              }}
            />
          ) : filteredData.length > 0 ? (
            <>
              {/* Cardless List Container (opacity-90 during background refetch) */}
              <div
                className={cn(
                  'divide-y divide-line-hairline transition-opacity duration-200',
                  isFetching && 'opacity-90'
                )}
              >
                {currentData.map((pos) => {
                  const posType = detectPosType(pos);
                  const isBajem = posType === 'bajem';
                  
                  const jemaatObj = pos.jemaat_induk;
                  const j = Array.isArray(jemaatObj) ? jemaatObj[0] : jemaatObj;
                  const mupelObj = j?.mupel;
                  const m = Array.isArray(mupelObj) ? mupelObj[0] : mupelObj;
                  const cleanedJemaat = j?.nama_induk ? cleanQuotes(j.nama_induk) : '';
                  const cleanedMupel = m?.nama_mupel ? cleanQuotes(m.nama_mupel) : '';
                  const cleanedAddress = pos.alamat ? cleanQuotes(pos.alamat) : '';

                  const displayName = pos.nama_pos || `Pos ${pos.id_pos}`;

                  return (
                    <ListRow
                      key={pos.id_pos}
                      icon={isBajem ? <Church className="h-5 w-5" /> : <Sprout className="h-5 w-5" />}
                      iconVariant={isBajem ? 'accent' : 'brand'}
                      title={<PosName name={displayName} />}
                      subtitle={
                        cleanedJemaat ? (
                          <span>
                            {cleanedJemaat} {cleanedMupel ? `· Mupel ${cleanedMupel.replace(/^Mupel\s+/i, '')}` : ''}
                          </span>
                        ) : (
                          <span className="text-ink-disabled">Induk tak terdaftar</span>
                        )
                      }
                      meta={
                        cleanedAddress ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} className="shrink-0 text-brand-400" />
                            <span className="truncate">{cleanedAddress}</span>
                          </span>
                        ) : (
                          <span>ID: {pos.id_pos}</span>
                        )
                      }
                      badge={
                        <Badge
                          variant={isBajem ? 'outline' : 'brand'}
                          className={isBajem ? 'bg-surface-accent text-accent-600 border-accent-300/40 text-[10px] py-0 px-2' : 'text-[10px] py-0 px-2'}
                        >
                          {isBajem ? 'Bajem' : pos.kategori || 'Pos'}
                        </Badge>
                      }
                      action={
                        canElevate ? (
                          <button
                            type="button"
                            onClick={(e) => handleOpenElevate(e, pos)}
                            className="p-2 rounded-xl text-accent-600 hover:bg-surface-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Elevasi Status Pos/Bajem"
                          >
                            <TrendingUp size={16} />
                          </button>
                        ) : null
                      }
                      onClick={() => router.push(`/dashboard/pos-pelkes/${pos.id_pos}`)}
                    />
                  );
                })}
              </div>

              {/* Sleek Compact Pagination Nav */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 px-4 py-4 hairline-t mt-2 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      haptic.selection();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    disabled={currentPage === 1}
                    className="tap h-11 w-11 rounded-xl bg-surface-sunken hover:bg-surface-brand text-ink-primary flex items-center justify-center border border-border-subtle/50 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 shrink-0 min-h-[44px] min-w-[44px]"
                    aria-label="Halaman Sebelumnya"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-sunken/60 text-xs font-semibold text-ink-secondary tnum border border-border-subtle/40 min-h-[44px]">
                    <span className="text-ink-primary font-bold text-sm">{currentPage}</span>
                    <span className="text-ink-tertiary">/</span>
                    <span>{totalPages}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      haptic.selection();
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                    }}
                    disabled={currentPage === totalPages}
                    className="tap h-11 w-11 rounded-xl bg-surface-sunken hover:bg-surface-brand text-ink-primary flex items-center justify-center border border-border-subtle/50 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 shrink-0 min-h-[44px] min-w-[44px]"
                    aria-label="Halaman Selanjutnya"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Contextual Empty State */
            <EmptyState
              icon={isFilterActive ? SearchX : Church}
              title={isFilterActive ? 'Tidak ada Pos atau Bajem ditemukan' : 'Belum Ada Pos Pelkes'}
              description={
                isFilterActive
                  ? 'Tidak ada Pos Pelkes atau Bajem yang cocok dengan kriteria pencarian atau filter Anda.'
                  : 'Daftar Pos Pelkes terdaftar masih kosong untuk jemaat ini.'
              }
              action={
                isFilterActive
                  ? {
                      label: 'Reset Filter',
                      onClick: resetFilters,
                      variant: 'outline',
                    }
                  : {
                      label: 'Tambah Pos Baru',
                      href: '/dashboard/pos-pelkes/baru',
                      variant: 'primary',
                    }
              }
            />
          )}
        </div>

        {/* 6. Floating Sticky Bottom Action Button ("Tambah Pos") */}
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] inset-x-0 z-30 pointer-events-none px-4 bg-gradient-to-t from-surface-base via-surface-base/90 to-transparent pt-6 pb-2">
          <Link
            href="/dashboard/pos-pelkes/baru"
            onClick={() => haptic.light()}
            className="pointer-events-auto h-12 w-full max-w-lg mx-auto rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-semibold shadow-md tap flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={20} className="stroke-[2.5]" />
            <span>Tambah Pos</span>
          </Link>
        </div>

        {/* Status Elevation Modal */}
        {elevatePosItem && (
          <StatusElevationModal
            isOpen={!!elevatePosItem}
            onClose={() => setElevatePosItem(null)}
            posItem={elevatePosItem}
          />
        )}
      </div>
    </PullToRefresh>
  );
}
