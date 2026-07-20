'use client';

import Link from 'next/link';
import { JemaatIndukItem } from '@/hooks/use-hierarki';
import { Church, ChevronRight, UserCheck, MapPin, AlertCircle } from 'lucide-react';

interface JemaatCardProps {
  jemaat: JemaatIndukItem;
  id_mupel: string;
}

export function JemaatCard({ jemaat, id_mupel }: JemaatCardProps) {
  const hasKmj = Boolean(jemaat.kmj?.nama_lengkap);
  const hasCoordinates = Boolean(jemaat.latitude && jemaat.longitude);

  return (
    <Link
      href={`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(jemaat.id_induk)}`}
      className="block group min-h-[44px] bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft hover:border-brand-primary/40 hover:shadow-medium transition-all active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
            <Church size={22} />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-sunken border border-border-subtle text-text-muted">
                {jemaat.id_induk}
              </span>

              {/* Status KMJ Badge */}
              {hasKmj ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                  <UserCheck size={12} className="text-indigo-600 dark:text-indigo-400" />
                  KMJ: {jemaat.kmj?.nama_lengkap}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                  <AlertCircle size={12} className="text-amber-600 dark:text-amber-400" />
                  Belum ada KMJ
                </span>
              )}
            </div>

            <h3 className="font-extrabold text-text-high text-base group-hover:text-brand-primary transition-colors leading-snug">
              {jemaat.nama_induk}
            </h3>

            {jemaat.alamat && (
              <p className="text-xs text-text-muted line-clamp-1">{jemaat.alamat}</p>
            )}
          </div>
        </div>

        <div className="p-2 rounded-xl text-text-muted group-hover:text-brand-primary group-hover:bg-surface-sunken transition-all shrink-0">
          <ChevronRight size={20} />
        </div>
      </div>

      {/* Footer Stat Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-border-subtle text-xs text-text-muted">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <MapPin size={14} />
            {jemaat.pos_count ?? 0} Pos Pelkes
          </span>
          <span>•</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {jemaat.pj_count ?? 0} PJ Aktif
          </span>
        </div>

        {/* GPS Indicator */}
        {!hasCoordinates && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium italic">
            ⚠️ Koordinat belum diisi
          </span>
        )}
      </div>
    </Link>
  );
}
