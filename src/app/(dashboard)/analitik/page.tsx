'use client';

import { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  useAnalitikKPI,
  useAnalitikDemografi,
  useAnalitikBantuan,
  useAnalitikAsetKondisi,
} from '@/hooks/use-analitik';
import { useExportAnalitik } from '@/hooks/use-export-analitik';

import { KPICard } from '@/components/analitik/KPICard';
import { AnalitikFilterComponent } from '@/components/analitik/AnalitikFilter';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Sprout,
  Users,
  UserCheck,
  Box,
  HandHeart,
  BarChart2,
  RefreshCw,
  Download,
  X,
  FileSpreadsheet,
  Printer,
  Share2,
} from 'lucide-react';

// Lazy Load Recharts components (ssr: false)
const DemografiChart = dynamic(
  () => import('@/components/analitik/DemografiChart').then((mod) => mod.DemografiChart),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[280px] rounded-2xl" />,
  }
);

const BantuanStatusChart = dynamic(
  () => import('@/components/analitik/BantuanStatusChart').then((mod) => mod.BantuanStatusChart),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[280px] rounded-2xl" />,
  }
);

const AsetKondisiChart = dynamic(
  () => import('@/components/analitik/AsetKondisiChart').then((mod) => mod.AsetKondisiChart),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[280px] rounded-2xl" />,
  }
);

