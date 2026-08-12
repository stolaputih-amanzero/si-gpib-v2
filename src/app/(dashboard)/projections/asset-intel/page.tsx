'use client';

import Link from 'next/link';
import { ProjectionHeader } from '@/components/projections/ProjectionHeader';
import { Building2, FileCheck, AlertCircle, TrendingUp, ArrowUpRight } from 'lucide-react';

const MOCK_ASSET_SUMMARY = [
  { unit: 'GPIB Jemaat Immanuel (Induk)', tanah: 4, bangunan: 3, sertifikatAktif: 6, sengketa: 0 },
  { unit: 'Mupel Sulteng (Sektor Sulteng)', tanah: 2, bangunan: 1, sertifikatAktif: 2, sengketa: 1 },
  { unit: 'Pos Pelkes Lahai Roi', tanah: 1, bangunan: 1, sertifikatAktif: 1, sengketa: 0 },
];

export default function AssetIntelProjectionPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] pb-24">
      {/* P-4 Analytical Lens Header */}
      <ProjectionHeader
        title="Proyeksi Intelijen Aset Lintas Organisasi"
        subtitle="Agregasi inventarisasi tanah, bangunan, status legalitas sertifikat & pemetaan resiko sengketa"
        badgeLabel="Agregasi Aset"
        icon={<Building2 className="w-6 h-6 text-purple-400" />}
      />

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Top Aggregate KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-purple-400" />
              Total Persil Tanah & Bangunan
            </div>
            <p className="text-2xl font-bold text-slate-100 font-sans tabular-nums">12 Persil</p>
            <p className="text-[11px] text-slate-400">Terdaftar di database sinodal</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Sertifikat SHM / HGB Valid
            </div>
            <p className="text-2xl font-bold text-emerald-400 font-sans tabular-nums">9 SHM</p>
            <p className="text-[11px] text-emerald-400/80">75% Aset bersertifikat resmi</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Perlu Perhatian / Sengketa
            </div>
            <p className="text-2xl font-bold text-amber-400 font-sans tabular-nums">1 Kasus</p>
            <p className="text-[11px] text-amber-400/80">Klaim batas tanah adat</p>
          </div>
        </div>

        {/* Aggregated List by Unit */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Agregasi Kepemilikan per Unit Organisasi</span>
          </h2>

          <div className="space-y-3">
            {MOCK_ASSET_SUMMARY.map((unit, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-950 border border-border-subtle space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{unit.unit}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-sans tabular-nums">
                    <span>Tanah: {unit.tanah}</span>
                    <span>• Bangunan: {unit.bangunan}</span>
                    <span>• Sertifikat: {unit.sertifikatAktif}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {unit.sengketa > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {unit.sengketa} Sengketa
                    </span>
                  )}
                  <Link
                    href={`/assets`}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-border-subtle text-xs font-bold flex items-center gap-1"
                  >
                    <span>Detail Aset</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
