import Link from 'next/link';
import { ChevronRight, Clock, MapPin, Building, Layers, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface DemografiCardProps {
  id_pos: string;
  nama_pos: string;
  jemaat_induk?: string;
  mupel?: string;
  total_kk: number;
  total_laki: number;
  total_perempuan: number;
  total_jiwa: number;
  updated_at?: string | null;
  filledPelkatCodes?: string[];
  missingPelkatCodes?: string[];
  onClick?: () => void;
}

function formatDateTimeIndonesian(dateString?: string | null) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';
  } catch (e) {
    return dateString;
  }
}

export function DemografiCard({ 
  id_pos, 
  nama_pos, 
  jemaat_induk,
  mupel,
  total_kk, 
  total_laki, 
  total_perempuan,
  updated_at,
  filledPelkatCodes = [],
  missingPelkatCodes = [],
  onClick
}: DemografiCardProps) {
  const isAllFilled = missingPelkatCodes.length === 0 && filledPelkatCodes.length > 0;
  const isPartial = filledPelkatCodes.length > 0 && missingPelkatCodes.length > 0;
  const isEmpty = filledPelkatCodes.length === 0;

  const content = (
    <div 
      onClick={onClick}
      className="bg-surface-elevated rounded-2xl p-4 shadow-soft border border-border-subtle hover:border-brand-primary/40 transition-all active:scale-[0.99] space-y-3 cursor-pointer group text-left"
    >
      {/* 1. Header: Name & Hierarchy */}
      <div className="flex items-start justify-between gap-2 border-b border-border-subtle/50 pb-2.5">
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-bold text-text-high text-base truncate group-hover:text-brand-primary transition-colors">
            {nama_pos}
          </h3>

          {/* Hierarki 3-Level */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            {mupel && mupel !== '-' && (
              <span className="flex items-center gap-1 font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-100 dark:border-purple-900/40">
                <Layers size={12} className="shrink-0" /> {mupel}
              </span>
            )}
            {jemaat_induk && jemaat_induk !== '-' && (
              <span className="flex items-center gap-1 font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/40">
                <Building size={12} className="shrink-0" /> {jemaat_induk}
              </span>
            )}
            {nama_pos && (
              <span className="flex items-center gap-1 font-semibold bg-surface-sunken text-text-high px-2 py-0.5 rounded-md border border-border-subtle">
                <MapPin size={12} className="shrink-0 text-brand-primary" /> {nama_pos}
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
      </div>

      {/* 2. Pelkat Completion Status Badge */}
      <div className="flex items-center justify-between text-xs">
        {isAllFilled && (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle2 size={13} /> 6 Pelkat Lengkap (100%)
          </span>
        )}
        {isPartial && (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <AlertTriangle size={13} /> {missingPelkatCodes.length} Pelkat Belum Diisi ({missingPelkatCodes.join(', ')})
          </span>
        )}
        {isEmpty && (
          <span className="px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-[11px] font-bold border border-red-200 dark:border-red-800 flex items-center gap-1">
            <XCircle size={13} /> Data Pelkat Masih Kosong
          </span>
        )}

        <span className="text-[11px] font-extrabold text-brand-primary tabular-nums">
          {filledPelkatCodes.length}/6 Terisi
        </span>
      </div>

      {/* 3. Summary Stats Row */}
      <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
        <div className="bg-surface-sunken rounded-xl p-2.5 border border-border-subtle/60">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total KK</p>
          <p className="text-base font-extrabold text-text-high tabular-nums mt-0.5">{total_kk} <span className="text-xs font-normal text-text-muted">KK</span></p>
        </div>
        <div className="bg-blue-50/60 dark:bg-blue-950/30 rounded-xl p-2.5 border border-blue-100 dark:border-blue-900/40">
          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Laki-Laki</p>
          <p className="text-base font-extrabold text-blue-700 dark:text-blue-300 tabular-nums mt-0.5">{total_laki} <span className="text-xs font-normal text-blue-500">Jiwa</span></p>
        </div>
        <div className="bg-pink-50/60 dark:bg-pink-950/30 rounded-xl p-2.5 border border-pink-100 dark:border-pink-900/40">
          <p className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider">Perempuan</p>
          <p className="text-base font-extrabold text-pink-700 dark:text-pink-300 tabular-nums mt-0.5">{total_perempuan} <span className="text-xs font-normal text-pink-500">Jiwa</span></p>
        </div>
      </div>

      {/* 4. Footer: Updated Time */}
      <div className="flex items-center justify-between border-t border-border-subtle/40 pt-2 text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5 font-medium">
          <Clock size={13} className="text-brand-primary shrink-0" />
          Terakhir diupdate:
        </span>
        <span className="font-semibold text-text-high tabular-nums">
          {formatDateTimeIndonesian(updated_at)}
        </span>
      </div>
    </div>
  );

  if (onClick) {
    return content;
  }

  return (
    <Link href={`/demografi/${id_pos}`} className="block">
      {content}
    </Link>
  );
}
