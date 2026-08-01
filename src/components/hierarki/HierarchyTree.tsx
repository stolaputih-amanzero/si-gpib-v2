'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MupelItem, useJemaatByMupel, usePosByJemaat } from '@/hooks/use-hierarki';
import { Layers, Church, Sprout, ChevronRight, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PosName } from '@/components/ui/PosName';
import { detectPosType } from '@/lib/utils/pos-type';
import { cn } from '@/lib/utils';

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
    <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden shadow-xs">
      {mupelList.map((mupel) => {
        const isExpanded = Boolean(expandedMupel[mupel.id_mupel]);

        return (
          <div key={mupel.id_mupel} className="transition-colors">
            {/* Level 1: Mupel Cardless Row Header */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 min-h-[52px] hover:bg-surface-hover/60 transition-colors">
              <button
                type="button"
                onClick={() => toggleMupel(mupel.id_mupel)}
                className="flex items-center gap-3 flex-1 text-left min-w-0"
              >
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                  <Layers className="w-5 h-5" />
                </span>

                <div className="min-w-0">
                  <h3 className="font-extrabold text-text-high text-sm sm:text-base truncate leading-snug">
                    {mupel.nama_mupel}
                  </h3>
                  <p className="text-xs text-text-muted truncate">
                    {mupel.keterangan || mupel.id_mupel}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap text-xs font-bold mt-0.5">
                    <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400" title="Jemaat Induk">
                      <Church size={13} />
                      <span>{mupel.jemaat_count ?? 0}</span>
                    </span>
                    <span className="text-text-muted/40">•</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="Bakal Jemaat (Bajem)">
                      <Church size={13} />
                      <span>{mupel.bajem_count ?? 0}</span>
                    </span>
                    <span className="text-text-muted/40">•</span>
                    <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400" title="Pos Pelkes">
                      <Sprout size={13} />
                      <span>{mupel.pos_count ?? 0}</span>
                    </span>
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleMupel(mupel.id_mupel)}
                  className="p-2 text-text-muted hover:text-text-high hover:bg-surface-sunken rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title={isExpanded ? 'Tutup cabang Mupel' : 'Buka cabang Mupel'}
                >
                  {isExpanded ? <ChevronDown size={18} className="text-purple-600 dark:text-purple-400" /> : <ChevronRight size={18} />}
                </button>
              </div>
            </div>

            {/* Tree Branch: List Jemaat Induk */}
            {isExpanded && (
              <div className="bg-surface-sunken/40 pl-4 sm:pl-8 border-t border-line-hairline divide-y divide-line-hairline">
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
      <div className="py-3 px-3 space-y-2">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    );
  }

  if (!jemaatList || jemaatList.length === 0) {
    return (
      <div className="p-4 text-xs text-text-muted italic flex items-center gap-2">
        <Church size={15} className="text-indigo-400 opacity-60" />
        <span>Belum ada data Jemaat Induk di Mupel ini.</span>
      </div>
    );
  }

  return (
    <>
      {jemaatList.map((jemaat) => {
        const isJExpanded = Boolean(expandedJemaat[jemaat.id_induk]);

        return (
          <div key={jemaat.id_induk} className="transition-colors">
            {/* Level 2: Jemaat Induk Row */}
            <div className="flex items-center justify-between p-3 sm:py-3 sm:px-4 min-h-[48px] hover:bg-surface-hover/60 transition-colors">
              <button
                type="button"
                onClick={() => toggleJemaat(jemaat.id_induk)}
                className="flex items-center gap-2.5 flex-1 text-left min-w-0"
              >
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Church size={16} />
                </span>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-text-high text-xs sm:text-sm truncate">{jemaat.nama_induk}</h4>
                  {(jemaat.keterangan || jemaat.id_induk) && (
                    <span className="text-[11px] text-text-muted truncate block">
                      {jemaat.keterangan || jemaat.id_induk}
                    </span>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="Bakal Jemaat (Bajem)">
                    <Church size={13} />
                    <span>{jemaat.bajem_count ?? 0}</span>
                  </span>
                  <span className="text-text-muted/40">•</span>
                  <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400" title="Pos Pelkes">
                    <Sprout size={13} />
                    <span>{jemaat.pos_count ?? 0}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleJemaat(jemaat.id_induk)}
                  className="p-1.5 text-text-muted hover:text-text-high hover:bg-surface-sunken rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title={isJExpanded ? 'Tutup pos di jemaat ini' : 'Buka pos di jemaat ini'}
                >
                  {isJExpanded ? <ChevronDown size={16} className="text-indigo-600 dark:text-indigo-400" /> : <ChevronRight size={16} />}
                </button>
              </div>
            </div>

            {/* Tree Leaf: List Pos Pelkes & Bajem */}
            {isJExpanded && (
              <div className="bg-surface-sunken/60 pl-4 sm:pl-8 py-2 border-t border-line-hairline space-y-1">
                <PosTreeLeaf id_induk={jemaat.id_induk} id_mupel={id_mupel} searchQuery={searchQuery} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function PosTreeLeaf({ id_induk, id_mupel, searchQuery }: { id_induk: string; id_mupel: string; searchQuery?: string }) {
  const { data: posList, isLoading } = usePosByJemaat(id_induk, searchQuery);

  if (isLoading) {
    return <Skeleton className="h-8 w-full rounded-lg my-1" />;
  }

  if (!posList || posList.length === 0) {
    return <p className="text-[11px] text-text-muted italic py-1 px-3">Belum ada Pos Pelkes / Bajem terdaftar.</p>;
  }

  return (
    <div className="space-y-1 pr-3">
      {posList.map((pos) => {
        const isBajem = detectPosType(pos) === 'bajem';

        return (
          <Link
            key={pos.id_pos}
            href={`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(id_induk)}/${encodeURIComponent(pos.id_pos)}`}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-xl transition-all min-h-[38px]",
              "hover:bg-surface-hover hover:shadow-xs",
              isBajem ? "hover:border-emerald-500/30" : "hover:border-blue-500/30"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isBajem ? (
                <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Church size={14} />
                </span>
              ) : (
                <span className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <Sprout size={14} />
                </span>
              )}
              <span className="font-bold text-xs text-text-high truncate">
                <PosName name={pos.nama_pos} />
              </span>
              <span className={cn(
                "text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border shrink-0",
                isBajem ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300" : "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border-blue-300"
              )}>
                {isBajem ? 'Bajem' : 'Pos'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-text-muted shrink-0">
              <span className="hidden sm:inline-block">{pos.pj ? `PJ: ${pos.pj.nama_lengkap}` : 'Belum ada PJ'}</span>
              <ChevronRight size={13} className="text-text-muted" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
