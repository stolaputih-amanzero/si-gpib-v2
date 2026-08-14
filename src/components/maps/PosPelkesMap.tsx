'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { Navigation, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

interface PosPelkes {
  id_pos: string;
  nama_pos: string;
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface PosPelkesMapProps {
  posPelkesData: PosPelkes[];
}

export default function PosPelkesMap({ posPelkesData }: PosPelkesMapProps) {
  // Default center (Indonesia)
  const defaultCenter: [number, number] = [-0.789275, 113.921327];
  const defaultZoom = 5;

  const markers = posPelkesData.filter((pos) => pos.latitude && pos.longitude);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => {
      clearTimeout(timer);
      setIsMounted(false);
    };
  }, []);

  if (!isMounted) return <div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center">Memuat peta...</div>;

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((pos) => (
          <Marker 
            key={pos.id_pos} 
            position={[pos.latitude!, pos.longitude!]} 
            icon={customIcon}
          >
            <Popup>
              <div className="p-2.5 min-w-[220px] max-w-[280px] space-y-2 text-slate-900 dark:text-slate-100">
                <div className="border-b border-stone-200/70 dark:border-stone-800 pb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 inline-block mb-1">
                    Pos Pelkes
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                    {pos.nama_pos}
                  </h3>
                </div>

                {pos.alamat && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {pos.alamat}
                  </p>
                )}
                
                <div className="flex gap-2 pt-1">
                  <Link 
                    href={`/org/${encodeURIComponent(pos.id_pos)}`}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-center text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
                    style={{ color: '#ffffff' }}
                  >
                    <span>Detail Pos</span>
                    <ArrowRight className="size-3 text-white" />
                  </Link>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${pos.latitude},${pos.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700 transition-colors flex items-center justify-center"
                    title="Navigasi Google Maps"
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
