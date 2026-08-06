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
              <div className="p-1 max-w-[200px] space-y-1">
                <div className="flex items-center gap-1 text-xs font-bold text-brand-primary">
                  <Church size={14} />
                  <span>{m.nama_induk}</span>
                </div>
                {m.alamat && <p className="text-[10px] text-text-muted line-clamp-2">{m.alamat}</p>}
                <div className="flex items-center gap-1 pt-1">
                  <Link
                    href={`/jemaat/${encodeURIComponent(m.id_induk)}`}
                    className="flex-1 bg-brand-primary text-white text-center text-[10px] py-1 rounded-md font-bold hover:bg-brand-primary-dark transition-colors"
                  >
                    Detail Jemaat
                  </Link>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 bg-surface-sunken hover:bg-surface-elevated text-brand-primary rounded-md border border-border-subtle"
                    title="Google Maps"
                  >
                    <Navigation size={12} />
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
