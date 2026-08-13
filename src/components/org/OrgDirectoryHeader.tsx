'use client';

import { Search, Building2, Church, MapPin, RefreshCw, Layers } from 'lucide-react';
import { HierarchyStatsData } from '@/hooks/use-hierarki';
import { OrgLevelFilter } from '@/hooks/use-org-directory';
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
      activeRing: 'ring-2 ring-slate-700 dark:ring-slate-300 border-slate-700 dark:border-slate-300 bg-slate-50 dark:bg-slate-900/60 shadow-md',
    },
    {
      id: 'mupel' as OrgLevelFilter,
      label: 'Mupel',
      value: stats?.total_mupel ?? 0,
      icon: Church,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-500/10',
      activeRing: 'ring-2 ring-purple-600 dark:ring-purple-400 border-purple-500 bg-purple-500/10 shadow-md',
    },
    {
      id: 'jemaat' as OrgLevelFilter,
      label: 'Jemaat',
      value: stats?.total_jemaat ?? 0,
      icon: Building2,
      iconColor: 'text-brand-primary',
      iconBg: 'bg-brand-primary/10',
      activeRing: 'ring-2 ring-brand-primary border-brand-primary bg-brand-primary/10 shadow-md',
    },
    {
      id: 'bajem' as OrgLevelFilter,
      label: 'Bajem',
      value: stats?.total_bajem ?? 0,
      icon: Building2,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/10',
      activeRing: 'ring-2 ring-amber-500 border-amber-500 bg-amber-500/10 shadow-md',
    },
    {
      id: 'pos' as OrgLevelFilter,
      label: 'Pos Pelkes',
      value: stats?.total_pos ?? 0,
      icon: MapPin,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      activeRing: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10 shadow-md',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Title & Refetch Button */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-black text-brand-primary tracking-tight">
              Direktori Organisasi GPIB
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              F15 Workspace
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Pusat pencarian & hierarki struktural Sinode, Mupel, Jemaat, Bajem, dan Pos Pelkes
          </p>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl border border-border-subtle bg-surface-elevated hover:bg-surface-sunken text-text-muted hover:text-text-high active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0 disabled:opacity-50"
            title="Perbarui Data Direktori"
            aria-label="Perbarui Data Direktori"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* Interactive StatCards that double as Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {filterCards.map((card) => {
          const isActive = activeTab === card.id;
          const Icon = card.icon;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onTabChange(isActive && card.id !== 'all' ? 'all' : card.id)}
              className={cn(
                'group relative p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3 select-none active:scale-[0.98]',
                isActive
                  ? card.activeRing
                  : 'bg-surface-elevated border-border-subtle hover:border-brand-primary/40 hover:bg-surface-sunken shadow-xs'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                  card.iconBg,
                  card.iconColor
                )}
              >
                <Icon size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider truncate">
                    {card.label}
                  </p>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                  )}
                </div>
                <p className="text-base font-black text-text-high leading-tight mt-0.5">
                  {isLoading ? '...' : card.value.toLocaleString('id-ID')}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search Input Bar with live filter counter */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama organisasi, Mupel, KMJ, PJ, atau ID..."
          className="w-full pl-10 pr-28 py-3 text-sm rounded-2xl bg-surface-elevated border border-border-subtle text-text-high placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/30 shadow-xs transition-all"
        />
        <div className="absolute right-3 flex items-center gap-2">
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-xs text-text-muted hover:text-text-high px-2 py-1 rounded-lg bg-surface-sunken"
            >
              Clear
            </button>
          )}
          <span className="text-[11px] font-bold text-text-muted hidden sm:inline px-2 py-0.5 rounded-md bg-surface-sunken border border-border-subtle">
            {totalFilteredCount} Tampil
          </span>
        </div>
      </div>
    </div>
  );
}

