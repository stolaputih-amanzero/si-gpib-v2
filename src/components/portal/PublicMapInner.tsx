'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PublicPosPelkes } from '@/lib/domains/portal/portal.types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LocateFixed } from 'lucide-react';

// Fix Leaflet marker icon asset URLs in Next.js SSR
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface PublicMapInnerProps {
  locations: PublicPosPelkes[];
}

// Custom control to find user location
function GeolocationControl() {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const locateUser = () => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 14 });
    map.once('locationfound', (e) => {
      setLocating(false);
      L.marker(e.latlng).addTo(map)
        .bindPopup('Lokasi Anda saat ini').openPopup();
    });
    map.once('locationerror', () => {
      setLocating(false);
      alert('Tidak dapat menemukan lokasi Anda. Pastikan izin lokasi diberikan.');
    });
  };

  return (
    <div className="leaflet-top leaflet-right mt-20 mr-2 z-[1000] absolute">
      <button 
        onClick={locateUser}
        disabled={locating}
        title="Gunakan lokasi saya"
        className="bg-white p-2 rounded shadow-sm border border-gray-300 hover:bg-gray-50 flex items-center justify-center text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <LocateFixed className={`w-5 h-5 ${locating ? 'animate-pulse text-gray-400' : ''}`} />
      </button>
    </div>
  );
}

export default function PublicMapInner({ locations }: PublicMapInnerProps) {
  // Default to center of Indonesia
  const centerLat = -2.5489;
  const centerLng = 118.0149;
  const zoom = 5;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false} // We will use default but let's hide it for custom UI or move it
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Adds standard zoom control to bottom right */}
        <div className="leaflet-bottom leaflet-right mb-6 mr-2"></div>
        <GeolocationControl />

        <MarkerClusterGroup chunkedLoading>
          {locations.map((pos) => (
            <Marker key={pos.id_pos} position={[pos.latitude, pos.longitude]}>
              <Popup className="rounded-xl">
                <div className="p-1 min-w-[200px]">
                  <div className="text-xs font-semibold text-blue-600 mb-1">{pos.kategori || 'Pos Pelkes'}</div>
                  <h3 className="font-bold text-gray-900 leading-tight mb-2">{pos.nama_pos}</h3>
                  <div className="flex gap-2 mb-3">
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      <span className="font-bold text-gray-700">{pos.jumlah_kk}</span> KK
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      <span className="font-bold text-gray-700">{pos.jumlah_jiwa}</span> Jiwa
                    </div>
                  </div>
                  <Link href={`/peta-sebaran/${pos.id_pos}`}>
                    <Button size="sm" className="w-full h-8" type="button">
                      Lihat Detail
                    </Button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
