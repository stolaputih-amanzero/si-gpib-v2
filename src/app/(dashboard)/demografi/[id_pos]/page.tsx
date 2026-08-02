'use client';

import { use, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDemografiByPos, useDeleteDemografi } from '@/hooks/use-demografi';
import { useExportDemografi } from '@/hooks/use-export-demografi';
import { aggregateDemografi, extractTopProfesi } from '@/lib/utils/demografi-aggregator';

import { DemografiForm } from '@/components/demografi/DemografiForm';
import { DemografiBarChart } from '@/components/charts/DemografiBarChart';
import { DemografiStackedChart } from '@/components/charts/DemografiStackedChart';
import { DemografiDonutChart } from '@/components/charts/DemografiDonutChart';
import { KategoriPelkatCard } from '@/components/demografi/KategoriPelkatCard';

import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { PosName } from '@/components/ui/PosName';

import {
  ArrowLeft,
  Plus,
  Share2,
  Download,
  Users,
  Home,
  UserCheck,
  Building,
  X,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import Link from 'next/link';

function DemografiPosContent({ id_pos }: { id_pos: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');

  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const { data: demografiData, isLoading } = useDemografiByPos(id_pos);
  const deleteMutation = useDeleteDemografi();

  const posNameDisplay = id_pos || 'Pos Pelkes';
  const { exportPDF, exportExcel, shareWhatsApp, isExporting } = useExportDemografi(posNameDisplay, demografiData || []);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowFormModal(true);
  };

  const handleAddNew = (kode?: string) => {
    setEditingItem(kode ? { id_pos, kategori_pelkat: kode } : { id_pos });
    setShowFormModal(true);
  };

  const handleDelete = async (kategori_pelkat: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data demografi ${kategori_pelkat}?`)) {
      await deleteMutation.mutateAsync({ id_pos, kategori_pelkat });
    }
  };

  useEffect(() => {
    if (action === 'new') {
      const timer = setTimeout(() => {
        handleAddNew();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [action]);

  const summary = aggregateDemografi(demografiData || []);
  const topProfesi = extractTopProfesi(demografiData || [], 5);

  const barChartData = KATEGORI_PELKAT.map((k) => {
    const found = demografiData?.find((d: any) => d.kategori_pelkat === k.kode);
    const laki = found ? Number(found.laki || 0) : 0;
    const perempuan = found ? Number(found.perempuan || 0) : 0;
    return {
      kategori: k.kode,
      total: laki + perempuan,
      laki,
      perempuan,
    };
  });

  return (
    <div className="w-full min-h-full bg-surface-base pb-32 md:pb-12 select-none">
      {/* 1. Context Header */}
      <div className="sticky top-0 z-40 bg-surface-1/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/pos-pelkes/${id_pos}`}
              className="w-10 h-10 rounded-xl bg-surface-sunken flex items-center justify-center text-text-high hover:bg-surface-sunken/80 transition-colors shrink-0 min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-display font-semibold text-text-high leading-tight flex items-center gap-1.5">
                <Building size={16} className="text-brand-primary shrink-0" />
                <PosName name={id_pos} />
              </h1>
              <p className="text-xs text-text-tertiary">Demografi 6 Pelkat Standar GPIB</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={shareWhatsApp}
              className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title="Share WA"
            >
              <Share2 size={18} />
            </button>

            <button
              type="button"
              onClick={() => handleAddNew()}
              className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition-all flex items-center gap-1.5 shadow-2xs min-h-[44px] cursor-pointer"
            >
              <Plus size={16} />
              <span>{demografiData && demografiData.length > 0 ? 'Input Data' : 'Tambah'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 2. SummaryStrip (4 Metrik Agregat Utama) */}
        <SummaryStrip
          metrics={[
            { label: 'Total KK', value: summary.totalKK, icon: <Home size={16} /> },
            { label: 'Total Jiwa', value: summary.totalJiwa, icon: <Users size={16} /> },
            { label: 'Laki-Laki', value: summary.totalLaki, icon: <UserCheck size={16} /> },
            { label: 'Perempuan', value: summary.totalPerempuan, icon: <UserCheck size={16} /> },
          ]}
          className="hairline-b bg-surface-1/40 rounded-2xl py-3 px-4 border border-border-subtle"
        />

        {isLoading ? (
          <ListSkeleton count={6} />
        ) : demografiData && demografiData.length > 0 ? (
          <>
            {/* 3. Section Chart 1: Bar Horizontal per Kategori */}
            <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-text-high">Jumlah Jiwa per Kategori Pelkat</h2>
                  <p className="text-[11px] text-text-tertiary">Diurutkan dari kategori dengan jumlah terbesar</p>
                </div>
              </div>
              <DemografiBarChart data={barChartData} />
            </div>

            {/* 4. Section Chart 2 & 3: Stacked Bar Gender & Donut Profesi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle shadow-2xs space-y-3">
                <h2 className="text-sm font-extrabold text-text-high">Komposisi Gender per Pelkat</h2>
                <DemografiStackedChart data={barChartData} height={260} />
              </div>

              <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle shadow-2xs space-y-3">
                <h2 className="text-sm font-extrabold text-text-high">5 Profesi Dominan</h2>
                <DemografiDonutChart data={topProfesi} height={260} />
              </div>
            </div>

            {/* 5. 6 Pelkat Collapsible List Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-text-high">Rincian Data 6 Kategori Pelkat</h2>
                <span className="text-xs font-mono font-bold text-brand-primary">
                  {summary.kategoriCount} / 6 Terisi
                </span>
              </div>

              <div className="space-y-3">
                {KATEGORI_PELKAT.map((pelkat) => {
                  const record = demografiData.find((d: any) => d.kategori_pelkat === pelkat.kode);
                  return (
                    <KategoriPelkatCard
                      key={pelkat.kode}
                      pelkat={pelkat}
                      record={record}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onAddNew={handleAddNew}
                    />
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* 6. Empty State fallback */
          <EmptyState
            icon={Users}
            title="Belum Ada Data Demografi"
            description="Data demografi 6 kategori Pelkat belum diisi untuk Pos Pelkes ini."
            action={{
              label: 'Input Demografi Sekarang',
              onClick: () => handleAddNew(),
              variant: 'primary',
            }}
          />
        )}
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

      {/* Form Modal / Drawer */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-1 w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 border border-border-subtle shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 className="text-base font-bold text-text-high">
                {editingItem?.kategori_pelkat
                  ? `Edit Demografi ${editingItem.kategori_pelkat}`
                  : 'Input Demografi Pelkat Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-text-tertiary hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                ✕
              </button>
            </div>

            <DemografiForm
              id_pos={id_pos}
              initialData={editingItem}
              onSuccess={() => {
                setShowFormModal(false);
                router.push(`/demografi/${id_pos}`);
              }}
            />
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-1 w-full max-w-sm rounded-2xl p-5 border border-border-subtle shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-extrabold text-text-high">Export Laporan Demografi</h3>
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
                  exportExcel();
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
                  shareWhatsApp();
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

export default function DemografiPosPage({ params }: { params: Promise<{ id_pos: string }> }) {
  const resolvedParams = use(params);
  const id_pos = resolvedParams.id_pos;

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted animate-pulse">Memuat demografi...</div>}>
      <DemografiPosContent id_pos={id_pos} />
    </Suspense>
  );
}
