'use client';

import { useState } from 'react';
import { useDemografiList } from '@/hooks/use-demografi';
import { DemografiCard } from '@/components/demografi/DemografiCard';
import { DemografiChart } from '@/components/demografi/DemografiChart';
import { DemografiForm } from '@/components/demografi/DemografiForm';
import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';
import { Plus, Filter, Users, Search, X } from 'lucide-react';

export default function LaporanDemografiPage() {
  const [selectedPelkat, setSelectedPelkat] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFormModal, setShowFormModal] = useState<boolean>(false);

  const { data: demografiList, isLoading } = useDemografiList({
    kategori_pelkat: selectedPelkat || undefined,
  });

  const filteredList = demografiList?.filter((item: any) => {
    if (!searchQuery.trim()) return true;
    const posName = item.pos?.nama_pos || '';
    const jemaatName = item.pos?.jemaat_induk?.nama_induk || '';
    return (
      posName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jemaatName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  let totalJiwaOverall = 0;
  let totalLakiOverall = 0;
  let totalPerempuanOverall = 0;
  let totalKkOverall = 0;

  const chartDataMap: Record<string, { laki: number; perempuan: number }> = {};
  KATEGORI_PELKAT.forEach((k) => {
    chartDataMap[k.kode] = { laki: 0, perempuan: 0 };
  });

  demografiList?.forEach((item: any) => {
    const sum = (item.laki || 0) + (item.perempuan || 0);
    totalJiwaOverall += sum;
    totalLakiOverall += item.laki || 0;
    totalPerempuanOverall += item.perempuan || 0;
    totalKkOverall += item.jml_kk || 0;

    if (chartDataMap[item.kategori_pelkat]) {
      chartDataMap[item.kategori_pelkat].laki += item.laki || 0;
      chartDataMap[item.kategori_pelkat].perempuan += item.perempuan || 0;
    }
  });

  const chartData = Object.entries(chartDataMap).map(([kategori_pelkat, values]) => ({
    kategori_pelkat,
    laki: values.laki,
    perempuan: values.perempuan,
  }));

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">Demografi Pelkat</h1>
          <p className="text-xs md:text-sm text-text-muted mt-0.5">Pendataan Jemaat per Kategori Pelayanan GPIB</p>
        </div>
        <button
          type="button"
          onClick={() => setShowFormModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-dark transition-all flex items-center gap-2 shadow-soft min-h-[44px] shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Input Data Demografi</span>
          <span className="sm:hidden">Input</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-text-muted font-medium">Total Jiwa</p>
          <p className="text-2xl font-serif font-bold text-brand-primary tabular-nums mt-1">{totalJiwaOverall}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Di seluruh Pos Pelkes</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-text-muted font-medium">Total KK</p>
          <p className="text-2xl font-serif font-bold text-text-high tabular-nums mt-1">{totalKkOverall}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Kepala Keluarga</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Laki-Laki</p>
          <p className="text-2xl font-serif font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-1">{totalLakiOverall}</p>
          <p className="text-[11px] text-text-muted mt-0.5">{totalJiwaOverall > 0 ? `${((totalLakiOverall/totalJiwaOverall)*100).toFixed(1)}%` : '0%'}</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">Perempuan</p>
          <p className="text-2xl font-serif font-bold text-pink-600 dark:text-pink-400 tabular-nums mt-1">{totalPerempuanOverall}</p>
          <p className="text-[11px] text-text-muted mt-0.5">{totalJiwaOverall > 0 ? `${((totalPerempuanOverall/totalJiwaOverall)*100).toFixed(1)}%` : '0%'}</p>
        </div>
      </div>

      {/* Chart Overview */}
      <div className="bg-surface-elevated p-4 md:p-6 rounded-2xl border border-border-subtle shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-high">Distribusi Jiwa per Pelkat</h2>
          <span className="text-xs text-text-muted">6 Pelkat Standar GPIB</span>
        </div>
        <DemografiChart data={chartData} />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-high uppercase tracking-wider">
          <Filter size={14} />
          <span>Filter Data Demografi</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Cari nama Pos Pelkes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
            />
          </div>

          <select
            value={selectedPelkat}
            onChange={(e) => setSelectedPelkat(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
          >
            <option value="">Semua Kategori Pelkat</option>
            {KATEGORI_PELKAT.map((k) => (
              <option key={k.kode} value={k.kode}>
                {k.icon} {k.nama} ({k.kode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-high">Daftar Data Demografi</h2>
          <span className="text-xs text-text-muted">
            {filteredList ? `${filteredList.length} Catatan` : 'Memuat...'}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl p-4 animate-pulse space-y-3 border border-border-subtle">
                <div className="h-4 bg-surface-sunken rounded w-3/4"></div>
                <div className="h-3 bg-surface-sunken rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredList && filteredList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredList.map((item: any) => (
              <DemografiCard
                key={`${item.id_pos}-${item.kategori_pelkat}`}
                id_pos={item.id_pos}
                nama_pos={item.pos?.nama_pos || item.id_pos}
                jemaat_induk={item.pos?.jemaat_induk?.nama_induk}
                kategori_pelkat={item.kategori_pelkat}
                jml_kk={item.jml_kk || 0}
                laki={item.laki || 0}
                perempuan={item.perempuan || 0}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface-elevated rounded-2xl p-8 text-center border border-border-subtle space-y-2">
            <Users size={36} className="mx-auto text-text-muted opacity-50" />
            <p className="font-semibold text-text-high text-sm">Belum Ada Data Demografi</p>
            <p className="text-xs text-text-muted">
              {searchQuery || selectedPelkat 
                ? 'Tidak ada data demografi yang sesuai dengan filter.' 
                : 'Klik tombol "+ Input Data Demografi" di atas untuk mulai menambahkan data.'}
            </p>
          </div>
        )}
      </div>

      {/* Input Demografi Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                  <Users size={18} />
                  <span>Input Demografi Pelkat Baru</span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Pilih Wilayah Pos Pelkes & Kategori Pelkat GPIB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            <DemografiForm 
              onSuccess={() => setShowFormModal(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
