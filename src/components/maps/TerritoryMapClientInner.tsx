'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import { TerritoryPoint } from '@/lib/services/territory';
import { MarkerBottomSheet } from './MarkerBottomSheet';

// Fix Leaflet icons
const posIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Custom HTML Icons for Risk and Potential
const riskIcon = L.divIcon({
  html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const potentialIcon = L.divIcon({
  html: `<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export interface TerritoryMapClientProps {
  points: TerritoryPoint[];
  centroid?: { lat: number; lng: number };
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => { clearTimeout(timer); setIsMounted(false); };
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-bg-surface animate-pulse rounded-2xl">
        <p className="text-sm font-medium text-text-muted">Memuat Peta Teritori...</p>
      </div>
    );
  }

  // Calculate dynamic center if no centroid provided
  const center: [number, number] = centroid 
    ? [centroid.lat, centroid.lng] 
    : points.length > 0 
      ? [points[0].lat, points[0].lng] 
      : [-6.2088, 106.8456]; // Default to Jakarta

  const filteredPoints = points.filter(p => {
    if (p.type === 'POS' && !activeLayers.pos) return false;
    if (p.type === 'RISK' && !activeLayers.risk) return false;
    if (p.type === 'POTENTIAL' && !activeLayers.potential) return false;
    return true;
  });

  return (
    <div className="relative w-full h-[calc(100vh-200px)] min-h-[500px] rounded-2xl overflow-hidden shadow-lg border border-border-subtle bg-bg-base z-0">
      
      {/* Floating Layer Toggle */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-bg-surface/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-border-subtle flex gap-1">
        <button
          onClick={() => setActiveLayers(prev => ({ ...prev, pos: !prev.pos }))}
          className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
            activeLayers.pos ? 'bg-brand-primary text-white shadow-md' : 'text-text-subtle hover:bg-bg-subtle'
          }`}
        >
          Organisasi
        </button>
        <button
          onClick={() => setActiveLayers(prev => ({ ...prev, risk: !prev.risk }))}
          className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
            activeLayers.risk ? 'bg-state-error text-white shadow-md' : 'text-text-subtle hover:bg-bg-subtle'
          }`}
        >
          Kerawanan
        </button>
        <button
          onClick={() => setActiveLayers(prev => ({ ...prev, potential: !prev.potential }))}
          className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
            activeLayers.potential ? 'bg-state-success text-white shadow-md' : 'text-text-subtle hover:bg-bg-subtle'
          }`}
        >
          Potensi
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={center} />
        
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
        >
          {filteredPoints.map((point) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={point.type === 'POS' ? posIcon : point.type === 'RISK' ? riskIcon : potentialIcon}
              eventHandlers={{
                click: () => {
                  setSelectedPoint(point);
                }
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
  );
}
