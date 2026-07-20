'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPosPelkesItem } from '@/hooks/use-wilayah';
import { AlertTriangle, Sparkles, MapPin, ExternalLink, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

// Configure Leaflet custom marker icons to fix Next.js missing asset paths
const createMarkerIcon = (hasKerawananKritis: boolean, hasPotensi: boolean) => {
  let iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
  
  if (hasKerawananKritis) {
    iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
  } else if (hasPotensi) {
    iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
  }

  return L.icon({
    iconUrl,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

interface WilayahMapProps {
  data: MapPosPelkesItem[];
  selectedPosId?: string;
  onSelectPos?: (id_pos: string) => void;
}

export function WilayahMapComponent({ data, selectedPosId, onSelectPos }: WilayahMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[60vh] md:h-[70vh] rounded-2xl bg-surface-sunken animate-pulse flex flex-col items-center justify-center border border-border-subtle text-text-muted gap-2">
        <MapPin className="w-8 h-8 animate-bounce text-brand-primary" />
        <span className="text-sm font-medium">Memuat Peta Geospatial Wilayah...</span>
      </div>
    );
  }

  const displayData = selectedPosId && selectedPosId !== 'all' 
    ? data.filter(item => item.id_pos === selectedPosId) 
    : data;

  // Default Map Center (Indonesia archipelago overview)
  const defaultCenter: [number, number] = displayData.length === 1 
    ? [displayData[0].latitude, displayData[0].longitude] 
    : [-0.789275, 113.921327];
  const defaultZoom = displayData.length === 1 ? 12 : 5;

  return (
    <div className="w-full h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden shadow-soft border border-border-subtle relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <LayersControl position="topright">
          {/* Base Tile Layer */}
          <LayersControl.BaseLayer checked name="OpenStreetMap Standard">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satelit (Esri World Imagery)">
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          {/* Marker Cluster Group */}
          <LayersControl.Overlay checked name="Pos Pelkes & Potensi/Kerawanan">
            <LayerGroup>
              <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={45}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
              >
                {displayData.map((item) => {
                  const hasKritis = item.kerawanan_list.some((k) => k.frekuensi === 'Kritis' || k.frekuensi === 'Tinggi');
                  const hasPotensi = item.jumlah_potensi > 0;
                  const icon = createMarkerIcon(hasKritis, hasPotensi);

                  return (
                    <Marker
                      key={item.id_pos}
                      position={[item.latitude, item.longitude]}
                      icon={icon}
                      eventHandlers={{
                        click: () => {
                          if (onSelectPos) onSelectPos(item.id_pos);
                        },
                      }}
                    >
                      <Popup className="custom-wilayah-popup">
                        <div className="p-2 min-w-[240px] max-w-[300px]">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2 border-b border-border-subtle pb-2 mb-2">
                            <div>
                              <h3 className="font-bold text-sm text-text-high leading-snug">{item.nama_pos}</h3>
                              {item.mupel && (
                                <span className="text-[11px] font-medium text-text-muted">Mupel: {item.mupel}</span>
                              )}
                            </div>
                          </div>

                          {/* Stat Badges */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-lg p-1.5 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <div>
                                <span className="block text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Kerawanan</span>
                                <span className="text-xs font-extrabold text-amber-900 dark:text-amber-200 tabular-nums">{item.jumlah_kerawanan} Risiko</span>
                              </div>
                            </div>

                            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-lg p-1.5 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div>
                                <span className="block text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Potensi</span>
                                <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 tabular-nums">{item.jumlah_potensi} Potensi</span>
                              </div>
                            </div>
                          </div>

                          {/* Detail Previews */}
                          {item.kerawanan_list.length > 0 && (
                            <div className="mb-2">
                              <span className="text-[11px] font-bold text-text-muted flex items-center gap-1 mb-1">
                                <ShieldAlert size={12} className="text-amber-500" />
                                Risiko Terdaftar:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {item.kerawanan_list.slice(0, 3).map((k) => (
                                  <span
                                    key={k.id_risiko}
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                      k.frekuensi === 'Kritis'
                                        ? 'bg-red-100 text-red-800 border border-red-200'
                                        : k.frekuensi === 'Tinggi'
                                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                    }`}
                                  >
                                    {k.jenis_risiko}
                                  </span>
                                ))}
                                {item.kerawanan_list.length > 3 && (
                                  <span className="text-[10px] text-text-muted">+{item.kerawanan_list.length - 3} lainnya</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="pt-2 border-t border-border-subtle mt-2">
                            <Link
                              href={`/dashboard/pos-pelkes/${item.id_pos}`}
                              className="w-full min-h-[36px] bg-brand-primary text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm"
                            >
                              <span>Lihat Detail Pos</span>
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}

// Export default with dynamic ssr: false wrapper helper for Next.js safe rendering
import dynamic from 'next/dynamic';

export const WilayahMap = dynamic(
  () => Promise.resolve(WilayahMapComponent),
  { ssr: false }
);

export default WilayahMap;
