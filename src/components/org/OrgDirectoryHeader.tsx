'use client';

import { Search, Building2, Church, MapPin, Users, RefreshCw } from 'lucide-react';
import { HierarchyStatsData } from '@/hooks/use-hierarki';

interface OrgDirectoryHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stats?: HierarchyStatsData;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function OrgDirectoryHeader({
  searchQuery,
  onSearchChange,
  stats,
  isLoading,
  onRefresh,
}: OrgDirectoryHeaderProps) {
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
            Pusat pencarian & hierarki struktural Sinode, Mupel, Jemaat Induk, dan Pos Pelkes
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

      {/* Hierarchy Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Church size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Mupel</p>
            <p className="text-base font-black text-text-high">
              {isLoading ? '...' : stats?.total_mupel ?? 0}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Jemaat Induk</p>
            <p className="text-base font-black text-text-high">
              {isLoading ? '...' : stats?.total_jemaat ?? 0}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Pos Pelkes / Bajem</p>
            <p className="text-base font-black text-text-high">
              {isLoading ? '...' : (stats?.total_pos ?? 0) + (stats?.total_bajem ?? 0)}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Jiwa</p>
            <p className="text-base font-black text-text-high">
              {isLoading ? '...' : stats?.total_jiwa ? stats.total_jiwa.toLocaleString('id-ID') : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama organisasi, Mupel, KMJ, PJ, atau ID..."
          className="w-full pl-10 pr-10 py-3 text-sm rounded-2xl bg-surface-elevated border border-border-subtle text-text-high placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/30 shadow-xs transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 text-xs text-text-muted hover:text-text-high px-2 py-1 rounded-lg bg-surface-sunken"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
