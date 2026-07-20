import { KategoriBadge } from './KategoriBadge';
import Link from 'next/link';
import { ChevronRight, Users, Home } from 'lucide-react';

interface DemografiCardProps {
  id_pos: string;
  nama_pos: string;
  kategori_pelkat: string;
  jml_kk: number;
  laki: number;
  perempuan: number;
  jemaat_induk?: string;
}

export function DemografiCard({ 
  id_pos, 
  nama_pos, 
  kategori_pelkat, 
  jml_kk, 
  laki, 
  perempuan,
  jemaat_induk 
}: DemografiCardProps) {
  const totalJiwa = laki + perempuan;

  return (
    <Link href={`/demografi/${id_pos}`} className="block group">
      <div className="bg-surface-elevated rounded-xl p-4 shadow-soft border border-border-subtle hover:border-brand-primary/30 transition-all active:scale-[0.99] space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-text-high text-base truncate group-hover:text-brand-primary transition-colors">
              {nama_pos}
            </h3>
            {jemaat_induk && (
              <p className="text-xs text-text-muted mt-0.5 truncate flex items-center gap-1">
                <Home size={12} className="shrink-0" /> {jemaat_induk}
              </p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-transform" />
        </div>

        <div className="flex items-center justify-between">
          <KategoriBadge kode={kategori_pelkat} size="md" />
          <div className="flex items-center gap-1 text-brand-primary font-bold text-lg tabular-nums">
            <Users size={16} />
            <span>{totalJiwa} <span className="text-xs font-normal text-text-muted">Jiwa</span></span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-surface-sunken rounded-lg p-2 border border-border-subtle/50">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">KK</p>
            <p className="text-base font-bold text-text-high tabular-nums mt-0.5">{jml_kk}</p>
          </div>
          <div className="bg-blue-50/60 dark:bg-blue-950/30 rounded-lg p-2 border border-blue-100 dark:border-blue-900/40">
            <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Laki-Laki</p>
            <p className="text-base font-bold text-blue-700 dark:text-blue-300 tabular-nums mt-0.5">{laki}</p>
          </div>
          <div className="bg-pink-50/60 dark:bg-pink-950/30 rounded-lg p-2 border border-pink-100 dark:border-pink-900/40">
            <p className="text-[11px] font-medium text-pink-600 dark:text-pink-400 uppercase tracking-wider">Perempuan</p>
            <p className="text-base font-bold text-pink-700 dark:text-pink-300 tabular-nums mt-0.5">{perempuan}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
