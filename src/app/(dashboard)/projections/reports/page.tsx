'use client';

import { ProjectionHeader } from '@/components/projections/ProjectionHeader';
import { BarChart3, Users, HeartHandshake, Building2, TrendingUp, Download } from 'lucide-react';

export default function ReportsProjectionPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] pb-24">
      {/* U-1 Lens Boundary Header */}
      <ProjectionHeader
        title="Laporan & Analitik Pelayanan"
        subtitle="Proyeksi agregasi data demografi, bantuan, dan aset pelayanan GPIB"
        badgeLabel="Proyeksi Laporan"
        icon={<BarChart3 className="w-6 h-6 text-purple-400" />}
      />

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Export / Context Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-400 block">Konteks Laporan:</span>
            <span className="text-sm font-bold text-slate-100">Sinode / Mupel / Jemaat Induk</span>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Ekspor Rekapitulasi (PDF/XLSX)</span>
          </button>
        </div>

        {/* Aggregated Metric Cards (U-4: tabular-nums) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demografi SDM</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 font-sans tabular-nums">1.482</div>
            <p className="text-[11px] text-slate-400">Total pendeta, pelayan, dan relawan terdaftar</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ajuan Bantuan YTD</span>
              <HeartHandshake className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 font-sans tabular-nums">Rp 185.000.000</div>
            <p className="text-[11px] text-slate-400">12 ajuan disetujui dalam lingkup pelayanan</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aset Terdaftar</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 font-sans tabular-nums">48 Unit</div>
            <p className="text-[11px] text-slate-400">Bangunan, tanah, dan kendaraan operasional</p>
          </div>
        </div>

        {/* Detailed Report Sections */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-border-subtle space-y-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Grafik Agregasi Tren Pelayanan 2026</span>
          </h2>

          <div className="w-full h-40 rounded-xl bg-slate-950 border border-border-subtle flex flex-col items-center justify-center p-4 text-center space-y-1">
            <BarChart3 className="w-8 h-8 text-purple-400/60" />
            <p className="text-xs text-slate-400">Visualisasi agregasi tren demografi dan alokasi bantuan pelayanan.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
