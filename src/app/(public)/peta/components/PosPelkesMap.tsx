'use client';

import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, DivIcon, latLngBounds, LatLngExpression } from 'leaflet';
import {
  MapPin,
  Users,
  Phone,
  ExternalLink,
  X,
  Church,
  Calendar,
} from 'lucide-react';
import type { PublicPosPelkes } from '@/app/actions/public';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// ===== Fix default marker icon di Next.js =====
if (typeof window !== 'undefined') {
  delete (Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// ===== Custom cluster icon =====
const clusterIcon = (cluster: { getChildCount: () => number }) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 'small' : count < 50 ? 'medium' : 'large';
  const sizeClass =
    size === 'small'
      ? 'w-10 h-10'
      : size === 'medium'
        ? 'w-12 h-12'
        : 'w-14 h-14';

  return new DivIcon({
    html: `
      <div class="${sizeClass} bg-[#1E40AF] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">
        ${count}
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: [0, 0],
  });
};

// ===== Custom marker icon =====
const posIcon = new DivIcon({
  html: `
    <div class="relative">
      <div class="w-8 h-8 bg-[#1E40AF] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
        </svg>
      </div>
      <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#1E40AF]"></div>
    </div>
  `,
  className: 'custom-pos-marker',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
});

// ===== Component: Fit map bounds =====
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;

    const bounds = latLngBounds(positions as LatLngExpression[]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [positions, map]);

  return null;
}

// ===== Component: Fly to selected pos =====
function FlyToPos({ pos }: { pos: PublicPosPelkes | null }) {
  const map = useMap();

  useEffect(() => {
    if (pos?.latitude && pos?.longitude) {
      map.flyTo([pos.latitude, pos.longitude], 14, { duration: 1 });
    }
  }, [pos, map]);

  return null;
}

// ===== Main Map Component =====
interface PosPelkesMapProps {
  posPelkesList: PublicPosPelkes[];
  selectedPos: PublicPosPelkes | null;
  onSelectPos: (pos: PublicPosPelkes | null) => void;
}

export function PosPelkesMap({
  posPelkesList,
  selectedPos,
  onSelectPos,
}: PosPelkesMapProps) {
  // Filter hanya pos dengan koordinat valid
  const validPositions = useMemo(
    () =>
      posPelkesList.filter(
        (pos) =>
          pos.latitude !== null &&
          pos.longitude !== null &&
          !Number.isNaN(pos.latitude) &&
          !Number.isNaN(pos.longitude)
      ),
    [posPelkesList]
  );

  const positions = useMemo(
    () =>
      validPositions.map(
        (pos) => [pos.latitude!, pos.longitude!] as [number, number]
      ),
    [validPositions]
  );

  return (
    <>
      <MapContainer
        center={[-2.5, 118]}
        zoom={5}
        className="w-full h-full z-0"
        scrollWheelZoom
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fit bounds ke semua marker */}
        {positions.length > 0 && <FitBounds positions={positions} />}

        {/* Fly to selected pos */}
        <FlyToPos pos={selectedPos} />

        {/* Marker Cluster */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={clusterIcon}
          maxClusterRadius={60}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
        >
          {validPositions.map((pos) => (
            <Marker
              key={pos.id_pos}
              position={[pos.latitude!, pos.longitude!]}
              icon={posIcon}
              eventHandlers={{
                click: () => onSelectPos(pos),
              }}
            >
              <Popup maxWidth={280}>
                <div className="p-1">
                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                    {pos.nama_pos}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">{pos.nama_jemaat}</p>
                  <button
                    onClick={() => onSelectPos(pos)}
                    className="text-xs text-[#1E40AF] font-semibold hover:underline active:opacity-70"
                  >
                    Lihat Detail →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* ===== Detail Bottom Sheet (Mobile) / Side Panel (Desktop) ===== */}
      {selectedPos && (
        <PosDetailSheet pos={selectedPos} onClose={() => onSelectPos(null)} />
      )}

      {/* Global styles untuk cluster & marker */}
      <style jsx global>{`
        .custom-cluster-icon,
        .custom-pos-marker {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-content {
          margin: 12px;
          font-family: inherit;
        }
        .leaflet-container {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </>
  );
}

// ===== Detail Sheet Component =====
function PosDetailSheet({
  pos,
  onClose,
}: {
  pos: PublicPosPelkes;
  onClose: () => void;
}) {
  const handleOpenGoogleMaps = () => {
    if (pos.latitude && pos.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${pos.latitude},${pos.longitude}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  const handleWhatsApp = () => {
    if (pos.no_wa_pj) {
      const cleanNumber = pos.no_wa_pj.replace(/[^0-9]/g, '');
      const formatted = cleanNumber.startsWith('0')
        ? `62${cleanNumber.slice(1)}`
        : cleanNumber;
      const message = encodeURIComponent(
        `Halo, saya ingin mengetahui lebih lanjut tentang ${pos.nama_pos} (${pos.nama_jemaat}).`
      );
      window.open(`https://wa.me/${formatted}?text=${message}`, '_blank');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed z-[1001] bg-white dark:bg-gray-900',
          'w-full md:max-w-md',
          'bottom-0 left-0 right-0 md:bottom-6 md:right-6 md:left-auto md:top-6',
          'rounded-t-2xl md:rounded-2xl',
          'shadow-2xl',
          'max-h-[80vh] md:max-h-[calc(100vh-48px)]',
          'overflow-y-auto',
          'animate-in slide-in-from-bottom duration-300 md:slide-in-from-right'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={`Detail ${pos.nama_pos}`}
      >
        {/* Handle bar (mobile only) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white font-serif">
            Detail Pos Pelkes
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Tutup detail"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Nama & Jemaat */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white font-serif leading-snug">
              {pos.nama_pos}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {pos.nama_jemaat} • {pos.nama_mupel}
            </p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Alamat */}
            {pos.alamat && (
              <div className="col-span-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-[#1E40AF]" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Alamat
                  </span>
                </div>
                <p className="text-sm text-gray-900 dark:text-white">
                  {pos.alamat}
                </p>
              </div>
            )}

            {/* Berdiri */}
            {pos.tgl_berdiri && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-[#1E40AF]" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Berdiri
                  </span>
                </div>
                <p className="text-sm font-bold text-[#1E40AF]">
                  {format(new Date(pos.tgl_berdiri), 'd MMM yyyy', {
                    locale: localeID,
                  })}
                </p>
              </div>
            )}

            {/* Jiwa */}
            {pos.total_jiwa > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Jiwa
                  </span>
                </div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {pos.total_jiwa.toLocaleString('id-ID')}
                </p>
              </div>
            )}
          </div>

          {/* PJ Info */}
          {pos.nama_pj && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Church className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Pendeta Jemaat
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {pos.nama_pj}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {pos.latitude && pos.longitude && (
              <button
                onClick={handleOpenGoogleMaps}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1E40AF] text-white font-semibold rounded-xl hover:bg-[#1E3A8A] active:scale-[0.98] transition-all min-h-[48px] shadow-lg shadow-blue-600/20"
              >
                <ExternalLink className="w-4 h-4" />
                Lihat di Google Maps
              </button>
            )}
            {pos.no_wa_pj && (
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all min-h-[48px]"
              >
                <Phone className="w-4 h-4" />
                Hubungi PJ via WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PosPelkesMap;
