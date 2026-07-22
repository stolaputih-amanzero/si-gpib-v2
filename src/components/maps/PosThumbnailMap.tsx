'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

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

interface PosThumbnailMapProps {
  latitude: number;
  longitude: number;
  nama_pos: string;
  alamat: string | null;
}

export default function PosThumbnailMap({ latitude, longitude, nama_pos, alamat }: PosThumbnailMapProps) {
  const center: [number, number] = [latitude, longitude];
  const zoom = 14;

  return (
    <div className="h-full w-full relative z-0 rounded-xl overflow-hidden border border-border-subtle">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={customIcon}>
          <Popup>
            <div className="p-1 max-w-[180px]">
              <h4 className="font-bold text-brand-primary text-xs mb-1">{nama_pos}</h4>
              <p className="text-[10px] text-text-muted mb-2 line-clamp-2">{alamat || '-'}</p>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 text-white flex items-center justify-center text-[10px] py-1 rounded hover:bg-emerald-700 transition-colors font-bold"
              >
                <Navigation size={10} className="mr-1" />
                Navigasi Map
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
