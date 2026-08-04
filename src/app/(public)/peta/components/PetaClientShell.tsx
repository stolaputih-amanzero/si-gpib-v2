'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Search, X } from 'lucide-react';
import type { PublicPosPelkes, PublicMupel } from '@/app/actions/public';
import { haptic } from '@/lib/haptic/vibrate';
import { PublicMapSkeleton } from './PublicMapSkeleton';

// Dynamic import Leaflet di dalam Client Component (Allowed & Recommended di Next.js App Router)
const PosPelkesMap = dynamic(
  () => import('./PosPelkesMap').then((mod) => mod.PosPelkesMap),
  {
    ssr: false,
    loading: () => <PublicMapSkeleton />,
  }
);

interface PetaClientShellProps {
  posPelkesList: PublicPosPelkes[];
  mupelList: PublicMupel[];
}

export function PetaClientShell({
  posPelkesList,
  mupelList,
}: PetaClientShellProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMupel, setSelectedMupel] = useState('');
  const [selectedPos, setSelectedPos] = useState<PublicPosPelkes | null>(null);

  // Client-side filtering — instant (< 1ms untuk 500 items)
  const filteredPos = useMemo(() => {
    let result = posPelkesList;

    // Filter by Mupel
    if (selectedMupel) {
      result = result.filter((pos) => pos.id_mupel === selectedMupel);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (pos) =>
          pos.nama_pos.toLowerCase().includes(q) ||
          pos.nama_jemaat.toLowerCase().includes(q) ||
          (pos.alamat && pos.alamat.toLowerCase().includes(q))
      );
    }

    return result;
  }, [posPelkesList, selectedMupel, searchQuery]);

  const handleSelectPos = (pos: PublicPosPelkes | null) => {
    setSelectedPos(pos);
    if (pos) haptic('light');
  };

  const activeFilterCount = (selectedMupel ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <>
      {/* ===== FILTER BAR ===== */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Pos Pelkes, Jemaat, atau alamat..."
              className="w-full pl-11 pr-11 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[48px]"
              aria-label="Cari Pos Pelkes"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Hapus pencarian"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Mupel Filter */}
          <div className="flex gap-2">
            <select
              value={selectedMupel}
              onChange={(e) => {
                setSelectedMupel(e.target.value);
                haptic('light');
              }}
              className="flex-1 sm:flex-none px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF] text-base min-h-[48px] sm:min-w-[220px]"
              aria-label="Filter berdasarkan Mupel"
            >
              <option value="">Semua Mupel ({posPelkesList.length})</option>
              {mupelList.map((mupel) => (
                <option key={mupel.id_mupel} value={mupel.id_mupel}>
                  {mupel.nama_mupel} ({mupel.total_pos} Pos)
                </option>
              ))}
            </select>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMupel('');
                  haptic('light');
                }}
                className="px-4 py-3 text-sm font-medium text-[#1E40AF] bg-blue-50 dark:bg-blue-950/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/50 active:scale-95 transition-all min-h-[48px] flex items-center gap-1.5"
                aria-label="Hapus semua filter"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Result count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Menampilkan{' '}
          <span className="font-semibold text-[#1E40AF]">
            {filteredPos.length}
          </span>{' '}
          dari {posPelkesList.length} Pos Pelkes
        </p>
      </div>

      {/* ===== MAP CONTAINER ===== */}
      <div className="relative h-[500px] sm:h-[600px] lg:h-[700px]">
        <PosPelkesMap
          posPelkesList={filteredPos}
          selectedPos={selectedPos}
          onSelectPos={handleSelectPos}
        />
      </div>
    </>
  );
}

export default PetaClientShell;
