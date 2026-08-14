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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
    <div className="min-h-screen bg-surface-base pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-surface-elevated/90 backdrop-blur-md border-b border-border-subtle z-20 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-extrabold text-text-high">Dashboard Analitik</h1>
            <p className="text-xs text-text-muted">Ringkasan KPI & Sebaran Pos Pelkes GPIB</p>
          </div>
          <div className="flex items-center gap-2">
            <AnalyticsFilter
              filter={filter}
              onFilterChange={setFilter}
              mupelList={[]}
              jemaatList={[]}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isLoading || !analyticsData}
              className="hidden sm:flex bg-surface-1 border-border-subtle text-text-high hover:bg-surface-sunken"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>
      </div>

      <PullToRefresh onRefresh={async () => { await refetch(); }}>
        <main className="max-w-7xl mx-auto p-4 space-y-6">
          {/* Section 1: KPI Stat Cards Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
                  colorIcon="text-blue-500 dark:text-blue-400"
                />
                <AnalyticsStatCard
                  title="Total Pendeta"
                  value={analyticsData?.stats.total_pendeta || 0}
                  trend={analyticsData?.stats.pendeta_growth_month || 0}
                  icon={Users}
                  colorBg="bg-amber-500/10 dark:bg-amber-500/20"
                  colorIcon="text-amber-500 dark:text-amber-400"
                />
                <AnalyticsStatCard
                  title="Total Jemaat"
                  value={analyticsData?.stats.total_jemaat || 0}
                  trend={analyticsData?.stats.jemaat_growth_month || 0}
                  icon={Church}
                  colorBg="bg-purple-500/10 dark:bg-purple-500/20"
                  colorIcon="text-purple-500 dark:text-purple-400"
                />
                <AnalyticsStatCard
                  title="Log Pastoral (Bln Ini)"
                  value={analyticsData?.stats.total_log_pastoral_month || 0}
                  trend={analyticsData?.stats.log_growth_month || 0}
                  icon={Activity}
                  colorBg="bg-emerald-500/10 dark:bg-emerald-500/20"
                  colorIcon="text-emerald-500 dark:text-emerald-400"
                />
              </>
            )}
          </section>

          {/* Section 2: Visualizations (Growth Line Chart + Distribution Bar Chart) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {isLoading ? (
              <>
                <Skeleton className="h-[340px] rounded-2xl" />
                <Skeleton className="h-[340px] rounded-2xl" />
              </>
            ) : (
              <>
                <GrowthChart data={analyticsData?.growth_trends || []} />
                <DistributionChart data={analyticsData?.mupel_distribution || []} />
              </>
            )}
          </section>

          {/* Section 3: Interactive Distribution Map */}
          <section>
            {isLoading ? (
              <Skeleton className="h-[400px] rounded-2xl" />
            ) : (
              <AnalyticsMap locations={analyticsData?.pos_locations || []} />
            )}
          </section>

          {/* Mobile Export Button */}
          <div className="sm:hidden pt-4">
            <Button
              onClick={handleExport}
              disabled={isLoading || !analyticsData}
              className="w-full h-12 text-base font-semibold shadow-md bg-brand-primary text-white"
            >
              <Download className="w-5 h-5 mr-2" /> Export Laporan Excel
            </Button>
          </div>
        </main>
      </PullToRefresh>
    </div>
  );
}
