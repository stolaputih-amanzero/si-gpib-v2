'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, MapPin, Edit3, Layers, Church } from 'lucide-react';
import { PosMiniMap } from '@/components/maps/PosMiniMap';
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
}

export function CollapsingMapHeader({
  pos,
  catLabel,
  catColor,
  canWrite,
  onEditClick,
}: CollapsingMapHeaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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
            ? 'h-24 sm:h-28'
            : 'h-48 sm:h-56'
        )}
      >
        {pos.latitude && pos.longitude ? (
          <div className="absolute inset-0 z-0">
            <PosMiniMap
              latitude={pos.latitude}
              longitude={pos.longitude}
              nama_pos={pos.nama_pos}
              alamat={pos.alamat}
              zoom={14}
            />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-surface-sunken surface-grain" />
        )}

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/20 backdrop-blur-[1px]" />

        <div className="relative z-20 h-full p-4 sm:p-5 flex flex-col justify-between text-white">
          <div className="flex items-center justify-between gap-2">
            <nav
              aria-label="Breadcrumb Lokasi"
              className="flex items-center gap-1.5 text-xs text-white/80 overflow-x-auto scrollbar-none font-medium"
            >
              {mupel && (
                <Link
                  href={`/hierarki/${encodeURIComponent(mupel.id_mupel)}`}
                  className="hover:text-white hover:underline flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
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
                    className="hover:text-white hover:underline flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
                  >
                    <Church size={13} className="shrink-0" />
                    <span className="truncate max-w-[120px]">{jemaat.nama_induk}</span>
                  </Link>
                </>
              )}

              <ChevronRight size={12} className="text-white/50 shrink-0" />
              <span className="font-bold text-white shrink-0 truncate max-w-[140px]">{pos.id_pos}</span>
            </nav>

            {canWrite && onEditClick && (
              <button
                type="button"
                onClick={() => {
                  haptic.medium();
                  onEditClick();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 border border-white/30 shrink-0 shadow-xs"
              >
                <Edit3 size={13} />
                <span className="hidden sm:inline">Edit Pos</span>
              </button>
            )}
          </div>

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

            <h1 className="font-display font-black text-xl sm:text-2xl text-white leading-tight tracking-tight drop-shadow-sm truncate">
              {pos.nama_pos}
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}

export default CollapsingMapHeader;
