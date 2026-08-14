'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MupelItem, useJemaatByMupel, usePosByJemaat } from '@/hooks/use-hierarki';
import { Layers, Church, Sprout, ChevronRight, ChevronDown, ExternalLink, ChevronsUpDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PosName } from '@/components/ui/PosName';
import { detectPosType } from '@/lib/utils/pos-type';
import { cn } from '@/lib/utils';
import { ListRow } from '@/components/list/ListRow';

interface HierarchyTreeProps {
  mupelList: MupelItem[];
  searchQuery?: string;
}

export function HierarchyTree({ mupelList, searchQuery }: HierarchyTreeProps) {
  const [expandedMupel, setExpandedMupel] = useState<Record<string, boolean>>({});

  const toggleMupel = (id_mupel: string) => {
    setExpandedMupel((prev) => ({ ...prev, [id_mupel]: !prev[id_mupel] }));
  };

  const hasAnyExpanded = useMemo(() => {
    return Object.values(expandedMupel).some(Boolean);
  }, [expandedMupel]);

  const toggleAllMupel = () => {
    if (hasAnyExpanded) {
      setExpandedMupel({});
    } else {
      const all: Record<string, boolean> = {};
      mupelList.forEach((m) => {
        all[m.id_mupel] = true;
      });
      setExpandedMupel(all);
    }
  };

  const displayedMupels = useMemo(() => {
    if (!searchQuery?.trim()) return mupelList;
    const q = searchQuery.toLowerCase().trim();
    const directMatches = mupelList.filter(
      (m) =>
        m.nama_mupel.toLowerCase().includes(q) ||
        (m.keterangan && m.keterangan.toLowerCase().includes(q)) ||
        m.id_mupel.toLowerCase().includes(q)
    );
    return directMatches.length > 0 ? directMatches : mupelList;
  }, [mupelList, searchQuery]);

  return (
    <div className="space-y-2">
      {/* Control bar */}
      <div className="flex items-center justify-between px-1 text-xs text-ink-secondary">
        <span>Klik baris untuk membuka / menutup hierarki (Mupel &rarr; Jemaat &rarr; Pos / Bajem)</span>
        <button
          type="button"
          onClick={toggleAllMupel}
          className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 hover:underline px-2 py-1 rounded-lg hover:bg-amber-500/10 transition-colors cursor-pointer"
        >
          <ChevronsUpDown size={14} />
          <span>{hasAnyExpanded ? 'Tutup Semua' : 'Buka Semua Mupel'}</span>
        </button>
      </div>

      <div className="bg-surface-1 border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden divide-y divide-stone-200/70 dark:divide-stone-800/80 shadow-xs">
        {displayedMupels.map((mupel) => {
          const isExpanded = Boolean(expandedMupel[mupel.id_mupel]);

          return (
            <div key={mupel.id_mupel} className="transition-colors">
              {/* Level 1: Mupel Row Header */}
              <ListRow
                icon={<Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
                title={
                  <div className="flex items-center gap-2">
                    <span>{mupel.nama_mupel}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                      Mupel
                    </span>
                  </div>
                }
                subtitle={mupel.keterangan || mupel.id_mupel}
                meta={
                  <span className="flex items-center gap-2 flex-wrap text-xs font-bold">
                    <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400" title="Jemaat Induk">
                      <Church size={13} />
                      <span>{mupel.jemaat_count ?? 0} Jemaat</span>
                    </span>
                    <span className="text-text-muted/40">•</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="Bakal Jemaat">
                      <Church size={13} />
                      <span>{mupel.bajem_count ?? 0} Bajem</span>
                    </span>
                    <span className="text-text-muted/40">•</span>
                    <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400" title="Pos Pelkes">
                      <Sprout size={13} />
                      <span>{mupel.pos_count ?? 0} Pos</span>
                    </span>
                  </span>
                }
                onClick={() => toggleMupel(mupel.id_mupel)}
                action={
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    <Link
                      href={`/org/${encodeURIComponent(mupel.id_mupel)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg hover:bg-stone-200/70 dark:hover:bg-stone-700/70 text-ink-tertiary hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                      title="Buka Workspace Mupel"
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <span className="p-1 text-ink-tertiary flex items-center justify-center">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 transition-transform" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-ink-tertiary shrink-0 transition-transform" />
                      )}
                    </span>
                  </div>
                }
              />

              {/* Tree Branch: List Jemaat Induk */}
              {isExpanded && (
                <div className="bg-stone-50/70 dark:bg-stone-900/50 pl-3 sm:pl-6 border-t border-stone-200/70 dark:border-stone-800">
                  <JemaatTreeBranch id_mupel={mupel.id_mupel} searchQuery={searchQuery} />
                </div>
              )}
            </div>
          );
        })}
      </div>
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
      <div className="py-3 px-4 space-y-2">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
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
    <div className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
      {jemaatList.map((jemaat) => {
        const isJExpanded = Boolean(expandedJemaat[jemaat.id_induk]);

        return (
          <div key={jemaat.id_induk} className="transition-colors">
            {/* Level 2: Jemaat Induk Row */}
            <ListRow
              icon={<Church className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
              iconClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              title={
                <div className="flex items-center gap-2">
                  <span>{jemaat.nama_induk}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                    Jemaat Induk
                  </span>
                </div>
              }
              subtitle={
                <span>
                  {jemaat.kmj ? `KMJ: ${jemaat.kmj.nama_lengkap}` : jemaat.keterangan || jemaat.id_induk}
                </span>
              }
              meta={
                <span className="flex items-center gap-2 flex-wrap text-xs font-bold">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="Bakal Jemaat (Bajem)">
                    <Church size={13} />
                    <span>{jemaat.bajem_count ?? 0} Bajem</span>
                  </span>
                  <span className="text-text-muted/40">•</span>
                  <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400" title="Pos Pelkes">
                    <Sprout size={13} />
                    <span>{jemaat.pos_count ?? 0} Pos</span>
                  </span>
                </span>
              }
              onClick={() => toggleJemaat(jemaat.id_induk)}
              action={
                <div className="flex items-center gap-1.5 shrink-0 self-center">
                  <Link
                    href={`/org/${encodeURIComponent(jemaat.id_induk)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg hover:bg-stone-200/70 dark:hover:bg-stone-700/70 text-ink-tertiary hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    title="Buka Workspace Jemaat"
                  >
                    <ExternalLink size={15} />
                  </Link>
                  <span className="p-1 text-ink-tertiary flex items-center justify-center">
                    {isJExpanded ? (
                      <ChevronDown className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 transition-transform" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-ink-tertiary shrink-0 transition-transform" />
                    )}
                  </span>
                </div>
              }
            />

            {/* Tree Leaf: List Pos Pelkes & Bajem */}
            {isJExpanded && (
              <div className="bg-stone-100/70 dark:bg-stone-950/60 pl-3 sm:pl-6 border-t border-stone-200/60 dark:border-stone-800">
                <PosTreeLeaf id_induk={jemaat.id_induk} id_mupel={id_mupel} searchQuery={searchQuery} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PosTreeLeaf({ id_induk, searchQuery }: { id_induk: string; id_mupel?: string; searchQuery?: string }) {
  const { data: posList, isLoading } = usePosByJemaat(id_induk, searchQuery);

  if (isLoading) {
    return <Skeleton className="h-10 w-full rounded-xl my-1" />;
  }

  if (!posList || posList.length === 0) {
    return <p className="text-xs text-text-muted italic py-3 px-4">Belum ada Pos Pelkes / Bajem terdaftar di Jemaat ini.</p>;
  }

  return (
    <div className="divide-y divide-stone-200/50 dark:divide-stone-800/50">
      {posList.map((pos) => {
        const isBajem = detectPosType(pos) === 'bajem';

        return (
          <ListRow
            key={pos.id_pos}
            icon={
              isBajem ? (
                <Church className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <Sprout className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              )
            }
            iconClassName={
              isBajem
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }
            title={
              <div className="flex items-center gap-2">
                <PosName name={pos.nama_pos} />
                <span
                  className={cn(
                    'text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-2xs shrink-0',
                    isBajem
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                  )}
                >
                  {isBajem ? 'Bajem' : 'Pos'}
                </span>
              </div>
            }
            subtitle={pos.pj ? `PJ: ${pos.pj.nama_lengkap}` : 'Belum ada PJ'}
            href={`/org/${encodeURIComponent(pos.id_pos)}`}
          />
        );
      })}
    </div>
  );
}

export default HierarchyTree;
