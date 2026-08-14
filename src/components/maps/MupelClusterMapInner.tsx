'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Church } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const churchIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface MupelClusterMapProps {
  centroid: { lat: number; lng: number };
  markers: Array<{
    id_induk: string;
    nama_induk: string;
    lat: number;
    lng: number;
    alamat?: string | null;
  }>;
  zoom?: number;
  className?: string;
  interactive?: boolean;
}

export function MupelClusterMapInner({
  centroid,
  markers = [],
  zoom = 9,
  className,
  interactive = false,
}: MupelClusterMapProps) {
  const center: [number, number] = [centroid.lat, centroid.lng];

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => { clearTimeout(timer); setIsMounted(false); };
  }, []);

  if (!isMounted) return <div className={cn("w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center", className)}>Memuat peta...</div>;

  return (
    <div className={cn('relative w-full h-full z-0 overflow-hidden select-none', className)}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        attributionControl={false}
        className="w-full h-full z-0 filter brightness-[0.92] dark:brightness-[0.75] dark:contrast-[1.1]"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map((m) => (
          <Marker key={m.id_induk} position={[m.lat, m.lng]} icon={churchIcon}>
            <Popup>
              <div className="p-2.5 min-w-[220px] max-w-[280px] space-y-2 text-slate-900 dark:text-slate-100">
                <div className="border-b border-stone-200/70 dark:border-stone-800 pb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                    <Church size={14} />
                    <span>{m.nama_induk}</span>
                  </div>
                </div>
                {m.alamat && <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{m.alamat}</p>}
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/org/${encodeURIComponent(m.id_induk)}`}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-center text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                    style={{ color: '#ffffff' }}
                  >
                    Detail Jemaat
                  </Link>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl border border-stone-300 dark:border-stone-700 transition-colors flex items-center justify-center"
                    title="Buka Navigasi Google Maps"
                  >
                    <Navigation size={14} className="text-amber-600 dark:text-amber-400" />
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

export default MupelClusterMapInner;
