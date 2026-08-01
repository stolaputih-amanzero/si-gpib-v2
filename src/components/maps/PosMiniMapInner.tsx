'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface PosMiniMapProps {
  latitude: number;
  longitude: number;
  nama_pos?: string;
  alamat?: string | null;
  zoom?: number;
  className?: string;
  interactive?: boolean;
}

export function PosMiniMapInner({
  latitude,
  longitude,
  nama_pos = 'Pos Pelkes',
  alamat,
  zoom = 14,
  className,
  interactive = false,
}: PosMiniMapProps) {
  const center: [number, number] = [latitude, longitude];

  return (
    <div className={cn('relative w-full h-full z-0 overflow-hidden select-none', className)}>
      {/* Map Container */}
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
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={customIcon}>
          {nama_pos && (
            <Popup>
              <div className="p-1 max-w-[180px]">
                <h4 className="font-bold text-brand-primary text-xs mb-1">{nama_pos}</h4>
                {alamat && <p className="text-[10px] text-text-muted mb-2 line-clamp-2">{alamat}</p>}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-brand-primary text-white flex items-center justify-center text-[10px] py-1 rounded-lg hover:bg-brand-primary-dark transition-colors font-bold gap-1"
                >
                  <Navigation size={10} />
                  <span>Buka Google Maps</span>
                </a>
              </div>
            </Popup>
          )}
        </Marker>
      </MapContainer>

      {/* Ambient Pulsing Ring Overlay over Marker Center */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
        <div className="relative flex items-center justify-center">
          <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-8 w-8 rounded-full bg-brand-primary/40 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary border-2 border-white shadow-soft" />
        </div>
      </div>
    </div>
  );
}

export default PosMiniMapInner;
