'use client';

import React from 'react';
import { GeoJSONFeatureCollection } from '@/types/geospatial.types';
import { Map, Layers, Compass } from 'lucide-react';

interface TerritoryMapPanelProps {
  featureCollection: GeoJSONFeatureCollection;
  selectedFeatureId: string | null;
  onSelectFeature: (idSpatial: string) => void;
}

export const TerritoryMapPanel: React.FC<TerritoryMapPanelProps> = ({
  featureCollection,
  selectedFeatureId,
  onSelectFeature
}) => {
  const features = featureCollection?.features || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Visualisasi Spasial Peta Wilayah</h2>
        </div>

        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
          <Layers className="w-3 h-3 text-blue-500" />
          {features.length} Layer Geometri
        </span>
      </div>

      {/* SVG Canvas Map Container */}
      <div className="relative w-full h-[360px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

        {/* SVG Interactive Geometry Renderer */}
        <svg className="w-full h-full relative z-10" viewBox="0 0 500 300">
          {features.map((feat, idx) => {
            const isSelected = feat.id === selectedFeatureId;
            const geom = feat.geometry;

            if (geom.type === 'Polygon') {
              // Map GeoJSON ring coordinates to SVG polygon points
              const ring = geom.coordinates[0] || [];
              const svgPoints = ring.map(([lon, lat]) => {
                // Simple Projection Scale for demonstration
                const x = ((lon - 106.80) / 0.06) * 400 + 50;
                const y = 250 - ((lat - (-6.21)) / 0.05) * 200;
                return `${x},${y}`;
              }).join(' ');

              const fillColor = feat.properties.semantic_category === 'RISK_ZONE' 
                ? 'rgba(244, 63, 94, 0.35)' 
                : feat.properties.semantic_category === 'RESOURCE_ZONE'
                ? 'rgba(16, 185, 129, 0.35)'
                : 'rgba(59, 130, 246, 0.35)';

              const strokeColor = feat.properties.semantic_category === 'RISK_ZONE' 
                ? '#f43f5e' 
                : feat.properties.semantic_category === 'RESOURCE_ZONE'
                ? '#10b981'
                : '#3b82f6';

              return (
                <g key={feat.id || idx} onClick={() => onSelectFeature(feat.id)}>
                  <polygon
                    points={svgPoints}
                    fill={fillColor}
                    stroke={isSelected ? '#f59e0b' : strokeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all cursor-pointer hover:opacity-80"
                  />
                  <text
                    x={150 + idx * 80}
                    y={120 + idx * 30}
                    fill="#e2e8f0"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {feat.properties.nama_wilayah}
                  </text>
                </g>
              );
            }

            if (geom.type === 'Point') {
              const [lon, lat] = geom.coordinates;
              const cx = ((lon - 106.80) / 0.06) * 400 + 50;
              const cy = 250 - ((lat - (-6.21)) / 0.05) * 200;

              return (
                <g key={feat.id || idx} onClick={() => onSelectFeature(feat.id)} className="cursor-pointer">
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 10 : 7}
                    fill="#a855f7"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text x={cx + 12} y={cy + 4} fill="#c084fc" fontSize="10" fontWeight="bold">
                    {feat.properties.nama_wilayah}
                  </text>
                </g>
              );
            }

            return null;
          })}
        </svg>

        {/* Map Watermark & CRS Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-400 flex items-center gap-2 z-20">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>WGS 84 (EPSG:4326) Vector Overlay</span>
        </div>
      </div>
    </div>
  );
};
