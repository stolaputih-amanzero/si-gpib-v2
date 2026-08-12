'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import { TerritoryPoint } from '@/lib/services/territory';
import { MarkerBottomSheet } from './MarkerBottomSheet';
import { Building, ShieldAlert, Sparkles, MapPin, ChevronRight } from 'lucide-react';

// Custom Inline SVG Icons for Leaflet Markers (100% Reliable without network dependencies)
const posIcon = L.divIcon({
  html: `<div style="background-color: #3b82f6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const riskIcon = L.divIcon({
  html: `<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const potentialIcon = L.divIcon({
  html: `<div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg></div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

export interface TerritoryMapClientProps {
  points: TerritoryPoint[];
  centroid?: { lat: number; lng: number };
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [center, map]);
  return null;
}

export function TerritoryMapClientInner({ points, centroid }: TerritoryMapClientProps) {
  const [activeLayers, setActiveLayers] = useState({
    pos: true,
    risk: true,
    potential: true,
  });
  const [selectedPoint, setSelectedPoint] = useState<TerritoryPoint | null>(null);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(() => {
    return centroid 
      ? [centroid.lat, centroid.lng] 
      : points.length > 0 
        ? [points[0].lat, points[0].lng] 
        : [-0.8917, 119.8707];
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => { clearTimeout(timer); setIsMounted(false); };
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-surface-elevated animate-pulse rounded-2xl border border-border-subtle">
        <p className="text-sm font-medium text-text-muted">Memuat Peta Teritori Spasial...</p>
      </div>
    );
  }

  const posCount = points.filter(p => p.type === 'POS').length;
  const riskCount = points.filter(p => p.type === 'RISK').length;
  const potentialCount = points.filter(p => p.type === 'POTENTIAL').length;

  const filteredPoints = points.filter(p => {
    if (p.type === 'POS' && !activeLayers.pos) return false;
    if (p.type === 'RISK' && !activeLayers.risk) return false;
    if (p.type === 'POTENTIAL' && !activeLayers.potential) return false;
    return true;
  });

  const handlePointSelect = (pt: TerritoryPoint) => {
    setSelectedPoint(pt);
    setCurrentCenter([pt.lat, pt.lng]);
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-1">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-500" />
            Pos / Jemaat
          </div>
          <p className="text-2xl font-bold text-text-high font-sans tabular-nums">{posCount} Titik</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-1">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            Kerawanan
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-sans tabular-nums">{riskCount} Catatan</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-1">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Potensi
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-sans tabular-nums">{potentialCount} Area</p>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[460px] sm:h-[540px] rounded-2xl overflow-hidden shadow-lg border border-border-subtle bg-surface-base z-0">
        
        {/* Floating Layer Toggles */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-surface-elevated/95 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-border-subtle flex gap-1">
          <button
            onClick={() => setActiveLayers(prev => ({ ...prev, pos: !prev.pos }))}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
              activeLayers.pos ? 'bg-brand-primary text-white shadow-md' : 'text-text-muted hover:bg-surface-sunken'
            }`}
          >
            Organisasi ({posCount})
          </button>
          <button
            onClick={() => setActiveLayers(prev => ({ ...prev, risk: !prev.risk }))}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
              activeLayers.risk ? 'bg-rose-600 text-white shadow-md' : 'text-text-muted hover:bg-surface-sunken'
            }`}
          >
            Kerawanan ({riskCount})
          </button>
          <button
            onClick={() => setActiveLayers(prev => ({ ...prev, potential: !prev.potential }))}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
              activeLayers.potential ? 'bg-emerald-600 text-white shadow-md' : 'text-text-muted hover:bg-surface-sunken'
            }`}
          >
            Potensi ({potentialCount})
          </button>
        </div>

        <MapContainer
          center={currentCenter}
          zoom={6}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={currentCenter} />
          
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={40}
          >
            {filteredPoints.map((point) => (
              <Marker
                key={point.id}
                position={[point.lat, point.lng]}
                icon={point.type === 'POS' ? posIcon : point.type === 'RISK' ? riskIcon : potentialIcon}
                eventHandlers={{
                  click: () => handlePointSelect(point)
                }}
              />
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {/* Bottom Sheet */}
        <MarkerBottomSheet 
          point={selectedPoint} 
          onClose={() => setSelectedPoint(null)} 
        />
      </div>

      {/* Directory List of Territory Locations Below Map */}
      <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-high flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-primary" />
            <span>Daftar Titik Spasial Teritori ({filteredPoints.length})</span>
          </h2>
          <span className="text-xs text-text-muted">Klik item untuk memfokuskan peta</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredPoints.map((pt) => {
            const isPos = pt.type === 'POS';
            const isRisk = pt.type === 'RISK';
            return (
              <div
                key={pt.id}
                onClick={() => handlePointSelect(pt)}
                className={`p-4 rounded-xl bg-surface-sunken border border-border-subtle cursor-pointer hover:border-brand-primary/50 transition-all flex items-center justify-between gap-3 ${
                  selectedPoint?.id === pt.id ? 'ring-2 ring-brand-primary border-transparent' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isPos ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                    isRisk ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {isPos && <Building size={18} />}
                    {isRisk && <ShieldAlert size={18} />}
                    {!isPos && !isRisk && <Sparkles size={18} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-high text-xs sm:text-sm line-clamp-1">{pt.title}</h3>
                    <p className="text-[11px] text-text-muted mt-0.5 font-sans tabular-nums">
                      {pt.category} • {pt.lat.toFixed(4)}, {pt.lng.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isPos ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                    isRisk ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {isPos ? 'Organisasi' : isRisk ? 'Kerawanan' : 'Potensi'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
