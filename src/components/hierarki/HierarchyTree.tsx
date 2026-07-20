'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MupelItem, useJemaatByMupel, usePosByJemaat } from '@/hooks/use-hierarki';
import { Layers, Church, MapPin, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface HierarchyTreeProps {
  mupelList: MupelItem[];
  searchQuery?: string;
}

export function HierarchyTree({ mupelList, searchQuery }: HierarchyTreeProps) {
  const [expandedMupel, setExpandedMupel] = useState<Record<string, boolean>>({});

  const toggleMupel = (id_mupel: string) => {
    setExpandedMupel((prev) => ({ ...prev, [id_mupel]: !prev[id_mupel] }));
  };

  return (
    <div className="space-y-3">
      {mupelList.map((mupel) => {
        const isExpanded = Boolean(expandedMupel[mupel.id_mupel]);

        return (
          <div
            key={mupel.id_mupel}
            className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-soft overflow-hidden transition-all"
          >
            {/* Mupel Row Header */}
            <div className="flex items-center justify-between p-4 min-h-[44px] hover:bg-surface-sunken/60 transition-colors">
              <button
                type="button"
                onClick={() => toggleMupel(mupel.id_mupel)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Layers size={20} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      {mupel.id_mupel}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-text-high text-sm">{mupel.nama_mupel}</h3>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-muted hidden sm:inline-block">
                  {mupel.jemaat_count ?? 0} Jemaat • {mupel.pos_count ?? 0} Pos
                </span>

                <Link
                  href={`/hierarki/${encodeURIComponent(mupel.id_mupel)}`}
                  className="p-2 text-text-muted hover:text-brand-primary hover:bg-surface-sunken rounded-lg transition-colors"
                  title="Lihat Detail Mupel"
                >
                  <ExternalLink size={16} />
                </Link>

                <button
                  type="button"
                  onClick={() => toggleMupel(mupel.id_mupel)}
                  className="p-2 text-text-muted hover:text-text-high rounded-lg transition-colors"
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              </div>
            </div>

            {/* Tree Branch: List Jemaat Induk */}
            {isExpanded && (
              <div className="border-t border-border-subtle bg-surface-sunken/30 p-3 pl-6 sm:pl-10 space-y-2">
                <JemaatTreeBranch id_mupel={mupel.id_mupel} searchQuery={searchQuery} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function JemaatTreeBranch({ id_mupel, searchQuery }: { id_mupel: string; searchQuery?: string }) {
  const { data: jemaatList, isLoading } = useJemaatByMupel(id_mupel, searchQuery);
  const [expandedJemaat, setExpandedJemaat] = useState<Record<string, boolean>>({});

  const toggleJemaat = (id_induk: string) => {
    setExpandedJemaat((prev) => ({ ...prev, [id_induk]: !prev[id_induk] }));
  };

  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    );
  }

  if (!jemaatList || jemaatList.length === 0) {
    return (
      <p className="text-xs text-text-muted py-2 italic">Belum ada data Jemaat Induk di Mupel ini.</p>
    );
  }

  return (
    <div className="space-y-2">
      {jemaatList.map((jemaat) => {
        const isJExpanded = Boolean(expandedJemaat[jemaat.id_induk]);

        return (
          <div key={jemaat.id_induk} className="bg-surface-elevated rounded-xl border border-border-subtle overflow-hidden">
            <div className="flex items-center justify-between p-3 min-h-[44px] hover:bg-surface-sunken/50 transition-colors">
              <button
                type="button"
                onClick={() => toggleJemaat(jemaat.id_induk)}
                className="flex items-center gap-2.5 flex-1 text-left"
              >
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Church size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-text-high text-xs">{jemaat.nama_induk}</h4>
                  <span className="text-[10px] text-text-muted">
                    {jemaat.kmj ? `KMJ: ${jemaat.kmj.nama_lengkap}` : '⚠️ Belum ada KMJ'}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {jemaat.pos_count ?? 0} Pos
                </span>

                <Link
                  href={`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(jemaat.id_induk)}`}
                  className="p-1.5 text-text-muted hover:text-indigo-600 transition-colors"
                >
                  <ExternalLink size={14} />
                </Link>

                <button
                  type="button"
                  onClick={() => toggleJemaat(jemaat.id_induk)}
                  className="p-1.5 text-text-muted hover:text-text-high"
                >
                  {isJExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
            </div>

            {/* Tree Leaf: List Pos Pelkes */}
            {isJExpanded && (
              <div className="border-t border-border-subtle bg-surface-sunken/50 p-2.5 pl-6 space-y-1.5">
                <PosTreeLeaf id_induk={jemaat.id_induk} id_mupel={id_mupel} searchQuery={searchQuery} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PosTreeLeaf({ id_induk, id_mupel, searchQuery }: { id_induk: string; id_mupel: string; searchQuery?: string }) {
  const { data: posList, isLoading } = usePosByJemaat(id_induk, searchQuery);

  if (isLoading) {
    return <Skeleton className="h-8 w-full rounded-lg" />;
  }

  if (!posList || posList.length === 0) {
    return <p className="text-[11px] text-text-muted italic py-1">Belum ada Pos Pelkes terdaftar.</p>;
  }

  return (
    <div className="space-y-1">
      {posList.map((pos) => (
        <Link
          key={pos.id_pos}
          href={`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(id_induk)}/${encodeURIComponent(pos.id_pos)}`}
          className="flex items-center justify-between p-2 rounded-lg bg-surface-elevated border border-border-subtle hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-colors min-h-[40px]"
        >
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-emerald-600 shrink-0" />
            <span className="font-semibold text-xs text-text-high">{pos.nama_pos}</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-text-muted">
            <span>{pos.pj ? `PJ: ${pos.pj.nama_lengkap}` : 'Belum ada PJ'}</span>
            <ChevronRight size={12} />
          </div>
        </Link>
      ))}
    </div>
  );
}