export default function DashboardAnalitikPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryMupel = searchParams.get('mupel') || '';
  const queryJemaat = searchParams.get('jemaat') || '';

  const [selectedMupel, setSelectedMupel] = useState<string>(queryMupel);
  const [selectedJemaat, setSelectedJemaat] = useState<string>(queryJemaat);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Sync state changes to URL search params
  const updateUrlParams = (mupel: string, jemaat: string) => {
    const params = new URLSearchParams();
    if (mupel) params.set('mupel', mupel);
    if (jemaat) params.set('jemaat', jemaat);
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const handleMupelChange = (val: string) => {
    setSelectedMupel(val);
    setSelectedJemaat('');
    updateUrlParams(val, '');
  };

  const handleJemaatChange = (val: string) => {
    setSelectedJemaat(val);
    updateUrlParams(selectedMupel, val);
  };

  const handleReset = () => {
    setSelectedMupel('');
    setSelectedJemaat('');
    updateUrlParams('', '');
  };

  const filter = {
    id_mupel: selectedMupel || undefined,
    id_induk: selectedJemaat || undefined,
  };

  const { data: kpiData, isLoading: isLoadingKPI, refetch: refetchKPI, isFetching: isFetchingKPI } = useAnalitikKPI(filter);
  const { data: demografiData, isLoading: isLoadingDemo } = useAnalitikDemografi(filter);
  const { data: bantuanData, isLoading: isLoadingBantuan } = useAnalitikBantuan(filter);
  const { data: asetData, isLoading: isLoadingAset } = useAnalitikAsetKondisi(filter);

  const { exportPDF, exportExcel, shareWhatsApp, isExporting } = useExportAnalitik(selectedMupel, selectedJemaat);

  return (
    <div className="w-full min-h-full bg-surface-base pb-32 md:pb-12 select-none">
      {/* 1. Context Header */}
      <div className="sticky top-0 z-40 bg-surface-1/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary shrink-0">
              <BarChart2 size={20} />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-text-high leading-tight">
                Dashboard Analitik
              </h1>
              <p className="text-xs text-text-tertiary">Metrik Ringkasan & Visualisasi Pos Pelkes GPIB</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refetchKPI()}
            disabled={isFetchingKPI}
            className="p-2.5 rounded-xl bg-surface-1 hover:bg-surface-sunken border border-border-subtle text-text-high transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={isFetchingKPI ? 'animate-spin text-brand-primary' : ''} />
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-5 space-y-6">
        {/* 2. Role-Adaptive Hierarchical Filter Section */}
        <AnalitikFilterComponent
          selectedMupel={selectedMupel}
          selectedJemaat={selectedJemaat}
          onMupelChange={handleMupelChange}
          onJemaatChange={handleJemaatChange}
          onReset={handleReset}
        />

        {/* 3. 5 KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {isLoadingKPI ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-[88px] rounded-2xl w-full" />)
          ) : (
            <>
              <KPICard
                title="Total Pos Pelkes"
                value={kpiData?.totalPos || 0}
                subtitle="Pos Pelkes & Bajem"
                icon={<Sprout size={20} />}
                badgeColor="bg-blue-500/10 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
              />
              <KPICard
                title="Total Jiwa"
                value={kpiData?.totalJiwa || 0}
                subtitle="Anggota 6 Pelkat"
                icon={<Users size={20} />}
                badgeColor="bg-amber-500/10 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
              />
              <KPICard
                title="Pendeta Aktif"
                value={kpiData?.totalPendeta || 0}
                subtitle="Organik & Non-Organik"
                icon={<UserCheck size={20} />}
                badgeColor="bg-purple-500/10 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"
              />
              <KPICard
                title="Total Aset Pos"
                value={kpiData?.totalAset || 0}
                subtitle="Tanah, Bangunan, Item"
                icon={<Box size={20} />}
                badgeColor="bg-indigo-500/10 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
              />
              <KPICard
                title="Bantuan Pending"
                value={kpiData?.totalBantuanPending || 0}
                subtitle="Dalam Review Approval"
                icon={<HandHeart size={20} />}
                badgeColor="bg-rose-500/10 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
              />
            </>
          )}
        </div>

        {/* 4. Visualisasi Demografi BarChart */}
        {isLoadingDemo ? (
          <Skeleton className="w-full h-[280px] rounded-2xl" />
        ) : (
          <DemografiChart data={demografiData || []} idMupel={selectedMupel} />
        )}

        {/* 5. Grid Charts: Status Bantuan & Kondisi Aset */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoadingBantuan ? (
            <Skeleton className="w-full h-[280px] rounded-2xl" />
          ) : (
            <BantuanStatusChart data={bantuanData || []} />
          )}

          {isLoadingAset ? (
            <Skeleton className="w-full h-[280px] rounded-2xl" />
          ) : (
            <AsetKondisiChart data={asetData || []} />
          )}
        </div>
      </main>

      {/* Floating Export FAB */}
      <div className="fixed bottom-24 right-4 z-30">
        <button
          type="button"
          onClick={() => setShowExportModal(true)}
          className="h-12 px-4 rounded-full bg-brand-primary text-white font-extrabold text-xs shadow-lg hover:bg-brand-primary/90 transition-all flex items-center gap-2 active:scale-95 cursor-pointer border border-white/20"
        >
          <Download size={18} />
          <span>Export Laporan</span>
        </button>
      </div>

      {/* Export Options Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-1 w-full max-w-sm rounded-2xl p-5 border border-border-subtle shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-extrabold text-text-high">Export Laporan Analitik</h3>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-text-tertiary hover:text-text-high"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowExportModal(false);
                  exportPDF();
                }}
                disabled={isExporting}
                className="w-full p-3 rounded-xl bg-surface-sunken hover:bg-surface-sunken/80 border border-border-subtle text-text-high text-xs font-bold flex items-center gap-3 transition-colors min-h-[44px] cursor-pointer"
              >
                <Printer size={18} className="text-brand-primary" />
                <span>Cetak / Save sebagai PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExportModal(false);
                  exportExcel(kpiData);
                }}
                disabled={isExporting}
                className="w-full p-3 rounded-xl bg-surface-sunken hover:bg-surface-sunken/80 border border-border-subtle text-text-high text-xs font-bold flex items-center gap-3 transition-colors min-h-[44px] cursor-pointer"
              >
                <FileSpreadsheet size={18} className="text-emerald-600" />
                <span>Unduh File Excel / CSV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExportModal(false);
                  shareWhatsApp(kpiData);
                }}
                className="w-full p-3 rounded-xl bg-surface-sunken hover:bg-surface-sunken/80 border border-border-subtle text-text-high text-xs font-bold flex items-center gap-3 transition-colors min-h-[44px] cursor-pointer"
              >
                <Share2 size={18} className="text-emerald-500" />
                <span>Kirim Ringkasan ke WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
