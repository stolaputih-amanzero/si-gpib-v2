'use client';

import Link from 'next/link';
import { ProjectionHeader } from '@/components/projections/ProjectionHeader';
import { Map, AlertTriangle, Lightbulb, MapPin, ArrowUpRight } from 'lucide-react';

const MOCK_TERRITORY_RISKS = [
  { id: 'TR-01', posId: '07-12-AS', wilayah: 'Pos Pelkes Lahai Roi (Kab. Sigi)', tingkat: 'Tinggi', jenis: 'Bencana Rawan Longsor & Akses Jalan', sda: 'Lahan Pertanian Jemaat (3 Ha)', sdm: '2 Relawan Pemuda' },
  { id: 'TR-02', posId: '07-12-AS', wilayah: 'Pos Pelkes Maranatha (Pos Remote)', tingkat: 'Sedang', jenis: 'Keterbatasan Sarana Air Bersih', sda: 'Sumber Mata Air Pegunungan', sdm: '1 Presbiter Pendamping' },
  { id: 'TR-03', posId: '07-12-AS', wilayah: 'Bajem Syalom (Kawasan Pesisir)', tingkat: 'Sedang', jenis: 'Resiko Abrasi Pantai & Gelombang', sda: 'Sentra Perikanan Tradisional', sdm: '3 Relawan Pelkat PKP' },
];

export default function TerritoryMapProjectionPage() {
  return (
    <div className="min-h-screen bg-surface-base pb-24">
      {/* P-4 Analytical Lens Header */}
      <ProjectionHeader
        title="Proyeksi Peta Spasial & Kerawanan Wilayah"
        subtitle="Analisis spasial kerawanan bencana, potensi SDA, dan kapasitas SDM pelayanan"
        badgeLabel="Peta Spasial"
        icon={<Map className="w-6 h-6 text-blue-400" />}
      />

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Map Visualization Canvas Placeholder */}
        <div className="p-6 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-high flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Canvas Visualisasi Sebaran Kerawanan (Spatial Layer)</span>
            </h2>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              3 Pos Terpetakan
            </span>
          </div>

          <div className="w-full h-48 rounded-xl bg-surface-sunken border border-border-subtle flex flex-col items-center justify-center p-4 text-center space-y-2">
            <Map className="w-8 h-8 text-blue-500/60" />
            <p className="text-xs text-text-muted max-w-md">
              Peta spasial interaktif GIS terhubung dengan data koordinat `t_pos_pelkes` & `t_kerawanan_wilayah`.
            </p>
          </div>
        </div>

        {/* Breakdown of Risk Points */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Matriks Detail Kerawanan &amp; Potensi Pelayanan</span>
          </h3>

          {MOCK_TERRITORY_RISKS.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-3 hover:border-blue-500/40 transition-all group"
            >
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="font-bold text-text-high text-sm group-hover:text-blue-500 transition-colors">{item.wilayah}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    item.tingkat === 'Tinggi' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    Resiko {item.tingkat}
                  </span>

                  {/* T-2: Point Click MUST deep-link to /org/[id_pos]#territory */}
                  <Link
                    href={`/org/${item.posId}#territory`}
                    className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1 min-h-[44px]"
                    aria-label={`Buka seksi wilayah untuk ${item.wilayah}`}
                  >
                    <span>Buka Seksi Wilayah (#territory)</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface-sunken border border-border-subtle space-y-1">
                  <span className="font-bold text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Kerawanan Dominan:
                  </span>
                  <p className="text-text-high font-medium">{item.jenis}</p>
                </div>

                <div className="p-3 rounded-xl bg-surface-sunken border border-border-subtle space-y-1">
                  <span className="font-bold text-emerald-500 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" /> Potensi SDA &amp; SDM:
                  </span>
                  <p className="text-text-high font-medium">{item.sda} • {item.sdm}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
