'use client';

import { useState } from 'react';
import { MupelItem, useJemaatByMupel, usePosByJemaat } from '@/hooks/use-hierarki';
import { Layers, Church, Sprout, ChevronRight, ChevronDown } from 'lucide-react';
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

  return (
    <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden shadow-xs">
      {mupelList.map((mupel) => {
        const isExpanded = Boolean(expandedMupel[mupel.id_mupel]);

        return (
          <div key={mupel.id_mupel} className="transition-colors">
            {/* Level 1: Mupel Row Header - Reusing ListRow for 100% Visual Identity */}
            <ListRow
              icon={<Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
              iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
              title={mupel.nama_mupel}
              subtitle={mupel.keterangan || mupel.id_mupel}
              meta={
                <span className="flex items-center gap-2 flex-wrap text-xs font-bold">
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
                </span>
              }
              href={`/hierarki/${encodeURIComponent(mupel.id_mupel)}`}
              action={
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMupel(mupel.id_mupel);
                  }}
                  className="p-2 text-text-muted hover:text-text-high hover:bg-surface-sunken rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                  title={isExpanded ? 'Tutup cabang Mupel' : 'Buka cabang Mupel'}
                >
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-purple-600 dark:text-purple-400" />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>
              }
            />

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
    <>
      {jemaatList.map((jemaat) => {
        const isJExpanded = Boolean(expandedJemaat[jemaat.id_induk]);

        return (
          <div key={jemaat.id_induk} className="transition-colors">
            {/* Level 2: Jemaat Induk Row - Reusing ListRow */}
            <ListRow
              icon={<Church className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
              iconClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              title={jemaat.nama_induk}
              subtitle={jemaat.keterangan || jemaat.id_induk}
              meta={
                <span className="flex items-center gap-2 flex-wrap text-xs font-bold">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="Bakal Jemaat (Bajem)">
                    <Church size={13} />
                    <span>{jemaat.bajem_count ?? 0}</span>
                  </span>
                  <span className="text-text-muted/40">•</span>
                  <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400" title="Pos Pelkes">
                    <Sprout size={13} />
                    <span>{jemaat.pos_count ?? 0}</span>
                  </span>
                </span>
              }
              href={`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(jemaat.id_induk)}`}
              action={
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleJemaat(jemaat.id_induk);
                  }}
                  className="p-2 text-text-muted hover:text-text-high hover:bg-surface-sunken rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                  title={isJExpanded ? 'Tutup pos di jemaat ini' : 'Buka pos di jemaat ini'}
                >
                  {isJExpanded ? (
                    <ChevronDown size={18} className="text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>
              }
            />

            {/* Tree Leaf: List Pos Pelkes & Bajem */}
            {isJExpanded && (
              <div className="bg-surface-sunken/70 pl-4 sm:pl-8 border-t border-line-hairline divide-y divide-line-hairline">
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
    return <Skeleton className="h-10 w-full rounded-xl my-1" />;
  }

  if (!posList || posList.length === 0) {
    return <p className="text-xs text-text-muted italic py-3 px-4">Belum ada Pos Pelkes / Bajem terdaftar.</p>;
  }

  return (
    <>
      {posList.map((pos) => {
        const isBajem = detectPosType(pos) === 'bajem';

        return (
          <ListRow
            key={pos.id_pos}
            icon={
              isBajem ? (
                <Church className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Sprout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              )
            }
            iconClassName={
              isBajem
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }
            title={
              <div className="flex items-center gap-2">
                <PosName name={pos.nama_pos} />
                <span
                  className={cn(
                    'text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-2xs shrink-0',
                    isBajem
                      ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                  )}
                >
                  {isBajem ? 'Bajem' : 'Pos'}
                </span>
              </div>
            }
            subtitle={pos.pj ? `PJ: ${pos.pj.nama_lengkap}` : 'Belum ada PJ'}
            href={`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(id_induk)}/${encodeURIComponent(pos.id_pos)}`}
          />
        );
      })}
    </>
  );
}

export default HierarchyTree;
