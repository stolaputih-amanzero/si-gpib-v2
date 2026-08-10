'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PublicMapPoint } from '@/lib/services/public-portal';

// Fix for default Leaflet icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

const getCustomIcon = (kategori: string) => {
  let color = '#3b82f6'; // blue default
  if (kategori.toLowerCase() === 'bajem') color = '#f59e0b'; // amber
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: svg,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const createCustomClusterIcon = (cluster: any) => {
  return L.divIcon({
    html: `<div class="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold shadow-lg border-2 border-white">${cluster.getChildCount()}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(40, 40, true),
  });
};

export default function PublicMapClientInner({ initialData }: { initialData: PublicMapPoint[] }) {
  const center: [number, number] = [-2.5489, 118.0149]; // Center of Indonesia
  const zoom = 5;

  const validPoints = initialData.filter(p => p.latitude !== null && p.longitude !== null);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full rounded-2xl border border-border-subtle"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createCustomClusterIcon}
          maxClusterRadius={50}
        >
          {validPoints.map((point) => (
            <Marker
              key={point.id_pos}
              position={[point.latitude!, point.longitude!]}
              icon={getCustomIcon(point.kategori)}
            >
              <Popup className="public-map-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="text-[10px] font-bold tracking-wider text-brand-primary uppercase mb-1">{point.kategori}</div>
                  <h3 className="font-bold text-text-strong text-sm leading-tight mb-2">{point.nama_pos}</h3>
                  <div className="text-xs text-text-subtle mb-2 pb-2 border-b border-border-subtle">
                    Jemaat Induk: <span className="font-medium text-text-base">{point.nama_induk}</span>
                  </div>
                  <p className="text-xs text-text-base leading-relaxed line-clamp-3">
                    {point.alamat}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
