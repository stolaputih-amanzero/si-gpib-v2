'use client';

import React, { useState } from 'react';
import { SpatialFeatureItemViewModel } from '@/types/geospatialViewModel.types';
import { Maximize2, Compass, Filter } from 'lucide-react';

interface SpatialFeatureListPanelProps {
  features: SpatialFeatureItemViewModel[];
  selectedFeatureId: string | null;
  onSelectFeature: (idSpatial: string) => void;
}

export const SpatialFeatureListPanel: React.FC<SpatialFeatureListPanelProps> = ({
  features,
  selectedFeatureId,
  onSelectFeature
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const filteredFeatures = features.filter(f => {
    if (activeFilter === 'ALL') return true;
    return f.semantic_category === activeFilter;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Daftar Fitur Spasial Terdaftar</h2>
          <p className="text-xs text-slate-500">Rincian teks legible tanpa tergantung rendering SDK map</p>
        </div>

        {/* Semantic Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${activeFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Semua ({features.length})
          </button>
          <button
            onClick={() => setActiveFilter('TERRITORY_BOUNDARY')}
            className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${activeFilter === 'TERRITORY_BOUNDARY' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Batas Wilayah
          </button>
          <button
            onClick={() => setActiveFilter('RISK_ZONE')}
            className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${activeFilter === 'RISK_ZONE' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Zona Rawan
          </button>
          <button
            onClick={() => setActiveFilter('POINT_LOCATION')}
            className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${activeFilter === 'POINT_LOCATION' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Titik Lokasi
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {filteredFeatures.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Tidak ada fitur geospasial yang cocok dengan filter.
          </div>
        ) : (
          filteredFeatures.map((feat) => {
            const isSelected = feat.id_spatial === selectedFeatureId;

            return (
              <div
                key={feat.id_spatial}
                onClick={() => onSelectFeature(feat.id_spatial)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{feat.nama_wilayah}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{feat.keterangan}</p>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${feat.semanticBadgeColor}`}>
                    {feat.semanticCategoryLabel}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-slate-400" />
                    <span>{feat.coordinatesSummary}</span>
                  </div>

                  {feat.areaFormatted !== '-' && (
                    <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Luas: {feat.areaFormatted}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
