'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, MapPin, Edit3, Layers, Church, Share2, Map, Check, MapPinOff } from 'lucide-react';
import { PosMiniMap } from '@/components/maps/PosMiniMap';
import { MupelClusterMap } from '@/components/maps/MupelClusterMap';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';

export interface CollapsingMapHeaderProps {
  pos: {
    id_pos: string;
    id_induk: string;
    nama_pos: string;
    kategori: string | null;
    alamat: string | null;
    latitude: number | null;
    longitude: number | null;
    jemaat_induk?: {
      id_induk: string;
      nama_induk: string;
      id_mupel: string;
      mupel?: {
        id_mupel: string;
        nama_mupel: string;
      } | null;
    } | null;
  };
  catLabel: string;
  catColor: string;
  canWrite?: boolean;
  onEditClick?: () => void;
  mapType?: 'single' | 'cluster';
  centroid?: { lat: number; lng: number } | null;
  clusterMarkers?: Array<{
    id_induk: string;
    nama_induk: string;
    lat: number;
    lng: number;
    alamat?: string | null;
  }>;
}

export function CollapsingMapHeader({
  pos,
  catLabel,
  catColor,
  canWrite,
  onEditClick,
  mapType = 'single',
  centroid,
  clusterMarkers = [],
}: CollapsingMapHeaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasSingleCoords = Boolean(pos.latitude && pos.longitude);
  const hasClusterCoords = Boolean(centroid && clusterMarkers.length > 0);
  const hasCoords = mapType === 'cluster' ? hasClusterCoords : hasSingleCoords;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCollapsed(!entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '-60px 0px 0px 0px' }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const handleShare = async () => {
    haptic.medium();
    const shareData = {
      title: `${pos.nama_pos} - GPIB`,
      text: `Detail ${pos.nama_pos} (${catLabel})`,
      url: window.location.href,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback to Clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback to WhatsApp link
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareData.title}\n${shareData.url}`)}`,
          '_blank'
        );
      }
    }
  };

  const mupel = pos.jemaat_induk?.mupel;
  const jemaat = pos.jemaat_induk;

  return (
    <>
      <div ref={sentinelRef} className="h-1 w-full pointer-events-none" />

      <div
        className={cn(
          'relative w-full rounded-2xl overflow-hidden shadow-soft transition-all duration-300 select-none border border-border-subtle bg-surface-1',
          prefersReducedMotion
            ? 'h-auto py-4 px-4'
            : isCollapsed
            ? 'h-24 sm:h-28 sticky top-14 z-30 shadow-md backdrop-blur-md'
            : 'h-48 sm:h-56'
        )}
      >
        {/* Background Map or Placeholder */}
        {hasCoords ? (
          <div className="absolute inset-0 z-0">
            {mapType === 'cluster' && centroid ? (
              <MupelClusterMap centroid={centroid} markers={clusterMarkers} zoom={9} />
            ) : (
              <PosMiniMap
                latitude={pos.latitude!}
                longitude={pos.longitude!}
                nama_pos={pos.nama_pos}
                alamat={pos.alamat}
                zoom={14}
              />
            )}
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-surface-sunken flex items-center justify-center surface-grain p-4">
            <div className="flex items-center gap-2 text-text-tertiary text-xs font-semibold bg-surface-1/70 backdrop-blur-xs px-3 py-1.5 rounded-full border border-border-subtle">
              <MapPinOff size={14} className="text-amber-500" />
              <span>Koordinat lokasi belum tercatat</span>
            </div>
          </div>
        )}

        {/* Functional Scrim Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/20 backdrop-blur-[1px]" />

        {/* Header Content */}
        <div className="relative z-20 h-full p-4 sm:p-5 flex flex-col justify-between text-white">
          {/* Top Bar: Breadcrumb + Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <nav
              aria-label="Breadcrumb Lokasi"
              className="flex items-center gap-1.5 text-xs text-white/80 overflow-x-auto scrollbar-none font-medium"
            >
              {mupel && (
                <Link
                  href={`/hierarki/${encodeURIComponent(mupel.id_mupel)}`}
                  className="hover:text-white hover:underline flex items-center gap-1 shrink-0 active:scale-95 transition-transform min-h-[44px] py-2"
                >
                  <Layers size={13} className="shrink-0" />
                  <span className="truncate max-w-[100px]">{mupel.nama_mupel}</span>
                </Link>
              )}

              {jemaat && (
                <>
                  <ChevronRight size={12} className="text-white/50 shrink-0" />
                  <Link
                    href={`/hierarki/${encodeURIComponent(mupel?.id_mupel || '')}/${encodeURIComponent(jemaat.id_induk)}`}
                    className="hover:text-white hover:underline flex items-center gap-1 shrink-0 active:scale-95 transition-transform min-h-[44px] py-2"
                  >
                    <Church size={13} className="shrink-0" />
                    <span className="truncate max-w-[120px]">{jemaat.nama_induk}</span>
                  </Link>
                </>
              )}

              {(!mupel && !jemaat) && (
                <span className="flex items-center gap-1 font-bold text-white shrink-0">
                  <Layers size={13} />
                  <span>{pos.id_pos}</span>
                </span>
              )}
            </nav>

            {/* Action Buttons: Share + Full Map + Edit */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Bagikan Detail"
                className="h-11 w-11 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition-all active:scale-95 border border-white/30 shrink-0 shadow-xs cursor-pointer"
                title={copied ? 'URL Disalin!' : 'Bagikan Detail'}
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
              </button>

              {hasCoords ? (
                <Link
                  href={
                    mapType === 'cluster'
                      ? `/dashboard/peta`
                      : `/dashboard/pos-pelkes/${encodeURIComponent(pos.id_pos)}/map`
                  }
                  aria-label="Buka Peta Penuh"
                  className="h-11 w-11 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition-all active:scale-95 border border-white/30 shrink-0 shadow-xs"
                  title="Buka Peta Penuh"
                >
                  <Map size={16} />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="h-11 w-11 rounded-xl bg-white/10 text-white/40 backdrop-blur-xs flex items-center justify-center cursor-not-allowed border border-white/10 shrink-0"
                  title="Peta tidak tersedia (koordinat kosong)"
                >
                  <Map size={16} />
                </button>
              )}

              {canWrite && onEditClick && (
                <button
                  type="button"
                  onClick={() => {
                    haptic.medium();
                    onEditClick();
                  }}
                  className="h-11 px-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 border border-white/30 shrink-0 shadow-xs cursor-pointer"
                >
                  <Edit3 size={15} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Title & Metadata Bottom Row */}
          <div className="space-y-1 mt-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs', catColor)}>
                {catLabel}
              </span>
              {pos.alamat && (
                <span className="text-[11px] text-white/80 flex items-center gap-1 truncate max-w-[280px]">
                  <MapPin size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{pos.alamat}</span>
                </span>
              )}
            </div>

            <h1 className="font-display font-semibold text-xl sm:text-3xl text-white leading-tight tracking-tight drop-shadow-sm truncate">
              {pos.nama_pos}
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}

export default CollapsingMapHeader;
