'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Crown, UserCheck, ChevronRight, Phone, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { PendetaItemByJemaat } from '@/hooks/use-pendeta-by-jemaat';
import { cn } from '@/lib/utils';

export interface LeadershipBlockProps {
  kmj?: PendetaItemByJemaat | null;
  pjs?: PendetaItemByJemaat[];
  className?: string;
}

export function LeadershipBlock({ kmj, pjs = [], className }: LeadershipBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const maxInitialPjs = 5;
  const hasMorePjs = pjs.length > maxInitialPjs;
  const displayedPjs = expanded ? pjs : pjs.slice(0, maxInitialPjs);

  return (
    <section className={cn('bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs divide-y divide-line-hairline', className)}>
      {/* Subjudul Kepemimpinan */}
      <div className="px-4 py-3 bg-surface-sunken/40 flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-brand-primary" />
          <span>Kepemimpinan Jemaat Induk</span>
        </h2>
        <span className="text-[10px] font-bold text-text-tertiary">KMJ (1) • PJ ({pjs.length})</span>
      </div>

      {/* 1. KMJ (Ketua Majelis Jemaat) — Card Utama Menonjol */}
      {kmj ? (
        <Link
          href={`/settings/users/${encodeURIComponent(kmj.user_id || kmj.id_pendeta)}`}
          className="tap flex items-center justify-between p-4 bg-surface-brand/20 hover:bg-surface-brand/30 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            {kmj.foto_url ? (
              <img
                src={kmj.foto_url}
                alt={kmj.nama_lengkap}
                className="w-12 h-12 rounded-xl object-cover border-2 border-brand-primary/30 shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black text-lg shrink-0 shadow-2xs">
                <Crown className="w-6 h-6" />
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-base text-text-high truncate group-hover:text-brand-primary transition-colors">
                  {kmj.nama_lengkap}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-primary text-white shadow-2xs">
                  KMJ
                </span>
              </div>
              <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                <span>Ketua Majelis Jemaat</span>
                {kmj.no_wa && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
                      <Phone size={12} />
                      <span>{kmj.no_wa}</span>
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-brand-primary group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
        </Link>
      ) : (
        <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Belum ada Ketua Majelis Jemaat (KMJ) yang ditugaskan di jemaat ini.</span>
          </div>
        </div>
      )}

      {/* 2. Pendeta Jemaat (PJ) List (0:N) */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-extrabold text-text-high">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-accent-600 dark:text-accent-400" />
            <span>Pendeta Jemaat / PJ ({pjs.length})</span>
          </span>
        </div>

        {pjs.length === 0 ? (
          <p className="text-xs text-text-tertiary italic">Belum ada Pendeta Jemaat yang ditugaskan di jemaat ini.</p>
        ) : (
          <div className="space-y-2">
            {displayedPjs.map((pj) => {
              let tglFormatted: string | null = null;
              if (pj.tanggal_mulai_pj) {
                try {
                  tglFormatted = format(new Date(pj.tanggal_mulai_pj), 'd MMM yyyy', { locale: idLocale });
                } catch {
                  tglFormatted = pj.tanggal_mulai_pj;
                }
              }

              return (
                <Link
                  key={pj.id_pendeta}
                  href={`/settings/users/${encodeURIComponent(pj.user_id || pj.id_pendeta)}`}
                  className="tap flex items-center justify-between p-2.5 rounded-xl bg-surface-sunken/50 hover:bg-surface-sunken transition-colors group cursor-pointer border border-border-subtle/50"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {pj.foto_url ? (
                      <img
                        src={pj.foto_url}
                        alt={pj.nama_lengkap}
                        className="w-9 h-9 rounded-lg object-cover border border-border-subtle shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-surface-accent text-accent-600 dark:text-accent-300 flex items-center justify-center font-bold text-xs shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-high truncate group-hover:text-brand-primary transition-colors">
                          {pj.nama_lengkap}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-accent-500/10 text-accent-600 border border-accent-500/20">
                          PJ
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted truncate">
                        {tglFormatted ? `Bertugas sejak ${tglFormatted}` : pj.jabatan || 'Pendeta Jemaat'}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-brand-primary shrink-0" />
                </Link>
              );
            })}

            {/* Collapsible Expansion for PJ > 5 */}
            {hasMorePjs && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full py-2 px-3 mt-1 rounded-xl bg-surface-sunken hover:bg-surface-sunken/80 text-xs font-bold text-brand-primary flex items-center justify-center gap-1.5 transition-colors border border-border-subtle/60"
              >
                <span>{expanded ? 'Tutup Rincian' : `Lihat ${pjs.length - maxInitialPjs} PJ Lainnya`}</span>
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default LeadershipBlock;
