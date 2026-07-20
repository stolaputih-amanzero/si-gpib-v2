'use client';

import { useState, useMemo } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import Link from 'next/link';
import { MapPin, Calendar, ArrowRight, Map, Database, Plus, TrendingUp } from 'lucide-react';
import { StatusElevationModal } from '@/components/hierarki/StatusElevationModal';

interface PosPelkes {
  id_pos: string;
  id_induk?: string;
  nama_pos: string;
  kategori?: string | null;
  alamat: string | null;
  tgl_berdiri: string | null;
}

export function PosPelkesList({ initialData }: { initialData: PosPelkes[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [elevatePosItem, setElevatePosItem] = useState<{ id_pos: string; nama_pos: string; kategori?: string | null; id_induk: string } | null>(null);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    return initialData.filter((pos) => {
      const query = searchQuery.toLowerCase();
      return (
        pos.nama_pos.toLowerCase().includes(query) ||
        pos.id_pos.toLowerCase().includes(query) ||
        (pos.alamat && pos.alamat.toLowerCase().includes(query))
      );
    });
  }, [initialData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleOpenElevate = (e: React.MouseEvent, pos: PosPelkes) => {
    e.preventDefault();
    e.stopPropagation();
    setElevatePosItem({
      id_pos: pos.id_pos,
      nama_pos: pos.nama_pos,
      kategori: pos.kategori,
      id_induk: pos.id_induk || '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-elevated p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="w-full sm:max-w-md">
          <SearchBar
            placeholder="Cari nama atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link 
            href="/dashboard/peta"
            className="flex-1 sm:flex-none flex justify-center items-center px-4 py-2 bg-blue-50 text-brand-primary rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm border border-blue-200 min-h-[44px]"
          >
            <Map size={18} className="mr-2" />
            Peta
          </Link>
          <Link 
            href="/dashboard/pos-pelkes/baru"
            className="flex-1 sm:flex-none flex justify-center items-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-800 transition-colors font-medium text-sm shadow-sm min-h-[44px]"
          >
            <Plus size={18} className="mr-2" />
            Tambah Pos
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {filteredData.length > 0 ? (
          <>
            {/* Mobile View: Cards (< 768px) */}
            <div className="md:hidden space-y-4">
              {currentData.map((pos) => (
                <div
                  key={pos.id_pos}
                  className="p-5 bg-surface-elevated rounded-xl shadow-sm border border-gray-100 space-y-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-sunken border border-border-subtle text-text-muted">
                        {pos.id_pos} • {pos.kategori || 'Pos Pelkes'}
                      </span>
                      <h3 className="font-bold text-brand-primary text-base mt-1">{pos.nama_pos}</h3>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleOpenElevate(e, pos)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 text-xs font-bold flex items-center gap-1 hover:bg-amber-500/20 transition-colors min-h-[36px]"
                    >
                      <TrendingUp size={14} />
                      <span>Elevasi</span>
                    </button>
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-text-muted">
                    <div className="flex items-start">
                      <MapPin size={14} className="mr-2 mt-0.5 flex-shrink-0 text-brand-primary" />
                      <p className="line-clamp-2">{pos.alamat || 'Alamat belum diisi'}</p>
                    </div>
                    {pos.tgl_berdiri && (
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2 flex-shrink-0 text-brand-primary" />
                        <p>Berdiri: {pos.tgl_berdiri}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border-subtle flex justify-end">
                    <Link
                      href={`/dashboard/pos-pelkes/${pos.id_pos}`}
                      className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
                    >
                      <span>Detail Profil Pos</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table (>= 768px) */}
            <div className="hidden md:block bg-surface-elevated rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Nama Pos Pelkes / Bajem
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Alamat
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Tgl Berdiri
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData.map((pos) => (
                      <tr key={pos.id_pos} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-sunken border border-border-subtle text-text-muted">
                              {pos.kategori || 'Pos Pelkes'}
                            </span>
                            <div className="font-semibold text-brand-primary">{pos.nama_pos}</div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">ID: {pos.id_pos}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-text-high line-clamp-2">{pos.alamat || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pos.tgl_berdiri || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            type="button"
                            onClick={(e) => handleOpenElevate(e, pos)}
                            className="inline-flex items-center text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-md transition-colors text-xs font-bold"
                            title="Tingkatkan Status"
                          >
                            <TrendingUp size={14} className="mr-1" />
                            Elevasi Status
                          </button>

                          <Link 
                            href={`/dashboard/pos-pelkes/${pos.id_pos}`}
                            className="inline-flex items-center text-brand-primary hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors text-xs font-bold"
                          >
                            Detail <ArrowRight size={14} className="ml-1" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 min-h-[44px]"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 min-h-[44px]"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="font-medium">{filteredData.length}</span> hasil
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${
                            currentPage === i + 1 
                              ? 'z-10 bg-brand-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary' 
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                          } ${i === 0 ? 'rounded-l-md' : ''} ${i === totalPages - 1 ? 'rounded-r-md' : ''}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-surface-elevated rounded-xl shadow-sm border border-gray-100">
            <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-text-high">Tidak ada data</h3>
            <p className="mt-1 text-sm text-text-muted">
              Tidak ada Pos Pelkes yang cocok dengan pencarian Anda.
            </p>
          </div>
        )}
      </div>

      {/* Status Elevation Modal */}
      {elevatePosItem && (
        <StatusElevationModal
          isOpen={!!elevatePosItem}
          onClose={() => setElevatePosItem(null)}
          posItem={elevatePosItem}
        />
      )}
    </div>
  );
}
