'use client';

import { useHierarchyStats } from '@/hooks/use-hierarki';
import { Layers, Church, Building2, MapPin, Home, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';

interface HierarchyStatsProps {
  overrideStats?: {
    total_mupel?: number;
    total_jemaat?: number;
    total_bajem?: number;
    total_pos?: number;
    total_kk?: number;
    total_jiwa?: number;
  };
}

export function HierarchyStats({ overrideStats }: HierarchyStatsProps) {
  const { data: statsData, isLoading } = useHierarchyStats();

  const stats = {
    total_mupel: overrideStats?.total_mupel ?? statsData?.total_mupel ?? 0,
    total_jemaat: overrideStats?.total_jemaat ?? statsData?.total_jemaat ?? 0,
    total_bajem: overrideStats?.total_bajem ?? statsData?.total_bajem ?? 0,
    total_pos: overrideStats?.total_pos ?? statsData?.total_pos ?? 0,
    total_kk: overrideStats?.total_kk ?? statsData?.total_kk ?? 0,
    total_jiwa: overrideStats?.total_jiwa ?? statsData?.total_jiwa ?? 0,
  };

  if (isLoading && !overrideStats) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Row 1: Mupel, Jemaat, Bajem, Pos Pelkes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Mupel */}
        <div className="bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">Mupel</span>
            <span className="text-base sm:text-lg font-black text-text-high tabular-nums">
              {formatNumber(stats.total_mupel)}
            </span>
          </div>
        </div>

        {/* 2. Jemaat */}
        <div className="bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Church size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">Jemaat</span>
            <span className="text-base sm:text-lg font-black text-text-high tabular-nums">
              {formatNumber(stats.total_jemaat)}
            </span>
          </div>
        </div>

        {/* 3. Bajem */}
        <div className="bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">Bajem</span>
            <span className="text-base sm:text-lg font-black text-text-high tabular-nums">
              {formatNumber(stats.total_bajem)}
            </span>
          </div>
        </div>

        {/* 4. Pos Pelkes */}
        <div className="bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <MapPin size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">Pos Pelkes</span>
            <span className="text-base sm:text-lg font-black text-text-high tabular-nums">
              {formatNumber(stats.total_pos)}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Jumlah KK & Jumlah Jiwa */}
      <div className="grid grid-cols-2 gap-3">
        {/* 5. Jumlah KK */}
        <div className="bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Home size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">Jumlah KK</span>
            <span className="text-base sm:text-lg font-black text-text-high tabular-nums">
              {formatNumber(stats.total_kk)}
            </span>
          </div>
        </div>

        {/* 6. Jumlah Jiwa */}
        <div className="bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
            <Users size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">Jumlah Jiwa</span>
            <span className="text-base sm:text-lg font-black text-text-high tabular-nums">
              {formatNumber(stats.total_jiwa)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
