'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { PosLocation } from '@/lib/domains/analytics/analytics.types';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { ArrowRight, Navigation, Church } from 'lucide-react';

// Fix Leaflet marker icon asset URLs in Next.js SSR
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface AnalyticsMapContentProps {
  locations: PosLocation[];
}

export default function AnalyticsMapContent({ locations }: AnalyticsMapContentProps) {
  const centerLat = locations.length > 0 ? locations[0].latitude : -2.5489;
  const centerLng = locations.length > 0 ? locations[0].longitude : 118.0149;
  const zoom = locations.length > 0 ? 6 : 5;

  return (
    <div className="w-full h-[350px] md:h-[420px] rounded-2xl overflow-hidden z-0 border border-stone-200/80 dark:border-stone-800 shadow-xs">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((pos) => (
          <Marker key={pos.id_pos} position={[pos.latitude, pos.longitude]}>
            <Popup className="analytics-map-popup">
              <div className="p-2.5 min-w-[220px] max-w-[280px] space-y-2.5 text-slate-900 dark:text-slate-100">
                {/* Header & Badges */}
                <div className="space-y-1 pb-2 border-b border-stone-200/70 dark:border-stone-800">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Pos Pelkes
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 px-2 py-0.5 rounded-full">
                      Mupel {pos.nama_mupel}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug pt-0.5">
                    {pos.nama_pos}
                  </h3>
                </div>

                {/* Info Jemaat Induk */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <Church className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate">Jemaat Induk: <strong className="text-slate-900 dark:text-slate-100">{pos.nama_jemaat}</strong></span>
                </div>

                {/* Interactive Action Buttons (Clickable & Routing) */}
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/org/${encodeURIComponent(pos.id_pos)}`}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white dark:text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                    style={{ color: '#ffffff' }}
                  >
                    <span>Detail Unit</span>
                    <ArrowRight className="size-3.5 text-white" />
                  </Link>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${pos.latitude},${pos.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700 transition-colors flex items-center justify-center"
                    title="Buka Navigasi Google Maps"
                    aria-label="Navigasi"
                  >
                    <Navigation className="size-4 text-amber-600 dark:text-amber-400" />
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
