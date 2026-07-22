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
                      <div className="p-3 min-w-[250px] max-w-[320px] space-y-2.5 text-slate-900 dark:text-slate-100">
                        <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-200 dark:border-blue-800 inline-block">
                            {jemaat.id_induk} • Gereja Induk
                          </span>
                          <h3 className="font-extrabold text-base text-blue-900 dark:text-blue-300 leading-snug mt-1">
                            {jemaat.nama_induk}
                          </h3>
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Mupel: {jemaat.mupel_nama}</p>
                        </div>

                        {/* Statistik Grid */}
                        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Sektor</span>
                            <span className="font-black text-slate-900 dark:text-white text-sm">{jemaat.jumlah_sektor}</span>
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">KK</span>
                            <span className="font-black text-slate-900 dark:text-white text-sm">{jemaat.jumlah_kk}</span>
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Jiwa</span>
                            <span className="font-black text-slate-900 dark:text-white text-sm">{jemaat.jumlah_jiwa}</span>
                          </div>
                        </div>

                        {jemaat.kmj_nama && (
                          <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-100 dark:border-blue-900 text-xs">
                            <span className="text-[10px] text-blue-800 dark:text-blue-300 font-bold block">Ketua Majelis Jemaat (KMJ):</span>
                            <span className="font-bold text-blue-950 dark:text-blue-100">{jemaat.kmj_nama}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                          <Link
                            href={`/hierarki/${encodeURIComponent(jemaat.id_mupel)}/${encodeURIComponent(jemaat.id_induk)}`}
                            className="w-full min-h-[38px] bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                            style={{ color: '#ffffff !important' }}
                          >
                            <span style={{ color: '#ffffff' }}>Lihat Detail Jemaat</span>
                            <ExternalLink size={13} style={{ color: '#ffffff' }} />
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
                        <div className="p-3 min-w-[250px] max-w-[320px] space-y-2.5 text-slate-900 dark:text-slate-100">
                          {/* Header */}
                          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 inline-block">
                              {item.id_pos} • Pos Pelkes
                            </span>
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug mt-1">
                              {item.nama_pos}
                            </h3>
                            {item.mupel && (
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">Mupel: {item.mupel}</p>
                            )}
                          </div>

                          {/* Stat Badges */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl p-2 flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
                              <div>
                                <span className="block text-[9px] uppercase font-bold text-amber-800 dark:text-amber-300">Risiko</span>
                                <span className="text-xs font-black text-amber-950 dark:text-amber-100 tabular-nums">{item.jumlah_kerawanan} Risiko</span>
                              </div>
                            </div>

                            <div className="bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl p-2 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                              <div>
                                <span className="block text-[9px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Potensi</span>
                                <span className="text-xs font-black text-emerald-950 dark:text-emerald-100 tabular-nums">{item.jumlah_potensi} Potensi</span>
                              </div>
                            </div>
                          </div>

                          {/* Detail Previews */}
                          {item.kerawanan_list.length > 0 && (
                            <div>
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                                <ShieldAlert size={13} className="text-amber-600 dark:text-amber-400" />
                                Risiko Terdaftar:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {item.kerawanan_list.slice(0, 3).map((k) => (
                                  <span
                                    key={k.id_risiko}
                                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                      k.frekuensi === 'Kritis'
                                        ? 'bg-red-200 text-red-950 dark:bg-red-950 dark:text-red-200 border border-red-300 dark:border-red-800'
                                        : k.frekuensi === 'Tinggi'
                                        ? 'bg-orange-200 text-orange-950 dark:bg-orange-950 dark:text-orange-200 border border-orange-300 dark:border-orange-800'
                                        : 'bg-amber-200 text-amber-950 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                                    }`}
                                  >
                                    {k.jenis_risiko}
                                  </span>
                                ))}
                                {item.kerawanan_list.length > 3 && (
                                  <span className="text-[10px] text-slate-500 font-bold">+{item.kerawanan_list.length - 3} lainnya</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                            <Link
                              href={`/dashboard/pos-pelkes/${item.id_pos}`}
                              className="w-full min-h-[38px] bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
                              style={{ color: '#ffffff !important' }}
                            >
                              <span style={{ color: '#ffffff' }}>Lihat Detail Pos</span>
                              <ExternalLink size={13} style={{ color: '#ffffff' }} />
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
