'use client';

import React from 'react';
import { Map, AlertTriangle, TrendingUp, MapPin, Maximize2 } from 'lucide-react';
import { GeospatialWorkspaceViewModel } from '@/types/geospatialViewModel.types';

interface TerritorySummaryCardProps {
  vm: GeospatialWorkspaceViewModel;
}

export const TerritorySummaryCard: React.FC<TerritorySummaryCardProps> = ({ vm }) => {
  const { summaryMetrics } = vm;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
          <span className="text-[11px] font-medium">Batas Wilayah</span>
          <Map className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{summaryMetrics.boundaryPolygonsCount}</div>
        <div className="text-[10px] text-slate-500">Poligon Sektor/Mupel</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
          <span className="text-[11px] font-medium">Zona Rawan</span>
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{summaryMetrics.riskZonesCount}</div>
        <div className="text-[10px] text-slate-500">Bencana / Kerawanan</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <span className="text-[11px] font-medium">Zona Potensi</span>
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{summaryMetrics.resourceZonesCount}</div>
        <div className="text-[10px] text-slate-500">Penjangkauan Baru</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
          <span className="text-[11px] font-medium">Titik Lokasi Pos</span>
          <MapPin className="w-4 h-4" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{summaryMetrics.pointLocationsCount}</div>
        <div className="text-[10px] text-slate-500">Gedung Pos / Aset</div>
      </div>

      <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
          <span className="text-[11px] font-medium">Total Luas Area</span>
          <Maximize2 className="w-4 h-4" />
        </div>
        <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{summaryMetrics.totalCoveredAreaFormatted}</div>
        <div className="text-[10px] text-slate-500">Cakupan Geofence</div>
      </div>
    </div>
  );
};
