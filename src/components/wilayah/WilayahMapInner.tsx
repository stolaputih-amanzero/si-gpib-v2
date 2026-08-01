'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPosPelkesItem, MapJemaatItem } from '@/hooks/use-wilayah';
import { AlertTriangle, Sparkles, MapPin, ExternalLink, ShieldAlert } from 'lucide-react';
import { PosName } from '@/components/ui/PosName';
import Link from 'next/link';

// Custom Marker Icons (Leaflet DivIcon)
const createJemaatMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-jemaat-divicon',
    html: `
      <div style="
        background-color: #3730A3;
        color: #FFFFFF;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
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

const createBajemMarkerIcon = (hasKerawananKritis: boolean, hasPotensi: boolean) => {
  const borderColor = hasKerawananKritis ? '#EF4444' : '#FFFFFF';
  const badgeDot = hasKerawananKritis
    ? `<span style="position:absolute; top:-2px; right:-2px; width:10px; height:10px; background:#EF4444; border:1.5px solid white; border-radius:50%;"></span>`
    : hasPotensi
    ? `<span style="position:absolute; top:-2px; right:-2px; width:10px; height:10px; background:#10B981; border:1.5px solid white; border-radius:50%;"></span>`
    : '';

  return L.divIcon({
    className: 'custom-bajem-divicon',
    html: `
      <div style="
        position: relative;
        background-color: #059669;
        color: #FFFFFF;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid ${borderColor};
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2"/>
          <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/>
          <path d="M18 22V5l-6-3-6 3v17"/>
          <path d="M12 7v5"/>
          <path d="M10 9h4"/>
        </svg>
        ${badgeDot}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const createPosPelkesMarkerIcon = (hasKerawananKritis: boolean, hasPotensi: boolean) => {
  const borderColor = hasKerawananKritis ? '#EF4444' : '#FFFFFF';
  const badgeDot = hasKerawananKritis
    ? `<span style="position:absolute; top:-2px; right:-2px; width:10px; height:10px; background:#EF4444; border:1.5px solid white; border-radius:50%;"></span>`
    : hasPotensi
    ? `<span style="position:absolute; top:-2px; right:-2px; width:10px; height:10px; background:#10B981; border:1.5px solid white; border-radius:50%;"></span>`
    : '';

  return L.divIcon({
    className: 'custom-pos-divicon',
    html: `
      <div style="
        position: relative;
        background-color: #2563EB;
        color: #FFFFFF;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid ${borderColor};
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 20h10"/>
          <path d="M12 20v-8"/>
          <path d="M12 12c-3.3 0-6-2.7-6-6 0 0 4 0 6 3"/>
          <path d="M12 12c3.3 0 6-2.7 6-6 0 0-4 0-6 3"/>
        </svg>
        ${badgeDot}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
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

  const displayPosData = useMemo(() => {
    return selectedPosId && selectedPosId !== 'all' 
      ? data.filter(item => item.id_pos === selectedPosId) 
      : data;
  }, [data, selectedPosId]);

  // Separate Bajem vs Pos Pelkes datasets for independent map layer toggles
  const bajemData = useMemo(() => {
    return displayPosData.filter((item) => item.kategori === 'Bajem' || item.nama_pos.toLowerCase().includes('bajem'));
  }, [displayPosData]);

  const posPelkesData = useMemo(() => {
    return displayPosData.filter((item) => item.kategori !== 'Bajem' && !item.nama_pos.toLowerCase().includes('bajem'));
  }, [displayPosData]);

  if (!isMounted) {
    return (
      <div className="w-full h-[60vh] md:h-[70vh] rounded-2xl bg-surface-sunken animate-pulse flex flex-col items-center justify-center border border-border-subtle text-text-muted gap-2">
        <MapPin className="w-8 h-8 animate-bounce text-brand-primary" />
        <span className="text-sm font-medium">Memuat Peta Geospatial Terpadu (Unified Map)...</span>
      </div>
    );
  }

  // Default Map Center (Indonesia archipelago overview)
  const defaultCenter: [number, number] = displayPosData.length === 1 
    ? [displayPosData[0].latitude, displayPosData[0].longitude] 
    : jemaatData.length > 0
    ? [jemaatData[0].latitude, jemaatData[0].longitude]
    : [-0.789275, 113.921327];

  const defaultZoom = displayPosData.length === 1 ? 12 : 5;

  const jemaatIcon = createJemaatMarkerIcon();

  const renderPopupContent = (item: MapPosPelkesItem, isBajemItem: boolean) => (
    <div className="p-3 min-w-[250px] max-w-[320px] space-y-2.5 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block border ${
          isBajemItem 
            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300' 
            : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border-blue-300'
        }`}>
          {item.id_pos} • {isBajemItem ? 'Bajem' : 'Pos Pelkes'}
        </span>
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug mt-1">
          <PosName name={item.nama_pos} />
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
  );

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

          {/* OVERLAY LAYER 1: JEMAAT INDUK (GEREJA INDUK) - Indigo Pin with Church Icon */}
          <LayersControl.Overlay checked name="⛪ Jemaat Induk">
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
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 inline-block">
                            {jemaat.id_induk} • Gereja Induk
                          </span>
                          <h3 className="font-extrabold text-base text-indigo-900 dark:text-indigo-300 leading-snug mt-1">
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
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs">
                            <span className="text-[10px] text-indigo-800 dark:text-indigo-300 font-bold block">Ketua Majelis Jemaat (KMJ):</span>
                            <span className="font-bold text-indigo-950 dark:text-indigo-100">{jemaat.kmj_nama}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                          <Link
                            href={`/hierarki/${encodeURIComponent(jemaat.id_mupel)}/${encodeURIComponent(jemaat.id_induk)}`}
                            className="w-full min-h-[38px] bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 text-white"
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

          {/* OVERLAY LAYER 2: BAKAL JEMAAT (BAJEM) - Emerald Pin with Sprout Icon */}
          <LayersControl.Overlay checked name="🌱 Bakal Jemaat (Bajem)">
            <LayerGroup>
              <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={45}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
              >
                {bajemData.map((item) => {
                  const hasKritis = item.kerawanan_list.some((k) => k.frekuensi === 'Kritis' || k.frekuensi === 'Tinggi');
                  const hasPotensi = item.jumlah_potensi > 0;
                  const icon = createBajemMarkerIcon(hasKritis, hasPotensi);

                  return (
                    <Marker
                      key={`bajem-${item.id_pos}`}
                      position={[item.latitude, item.longitude]}
                      icon={icon}
                      eventHandlers={{
                        click: () => {
                          if (onSelectPos) onSelectPos(item.id_pos);
                        },
                      }}
                    >
                      <Popup className="custom-wilayah-popup">
                        {renderPopupContent(item, true)}
                      </Popup>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>
            </LayerGroup>
          </LayersControl.Overlay>

          {/* OVERLAY LAYER 3: POS PELKES - Blue Pin with Church Icon */}
          <LayersControl.Overlay checked name="🔹 Pos Pelkes">
            <LayerGroup>
              <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={45}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
              >
                {posPelkesData.map((item) => {
                  const hasKritis = item.kerawanan_list.some((k) => k.frekuensi === 'Kritis' || k.frekuensi === 'Tinggi');
                  const hasPotensi = item.jumlah_potensi > 0;
                  const icon = createPosPelkesMarkerIcon(hasKritis, hasPotensi);

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
                        {renderPopupContent(item, false)}
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
