'use client';

import { useState } from 'react';
import { useAnalyticsData } from '@/lib/domains/analytics/analytics.queries';
import { exportAnalyticsToExcel } from '@/lib/domains/analytics/analytics.service';
import { AnalyticsStatCard } from '@/components/analytics/AnalyticsStatCard';
import { GrowthChart } from '@/components/analytics/GrowthChart';
import { DistributionChart } from '@/components/analytics/DistributionChart';
import { AnalyticsMap } from '@/components/analytics/AnalyticsMap';
import { AnalyticsFilter } from '@/components/analytics/AnalyticsFilter';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { MapPin, Users, Church, Activity, Download } from 'lucide-react';
import type { AnalyticsFilter as AnalyticsFilterType } from '@/lib/domains/analytics/analytics.types';

export default function AnalyticsDashboardPage() {
  const [filter, setFilter] = useState<AnalyticsFilterType>({});

  const { data: analyticsData, isLoading, refetch } = useAnalyticsData(filter);

  const handleExport = () => {
    if (analyticsData) {
      exportAnalyticsToExcel(analyticsData);
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface-base pb-28 pt-1 sm:pt-3">
      <PullToRefresh onRefresh={async () => { await refetch(); }}>
        <main className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-7 sm:space-y-8">
          {/* LAYER 1: OPEN CANVAS HERO */}
          <section className="pt-2 sm:pt-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <StatusPill variant="gold" dot={true}>
                  Eksekutif &amp; Sinodal
                </StatusPill>
                <StatusPill variant="blue" dot={false}>
                  Live Intelligence
                </StatusPill>
              </div>

              <div className="flex items-center gap-2">
                <AnalyticsFilter
                  filter={filter}
                  onFilterChange={setFilter}
                  mupelList={[]}
                  jemaatList={[]}
                />
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isLoading || !analyticsData}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-ink-primary bg-surface-1 border border-stone-200/80 dark:border-stone-800 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Export data analitik ke Excel"
                >
                  <Download className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-ink-primary tracking-tight leading-[1.15]">
                Dashboard <span className="font-editorial-italic font-normal text-amber-700 dark:text-amber-400">Analitik.</span>
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
                Ringkasan performa KPI, distribusi wilayah pelayanan, dan sebaran geografis 163 Pos Pelkes GPIB di seluruh Indonesia.
              </p>
            </div>
          </section>

          {/* LAYER 2: STREAMLINED KPI STAT CARDS */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))
            ) : (
              <>
                <AnalyticsStatCard
                  title="Total Pos Pelkes"
                  value={analyticsData?.stats.total_pos || 0}
                  trend={analyticsData?.stats.pos_growth_month || 0}
                  icon={MapPin}
                  colorBg="bg-blue-500/10 dark:bg-blue-500/20"
                  colorIcon="text-blue-600 dark:text-blue-400"
                />
                <AnalyticsStatCard
                  title="Total Pendeta"
                  value={analyticsData?.stats.total_pendeta || 0}
                  trend={analyticsData?.stats.pendeta_growth_month || 0}
                  icon={Users}
                  colorBg="bg-amber-500/10 dark:bg-amber-500/20"
                  colorIcon="text-amber-600 dark:text-amber-400"
                />
                <AnalyticsStatCard
                  title="Total Jemaat"
                  value={analyticsData?.stats.total_jemaat || 0}
                  trend={analyticsData?.stats.jemaat_growth_month || 0}
                  icon={Church}
                  colorBg="bg-purple-500/10 dark:bg-purple-500/20"
                  colorIcon="text-purple-600 dark:text-purple-400"
                />
                <AnalyticsStatCard
                  title="Log Pastoral (Bln Ini)"
                  value={analyticsData?.stats.total_log_pastoral_month || 0}
                  trend={analyticsData?.stats.log_growth_month || 0}
                  icon={Activity}
                  colorBg="bg-emerald-500/10 dark:bg-emerald-500/20"
                  colorIcon="text-emerald-600 dark:text-emerald-400"
                />
              </>
            )}
          </section>

          {/* LAYER 3: VISUAL CHARTS (Bento Layout) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {isLoading ? (
              <>
                <Skeleton className="h-64 rounded-2xl" />
                <Skeleton className="h-64 rounded-2xl" />
              </>
            ) : (
              <>
                <GrowthChart data={analyticsData?.growth_trends || []} />
                <DistributionChart data={analyticsData?.mupel_distribution || []} />
              </>
            )}
          </section>

          {/* LAYER 4: SEBARAN POS PELKES GEOSPATIAL MAP */}
          <section className="space-y-2">
            <AnalyticsMap locations={analyticsData?.pos_locations || []} />
          </section>
        </main>
      </PullToRefresh>
    </div>
  );
}
