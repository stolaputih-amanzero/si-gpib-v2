'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  useAnalitikKPI, 
  useAnalitikDemografi, 
  useAnalitikBantuan, 
  useAnalitikAsetKondisi 
} from '@/hooks/use-analitik';
import { KPICard } from '@/components/analitik/KPICard';
import { AnalitikFilterComponent } from '@/components/analitik/AnalitikFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, 
  Users, 
  UserCheck, 
  Box, 
  HandHeart, 
  BarChart2, 
  RefreshCw 
} from 'lucide-react';

// Lazy Load Recharts components (SSR: false)
const DemografiChart = dynamic(
  () => import('@/components/analitik/DemografiChart').then((mod) => mod.DemografiChart),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[260px] sm:h-[320px] rounded-2xl" />,
  }
);

const BantuanStatusChart = dynamic(
  () => import('@/components/analitik/BantuanStatusChart').then((mod) => mod.BantuanStatusChart),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[260px] sm:h-[300px] rounded-2xl" />,
  }
);

const AsetKondisiChart = dynamic(
  () => import('@/components/analitik/AsetKondisiChart').then((mod) => mod.AsetKondisiChart),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[240px] sm:h-[280px] rounded-2xl" />,
  }
);

export default function DashboardAnalitikPage() {
  const [selectedMupel, setSelectedMupel] = useState<string>('');
  const [selectedJemaat, setSelectedJemaat] = useState<string>('');

  const filter = {
    id_mupel: selectedMupel || undefined,
    id_induk: selectedJemaat || undefined,
  };

  const { data: kpiData, isLoading: isLoadingKPI, refetch: refetchKPI } = useAnalitikKPI(filter);
  const { data: demografiData, isLoading: isLoadingDemo } = useAnalitikDemografi(filter);
  const { data: bantuanData, isLoading: isLoadingBantuan } = useAnalitikBantuan(filter);
  const { data: asetData, isLoading: isLoadingAset } = useAnalitikAsetKondisi(filter);

  const handleReset = () => {
    setSelectedMupel('');
    setSelectedJemaat('');
  };

  return (
    <div className="w-full min-h-full bg-surface-base pb-32 md:pb-12">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
              <BarChart2 size={20} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-brand-primary">
                Dashboard Analitik
              </h1>
              <p className="text-xs text-text-muted">Metrik Ringkasan & Visualisasi Pos Pelkes GPIB</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refetchKPI()}
            className="p-2.5 rounded-xl bg-surface-sunken hover:bg-surface-hover text-text-high transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={isLoadingKPI ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-5 space-y-6">
        {/* Filter Section */}
        <AnalitikFilterComponent
          selectedMupel={selectedMupel}
          selectedJemaat={selectedJemaat}
          onMupelChange={setSelectedMupel}
          onJemaatChange={setSelectedJemaat}
          onReset={handleReset}
          isSuperUser={true}
        />

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {isLoadingKPI ? (
            [...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-[88px] rounded-xl w-full" />
            ))
          ) : (
            <>
              <KPICard
                title="Total Pos Pelkes"
                value={kpiData?.totalPos || 0}
                subtitle="Pos Pelkes & Bajem"
                icon={<MapPin size={20} />}
                badgeColor="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
              />
              <KPICard
                title="Total Jiwa"
                value={kpiData?.totalJiwa || 0}
                subtitle="Anggota 6 Pelkat"
                icon={<Users size={20} />}
                badgeColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
              />
              <KPICard
                title="Pendeta Aktif"
                value={kpiData?.totalPendeta || 0}
                subtitle="Organik & Non-Organik"
                icon={<UserCheck size={20} />}
                badgeColor="bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"
              />
              <KPICard
                title="Total Aset Pos"
                value={kpiData?.totalAset || 0}
                subtitle="Tanah, Bangunan, Item"
                icon={<Box size={20} />}
                badgeColor="bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
              />
              <KPICard
                title="Bantuan Pending"
                value={kpiData?.totalBantuanPending || 0}
                subtitle="Dalam Review Approval"
                icon={<HandHeart size={20} />}
                badgeColor="bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400"
              />
            </>
          )}
        </div>

        {/* Demografi BarChart */}
        {isLoadingDemo ? (
          <Skeleton className="w-full h-[260px] sm:h-[320px] rounded-2xl" />
        ) : (
          <DemografiChart data={demografiData || []} />
        )}

        {/* Charts Grid: Bantuan & Kondisi Aset */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoadingBantuan ? (
            <Skeleton className="w-full h-[260px] sm:h-[300px] rounded-2xl" />
          ) : (
            <BantuanStatusChart data={bantuanData || []} />
          )}

          {isLoadingAset ? (
            <Skeleton className="w-full h-[240px] sm:h-[280px] rounded-2xl" />
          ) : (
            <AsetKondisiChart data={asetData || []} />
          )}
        </div>
      </main>
    </div>
  );
}
