'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPosPelkesItem, MapJemaatItem } from '@/hooks/use-wilayah';
import { AlertTriangle, Sparkles, MapPin, ExternalLink, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

// Custom Marker Icons (Leaflet DivIcon)
const createJemaatMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-jemaat-divicon',
    html: `
      <div style="
        background-color: #1E40AF;
        color: #FFFFFF;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2"/>
          <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/>
          <path d="M18 22V5l-6-3-6 3v17"/>
          <path d="M12 7v5"/>
          <path d="M10 9h4"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const createPosMarkerIcon = (hasKerawananKritis: boolean, hasPotensi: boolean) => {
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

interface WilayahMapInnerProps {
  data: MapPosPelkesItem[];
  jemaatData?: MapJemaatItem[];
  selectedPosId?: string;
  onSelectPos?: (id_pos: string) => void;
}

export default function WilayahMapInner({ data, jemaatData = [], selectedPosId, onSelectPos }: WilayahMapInnerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[60vh] md:h-[70vh] rounded-2xl bg-surface-sunken animate-pulse flex flex-col items-center justify-center border border-border-subtle text-text-muted gap-2">
        <MapPin className="w-8 h-8 animate-bounce text-brand-primary" />
        <span className="text-sm font-medium">Memuat Peta Geospatial Terpadu (Unified Map)...</span>
      </div>
    );
  }

  const displayPosData = selectedPosId && selectedPosId !== 'all' 
    ? data.filter(item => item.id_pos === selectedPosId) 
    : data;

  // Default Map Center (Indonesia archipelago overview)
  const defaultCenter: [number, number] = displayPosData.length === 1 
    ? [displayPosData[0].latitude, displayPosData[0].longitude] 
    : jemaatData.length > 0
    ? [jemaatData[0].latitude, jemaatData[0].longitude]
    : [-0.789275, 113.921327];

  const defaultZoom = displayPosData.length === 1 ? 12 : 5;

  const jemaatIcon = createJemaatMarkerIcon();

  return (
    <div className="w-full h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden shadow-soft border border-border-subtle relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <LayersControl position="topright">
          {/* Base Tile Layers */}
          <LayersControl.BaseLayer checked name="OpenStreetMap Standard">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satelit (Esri World)">
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          {/* OVERLAY LAYER 1: JEMAAT INDUK (GEREJA INDUK) */}
          <LayersControl.Overlay checked name="🏛️ Jemaat Induk (Gereja)">
            <LayerGroup>
              <MarkerClusterGroup chunkedLoading maxClusterRadius={35}>
                {jemaatData.map((jemaat) => (
                  <Marker
                    key={`jemaat-${jemaat.id_induk}`}
                    position={[jemaat.latitude, jemaat.longitude]}
                    icon={jemaatIcon}
                  >
                    <Popup className="custom-jemaat-popup">
                      <div className="p-2.5 min-w-[240px] max-w-[300px] space-y-2">
                        <div className="border-b border-border-subtle pb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            {jemaat.id_induk} • Gereja Induk
                          </span>
                          <h3 className="font-extrabold text-base text-brand-primary leading-tight mt-1">
                            {jemaat.nama_induk}
                          </h3>
                          <p className="text-xs text-text-muted">Mupel: {jemaat.mupel_nama}</p>
                        </div>

                        {/* Statistik Grid */}
                        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                          <div className="bg-surface-sunken p-1.5 rounded-lg border border-border-subtle">
                            <span className="block text-[9px] font-bold text-text-muted uppercase">Sektor</span>
                            <span className="font-black text-text-high">{jemaat.jumlah_sektor}</span>
                          </div>
                          <div className="bg-surface-sunken p-1.5 rounded-lg border border-border-subtle">
                            <span className="block text-[9px] font-bold text-text-muted uppercase">KK</span>
                            <span className="font-black text-text-high">{jemaat.jumlah_kk}</span>
                          </div>
                          <div className="bg-surface-sunken p-1.5 rounded-lg border border-border-subtle">
                            <span className="block text-[9px] font-bold text-text-muted uppercase">Jiwa</span>
                            <span className="font-black text-text-high">{jemaat.jumlah_jiwa}</span>
                          </div>
                        </div>

                        {jemaat.kmj_nama && (
                          <p className="text-xs text-text-high font-semibold">
                            KMJ: <span className="font-bold text-brand-primary">{jemaat.kmj_nama}</span>
                          </p>
                        )}

                        <div className="pt-2 border-t border-border-subtle">
                          <Link
                            href={`/hierarki/${encodeURIComponent(jemaat.id_mupel)}/${encodeURIComponent(jemaat.id_induk)}`}
                            className="w-full min-h-[36px] bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-blue-800 transition-all shadow-sm"
                          >
                            <span>Lihat Detail Jemaat</span>
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            </LayerGroup>
          </LayersControl.Overlay>

          {/* OVERLAY LAYER 2: POS PELKES & BAJEM */}
          <LayersControl.Overlay checked name="📍 Pos Pelkes & Bajem">
            <LayerGroup>
              <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={45}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
              >
                {displayPosData.map((item) => {
                  const hasKritis = item.kerawanan_list.some((k) => k.frekuensi === 'Kritis' || k.frekuensi === 'Tinggi');
                  const hasPotensi = item.jumlah_potensi > 0;
                  const icon = createPosMarkerIcon(hasKritis, hasPotensi);

                  return (
                    <Marker
                      key={`pos-${item.id_pos}`}
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
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {item.id_pos}
                              </span>
                              <h3 className="font-bold text-sm text-text-high leading-snug mt-0.5">{item.nama_pos}</h3>
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
