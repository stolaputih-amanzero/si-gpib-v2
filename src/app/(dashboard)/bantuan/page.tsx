'use client';

import { useState } from 'react';
import { usePengajuanList } from '@/hooks/use-bantuan';
import { BantuanCard } from '@/components/bantuan/BantuanCard';
import { Plus, Search, FileText } from 'lucide-react';
import Link from 'next/link';

export default function PengajuanBantuanOverviewPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedUrgensi, setSelectedUrgensi] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: pengajuanList, isLoading } = usePengajuanList({
    status: selectedStatus || undefined,
    urgensi: selectedUrgensi || undefined,
    search: searchQuery || undefined,
  });

  // KPI summary stats
  const totalCount = pengajuanList?.length || 0;
  const pendingCount = pengajuanList?.filter((p) => p.status.startsWith('Pending')).length || 0;
  const approvedCount = pengajuanList?.filter((p) => p.status === 'Approved').length || 0;
  const totalBiayaApproved = pengajuanList
    ?.filter((p) => p.status === 'Approved')
    .reduce((sum, p) => sum + (p.biaya || 0), 0) || 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full min-h-full bg-surface-base pb-32 md:pb-12">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">
              Pengajuan Bantuan & Workflow
            </h1>
            <p className="text-xs md:text-sm text-text-muted mt-0.5">
              Permohonan Bantuan Pos Pelkes & Approval Berjenjang
            </p>
          </div>

          <Link
            href="/bantuan/ajukan"
            className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Ajukan Bantuan Baru</span>
            <span className="sm:hidden">+ Ajukan</span>
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-5 space-y-6">
        {/* KPI Cards Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-text-muted font-medium">Total Pengajuan</p>
            <p className="text-2xl font-serif font-bold text-brand-primary tabular-nums mt-1">{totalCount}</p>
            <p className="text-[11px] text-text-muted mt-0.5">Seluruh Permohonan</p>
          </div>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Pending Review</p>
            <p className="text-2xl font-serif font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-1">{pendingCount}</p>
            <p className="text-[11px] text-text-muted mt-0.5">Menunggu Approval</p>
          </div>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Approved</p>
            <p className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">{approvedCount}</p>
            <p className="text-[11px] text-text-muted mt-0.5">Disetujui Sinode</p>
          </div>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-text-muted font-medium">Dana Disetujui</p>
            <p className="text-lg font-serif font-bold text-brand-primary tabular-nums mt-1 truncate">
              {formatCurrency(totalBiayaApproved)}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">Total Anggaran</p>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Cari pengajuan (jenis bantuan, pos pelkes)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-text-muted mb-1 block">Status Workflow</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">Semua Status</option>
                <option value="Pending_KMJ">Review KMJ</option>
                <option value="Pending_Mupel">Review Mupel</option>
                <option value="Pending_Sinode">Review Sinode</option>
                <option value="Approved">Disetujui</option>
                <option value="Rejected">Ditolak</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-text-muted mb-1 block">Tingkat Urgensi</label>
              <select
                value={selectedUrgensi}
                onChange={(e) => setSelectedUrgensi(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">Semua Urgensi</option>
                <option value="Rendah">Rendah</option>
                <option value="Sedang">Sedang</option>
                <option value="Tinggi">Tinggi</option>
                <option value="Kritis">Kritis</option>
              </select>
            </div>
          </div>
        </div>

        {/* Request Cards Grid / List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-high">
              Daftar Permohonan Bantuan ({pengajuanList?.length || 0})
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-surface-elevated p-4 rounded-xl border border-border-subtle animate-pulse space-y-3">
                  <div className="h-4 bg-surface-sunken rounded w-3/4"></div>
                  <div className="h-3 bg-surface-sunken rounded w-1/2"></div>
                  <div className="h-10 bg-surface-sunken rounded"></div>
                </div>
              ))}
            </div>
          ) : pengajuanList && pengajuanList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pengajuanList.map((item) => (
                <BantuanCard key={item.id_ajuan} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-elevated rounded-xl p-8 text-center border border-border-subtle space-y-3">
              <FileText size={36} className="mx-auto text-text-muted opacity-50" />
              <p className="font-semibold text-text-high text-sm">Belum Ada Pengajuan Bantuan</p>
              <p className="text-xs text-text-muted">
                {searchQuery || selectedStatus || selectedUrgensi
                  ? 'Tidak ada data pengajuan yang sesuai dengan kriteria filter.'
                  : 'Klik "+ Ajukan Bantuan Baru" di atas untuk membuat pengajuan pertama.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
