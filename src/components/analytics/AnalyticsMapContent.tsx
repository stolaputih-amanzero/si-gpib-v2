'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { PosLocation } from '@/lib/domains/analytics/analytics.types';
import 'leaflet/dist/leaflet.css';

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
    <div className="w-full h-[350px] md:h-[400px] rounded-xl overflow-hidden z-0">
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
            <Popup>
              <div className="p-1">
                <p className="font-bold text-sm text-gray-900">{pos.nama_pos}</p>
                <p className="text-xs text-gray-600">{pos.nama_jemaat}</p>
                <p className="text-xs font-semibold text-blue-600">Mupel {pos.nama_mupel}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
