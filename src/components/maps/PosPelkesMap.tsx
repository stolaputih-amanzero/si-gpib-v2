'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
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
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-brand-primary text-sm mb-1">{pos.nama_pos}</h3>
                <p className="text-xs text-text-muted mb-3 line-clamp-2">{pos.alamat}</p>
                
                <div className="flex gap-2">
                  <Link 
                    href={`/dashboard/pos-pelkes/${pos.id_pos}`}
                    className="flex-1 bg-brand-primary text-white text-center text-xs py-1.5 rounded hover:bg-blue-800 transition-colors"
                  >
                    Detail
                  </Link>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${pos.latitude},${pos.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 text-white flex items-center justify-center text-xs py-1.5 rounded hover:bg-green-700 transition-colors"
                  >
                    <Navigation size={12} className="mr-1" />
                    Navigasi
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
