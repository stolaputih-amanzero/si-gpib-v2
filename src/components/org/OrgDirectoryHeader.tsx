'use client';

import { Search, Building2, Church, MapPin, RefreshCw, Layers } from 'lucide-react';
import { HierarchyStatsData } from '@/hooks/use-hierarki';
import { OrgLevelFilter } from '@/hooks/use-org-directory';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/utils';

interface OrgDirectoryHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stats?: HierarchyStatsData;
  isLoading?: boolean;
  onRefresh?: () => void;
  activeTab: OrgLevelFilter;
  onTabChange: (tab: OrgLevelFilter) => void;
  totalFilteredCount: number;
}

export function OrgDirectoryHeader({
  searchQuery,
  onSearchChange,
  stats,
  isLoading,
  onRefresh,
  activeTab,
  onTabChange,
  totalFilteredCount,
}: OrgDirectoryHeaderProps) {
  const filterCards = [
    {
      id: 'all' as OrgLevelFilter,
      label: 'Semua Level',
      value: (stats?.total_mupel ?? 0) + (stats?.total_jemaat ?? 0) + (stats?.total_bajem ?? 0) + (stats?.total_pos ?? 0),
      icon: Layers,
      iconColor: 'text-slate-600 dark:text-slate-300',
      iconBg: 'bg-slate-500/10',
    },
    {
      id: 'mupel' as OrgLevelFilter,
      label: 'Mupel',
      value: stats?.total_mupel ?? 0,
      icon: Church,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-500/10',
    },
    {
      id: 'jemaat' as OrgLevelFilter,
      label: 'Jemaat',
      value: stats?.total_jemaat ?? 0,
      icon: Building2,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      id: 'bajem' as OrgLevelFilter,
      label: 'Bajem',
      value: stats?.total_bajem ?? 0,
      icon: Building2,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    {
      id: 'pos' as OrgLevelFilter,
      label: 'Pos Pelkes',
      value: stats?.total_pos ?? 0,
      icon: MapPin,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Open Canvas Hero Title & Status */}
      <div className="pt-2 sm:pt-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <StatusPill variant="gold" dot={true}>
              Sinode GPIB
            </StatusPill>
            <StatusPill variant="blue" dot={false}>
              F15 Workspace
            </StatusPill>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-surface-1 hover:bg-stone-100 dark:hover:bg-stone-800 text-ink-secondary hover:text-ink-primary active:scale-95 transition-all min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
              title="Perbarui Data Direktori"
              aria-label="Perbarui Data Direktori"
            >
              <RefreshCw size={15} className={cn('text-amber-600 dark:text-amber-400', isLoading ? 'animate-spin' : '')} />
            </button>
          )}
        </div>

        <div className="space-y-1 pt-1">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-ink-primary tracking-tight leading-[1.15]">
            Direktori <span className="font-editorial-italic font-normal text-amber-700 dark:text-amber-400">Organisasi.</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
            Pusat pencarian &amp; hierarki struktural Sinode, 25 Mupel, Jemaat Induk, Bakal Jemaat, dan Pos Pelkes.
          </p>
        </div>
      </div>

      {/* Streamlined Filter Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {filterCards.map((card) => {
          const isActive = activeTab === card.id;
          const Icon = card.icon;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onTabChange(isActive && card.id !== 'all' ? 'all' : card.id)}
              className={cn(
                'group relative p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-2.5 select-none active:scale-[0.98]',
                isActive
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-xs'
                  : 'bg-surface-1 border-stone-200/70 dark:border-stone-800 hover:border-amber-500/35 hover:bg-stone-50 dark:hover:bg-stone-800/60'
              )}
            >
              <div
                className={cn(
                  'size-8.5 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                  card.iconBg,
                  card.iconColor
                )}
              >
                <Icon size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="micro-label text-ink-tertiary truncate">
                    {card.label}
                  </span>
                  {isActive && (
                    <span className="size-1.5 rounded-full bg-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                </div>
                <p className="font-editorial tnum text-base sm:text-lg font-bold text-ink-primary leading-tight mt-0.5">
                  {isLoading ? '...' : card.value.toLocaleString('id-ID')}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search Input Bar with live filter counter */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 size-4 text-ink-tertiary pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama unit, Mupel, KMJ, PJ, atau kode ID..."
          className="w-full pl-10 pr-28 py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-surface-1 border border-stone-200/80 dark:border-stone-800 text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-xs transition-all"
        />
        <div className="absolute right-3 flex items-center gap-2">
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-xs text-amber-700 dark:text-amber-400 hover:underline px-2 py-0.5 rounded-lg bg-amber-500/10 cursor-pointer"
            >
              Reset
            </button>
          )}
          <span className="text-[11px] font-bold text-ink-tertiary hidden sm:inline px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700">
            {totalFilteredCount} Unit
          </span>
        </div>
      </div>
    </div>
  );
}
