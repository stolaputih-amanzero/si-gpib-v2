'use client';

import { useHierarchyStats } from '@/hooks/use-hierarki';
import { Layers, Church, MapPin, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface HierarchyStatsProps {
  overrideStats?: {
    total_mupel?: number;
    total_jemaat?: number;
    total_pos?: number;
    total_jiwa?: number;
  };
}

export function HierarchyStats({ overrideStats }: HierarchyStatsProps) {
  const { data: statsData, isLoading } = useHierarchyStats();

  const stats = {
    total_mupel: overrideStats?.total_mupel ?? statsData?.total_mupel ?? 25,
    total_jemaat: overrideStats?.total_jemaat ?? statsData?.total_jemaat ?? 350,
    total_pos: overrideStats?.total_pos ?? statsData?.total_pos ?? 500,
    total_jiwa: overrideStats?.total_jiwa ?? statsData?.total_jiwa ?? 50000,
  };

  if (isLoading && !overrideStats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* 1. Mupel */}
      <div className="bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
          <Layers size={20} />
        </div>
        <div>
          <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">Mupel</span>
          <span className="text-base sm:text-lg font-black text-text-high tabular-nums">
            {stats.total_mupel} Wilayah
          </span>
        </div>
      </div>

      {/* 2. Jemaat Induk */}
      <div className="bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Church size={20} />
        </div>
        <div>
          <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">Jemaat Induk</span>
          <span className="text-base sm:text-lg font-black text-text-high tabular-nums">
            {stats.total_jemaat} Gereja
          </span>
        </div>
      </div>

      {/* 3. Pos Pelkes */}
      <div className="bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          <MapPin size={20} />
        </div>
        <div>
          <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">Pos Pelkes</span>
          <span className="text-base sm:text-lg font-black text-text-high tabular-nums">
            {stats.total_pos} Pos
          </span>
        </div>
      </div>

      {/* 4. Estimasi Jiwa */}
      <div className="bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
          <Users size={20} />
        </div>
        <div>
          <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">Estimasi Jiwa</span>
          <span className="text-base sm:text-lg font-black text-text-high tabular-nums">
            {stats.total_jiwa.toLocaleString('id-ID')}+
          </span>
        </div>
      </div>
    </div>
  );
}
