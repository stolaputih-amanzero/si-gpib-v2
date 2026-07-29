'use client';

import { useState, useMemo, useEffect } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { cleanQuotes } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, ArrowRight, Map, Database, Plus, TrendingUp } from 'lucide-react';
import { StatusElevationModal } from '@/components/hierarki/StatusElevationModal';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PosPelkes {
  id_pos: string;
  id_induk?: string;
  nama_pos: string;
  kategori?: string | null;
  alamat: string | null;
  tgl_berdiri: string | null;
  jemaat_induk?: {
    id_induk: string;
    nama_induk: string;
    id_mupel: string;
    mupel?: {
      id_mupel: string;
      nama_mupel: string;
    } | null;
  } | null;
}

export function PosPelkesList({ initialData }: { initialData: PosPelkes[] }) {
  const router = useRouter();
  const [dataList, setDataList] = useState<PosPelkes[]>(initialData || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMupel, setSelectedMupel] = useState('');
  const [selectedJemaat, setSelectedJemaat] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [elevatePosItem, setElevatePosItem] = useState<{ id_pos: string; nama_pos: string; kategori?: string | null; id_induk: string } | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setDataList(initialData);
      try {
        localStorage.setItem('draft:pos-pelkes-cache', JSON.stringify(initialData));
      } catch {}
    } else {
      try {
        const cached = localStorage.getItem('draft:pos-pelkes-cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDataList(parsed);
          }
        }
      } catch {}
    }
  }, [initialData]);

  const handleRefresh = async () => {
    router.refresh();
  };

  const mupelOptions = useMemo(() => {
    const mupels: Record<string, string> = {};
    dataList.forEach((pos) => {
      const jemaatObj = pos.jemaat_induk;
      const j = Array.isArray(jemaatObj) ? jemaatObj[0] : jemaatObj;
      const mupelObj = j?.mupel;
      const m = Array.isArray(mupelObj) ? mupelObj[0] : mupelObj;
      
      if (m?.id_mupel && m?.nama_mupel) {
        mupels[m.id_mupel] = cleanQuotes(m.nama_mupel);
      }
    });
    return Object.entries(mupels)
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [dataList]);

  const jemaatOptions = useMemo(() => {
    const jemaats: Record<string, string> = {};
    dataList.forEach((pos) => {
      const jemaatObj = pos.jemaat_induk;
      const j = Array.isArray(jemaatObj) ? jemaatObj[0] : jemaatObj;
      if (j?.id_induk && j?.nama_induk) {
        if (!selectedMupel || j.id_mupel === selectedMupel) {
          jemaats[j.id_induk] = cleanQuotes(j.nama_induk);
        }
      }
    });
    return Object.entries(jemaats)
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [dataList, selectedMupel]);

  const filteredData = useMemo(() => {
    const list = dataList.filter((pos) => {
      const jemaatObj = pos.jemaat_induk;
      const j = Array.isArray(jemaatObj) ? jemaatObj[0] : jemaatObj;
      const mupelObj = j?.mupel;
      const m = Array.isArray(mupelObj) ? mupelObj[0] : mupelObj;

      if (searchQuery) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = pos.nama_pos ? cleanQuotes(pos.nama_pos).toLowerCase().includes(query) : false;
        const matchesId = pos.id_pos ? pos.id_pos.toLowerCase().includes(query) : false;
        const matchesAddress = pos.alamat ? cleanQuotes(pos.alamat).toLowerCase().includes(query) : false;
        
        const jemaatName = j?.nama_induk ? cleanQuotes(j.nama_induk).toLowerCase() : '';
        const jemaatId = j?.id_induk ? j.id_induk.toLowerCase() : '';
        const mupelName = m?.nama_mupel ? cleanQuotes(m.nama_mupel).toLowerCase() : '';
        const mupelId = j?.id_mupel ? j.id_mupel.toLowerCase() : '';

        const matchesJemaat = jemaatName.includes(query) || jemaatId.includes(query);
        const matchesMupel = mupelName.includes(query) || mupelId.includes(query);
        
        if (!matchesName && !matchesId && !matchesAddress && !matchesJemaat && !matchesMupel) {
          return false;
        }
      }

      if (selectedMupel && j?.id_mupel !== selectedMupel) {
        return false;
      }

      if (selectedJemaat && j?.id_induk !== selectedJemaat) {
        return false;
      }

      return true;
    });

    if (searchQuery) {
      const query = searchQuery.trim().toLowerCase();
      
      const getRelevanceScore = (posItem: PosPelkes) => {
        const jemaatObj = posItem.jemaat_induk;
        const j = Array.isArray(jemaatObj) ? jemaatObj[0] : jemaatObj;
        const mupelObj = j?.mupel;
        const m = Array.isArray(mupelObj) ? mupelObj[0] : mupelObj;

        let score = 0;
        const name = posItem.nama_pos ? cleanQuotes(posItem.nama_pos).toLowerCase() : '';
        if (name === query) score += 100;
        else if (name.startsWith(query)) score += 50;
        else if (name.includes(query)) score += 20;

        const id = posItem.id_pos ? posItem.id_pos.toLowerCase() : '';
        if (id === query) score += 40;
        else if (id.includes(query)) score += 10;

        const jName = j?.nama_induk ? cleanQuotes(j.nama_induk).toLowerCase() : '';
        if (jName === query) score += 8;
        else if (jName.includes(query)) score += 4;

        const mName = m?.nama_mupel ? cleanQuotes(m.nama_mupel).toLowerCase() : '';
        if (mName === query) score += 4;
        else if (mName.includes(query)) score += 2;

        const address = posItem.alamat ? cleanQuotes(posItem.alamat).toLowerCase() : '';
        if (address.includes(query)) score += 1;

        return score;
      };

      return [...list].sort((a, b) => getRelevanceScore(b) - getRelevanceScore(a));
    }

    return list;
  }, [dataList, searchQuery, selectedMupel, selectedJemaat]);

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
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-4 pb-24">
        <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="w-full md:max-w-xl">
              <SearchBar
                placeholder="Cari nama pos, ID, alamat, jemaat, atau mupel..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
              <Button asChild variant="outline" className="flex-1 md:flex-none min-h-[44px]">
                <Link href="/dashboard/peta">
                  <Map size={18} className="mr-2" />
                  Peta
                </Link>
              </Button>
              <Button asChild variant="default" className="flex-1 md:flex-none min-h-[44px]">
                <Link href="/dashboard/pos-pelkes/baru">
                  <Plus size={18} className="mr-2" />
                  Tambah Pos
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border-subtle">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-primary">Saring berdasarkan Mupel</label>
              <select
                value={selectedMupel}
                onChange={(e) => {
                  setSelectedMupel(e.target.value);
                  setSelectedJemaat('');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-sunken text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
              >
                <option value="">Semua Mupel</option>
                {mupelOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-primary">Saring berdasarkan Jemaat Induk</label>
              <select
                value={selectedJemaat}
                onChange={(e) => {
                  setSelectedJemaat(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-sunken text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
              >
                <option value="">Semua Jemaat Induk</option>
                {jemaatOptions.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredData.length > 0 ? (
            <>
              {/* Mobile Card List (< 768px) */}
              <div className="md:hidden space-y-3">
                {currentData.map((pos) => {
                  const jemaatObj = pos.jemaat_induk;
                  const j = Array.isArray(jemaatObj) ? jemaatObj[0] : jemaatObj;
                  const mupelObj = j?.mupel;
                  const m = Array.isArray(mupelObj) ? mupelObj[0] : mupelObj;
                  const cleanedName = cleanQuotes(pos.nama_pos);
                  const cleanedJemaat = j?.nama_induk ? cleanQuotes(j.nama_induk) : '';
                  const cleanedMupel = m?.nama_mupel ? cleanQuotes(m.nama_mupel) : '';

                  return (
                    <Card
                      key={pos.id_pos}
                      className="cursor-pointer hover:border-brand-primary/40 transition-all active:scale-[0.99]"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button, a')) return;
                        router.push(`/dashboard/pos-pelkes/${pos.id_pos}`);
                      }}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-surface-sunken border border-border-subtle text-text-secondary inline-block">
                              {pos.id_pos} • {pos.kategori || 'Pos Pelkes'}
                            </span>
                            <h3 className="font-bold text-brand-primary text-base mt-1.5 leading-snug">{cleanedName}</h3>
                            {j && (
                              <div className="text-xs font-medium text-text-secondary mt-1">
                                Induk: {cleanedJemaat} {m ? `(Mupel: ${cleanedMupel})` : ''}
                              </div>
                            )}
                          </div>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={(e) => handleOpenElevate(e, pos)}
                            className="min-h-[44px] shrink-0 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-200 dark:border-amber-900/40"
                          >
                            <TrendingUp size={14} className="mr-1" />
                            <span>Elevasi</span>
                          </Button>
                        </div>
                        
                        <div className="space-y-1.5 text-xs text-text-secondary pt-1 border-t border-border-subtle">
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

                        <div className="pt-2 flex justify-end">
                          <Button asChild variant="ghost" size="sm" className="min-h-[44px] text-brand-primary font-bold">
                            <Link href={`/dashboard/pos-pelkes/${pos.id_pos}`}>
                              <span>Detail Profil Pos</span>
                              <ArrowRight size={14} className="ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block bg-surface-elevated rounded-xl shadow-sm border border-border-subtle overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border-subtle">
                    <thead className="bg-surface-sunken">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                          Nama Pos Pelkes / Bajem
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                          Alamat
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">
                          Tgl Berdiri
                        </th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface-elevated divide-y divide-border-subtle">
                      {currentData.map((pos) => {
                        const jemaatObj = pos.jemaat_induk;
                        const j = Array.isArray(jemaatObj) ? jemaatObj[0] : jemaatObj;
                        const mupelObj = j?.mupel;
                        const m = Array.isArray(mupelObj) ? mupelObj[0] : mupelObj;
                        const cleanedName = cleanQuotes(pos.nama_pos);
                        const cleanedJemaat = j?.nama_induk ? cleanQuotes(j.nama_induk) : '';
                        const cleanedMupel = m?.nama_mupel ? cleanQuotes(m.nama_mupel) : '';
                        const cleanedAddress = pos.alamat ? cleanQuotes(pos.alamat) : '';

                        return (
                          <tr 
                            key={pos.id_pos} 
                            className="hover:bg-surface-sunken/60 transition-colors cursor-pointer"
                            onClick={(e) => {
                              if ((e.target as HTMLElement).closest('button, a')) return;
                              router.push(`/dashboard/pos-pelkes/${pos.id_pos}`);
                            }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-sunken border border-border-subtle text-text-secondary">
                                  {pos.kategori || 'Pos Pelkes'}
                                </span>
                                <div className="font-semibold text-brand-primary">{cleanedName}</div>
                              </div>
                              <div className="text-xs text-text-secondary mt-1 space-x-2">
                                <span>ID: {pos.id_pos}</span>
                                {j && (
                                  <>
                                    <span>•</span>
                                    <span className="font-medium text-text-primary">Induk: {cleanedJemaat}</span>
                                  </>
                                )}
                                {m && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-600 dark:text-amber-400">Mupel: {cleanedMupel}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-text-primary line-clamp-2">{cleanedAddress || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                              {pos.tgl_berdiri || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={(e) => handleOpenElevate(e, pos)}
                                className="min-h-[44px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                              >
                                <TrendingUp size={14} className="mr-1" />
                                Elevasi Status
                              </Button>

                              <Button asChild variant="outline" size="sm" className="min-h-[44px]">
                                <Link href={`/dashboard/pos-pelkes/${pos.id_pos}`}>
                                  Detail <ArrowRight size={14} className="ml-1" />
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border-subtle bg-surface-elevated px-4 py-3 sm:px-6 rounded-xl shadow-sm">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="min-h-[44px]"
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="min-h-[44px] ml-3"
                    >
                      Selanjutnya
                    </Button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">
                        Menampilkan <span className="font-medium text-text-primary">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-medium text-text-primary">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="font-medium text-text-primary">{filteredData.length}</span> hasil
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <Button
                            key={i}
                            variant={currentPage === i + 1 ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(i + 1)}
                            className="min-h-[44px] rounded-none first:rounded-l-md last:rounded-r-md"
                          >
                            {i + 1}
                          </Button>
                        ))}
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-surface-elevated rounded-xl shadow-sm border border-border-subtle space-y-3">
              <Database className="mx-auto h-12 w-12 text-text-tertiary" />
              <h3 className="text-base font-semibold text-text-primary">Tidak ada data Pos Pelkes</h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto">
                Tidak ada Pos Pelkes yang cocok dengan kriteria pencarian Anda.
              </p>
              <Button asChild className="min-h-[44px] mt-2">
                <Link href="/dashboard/pos-pelkes/baru">
                  <Plus size={16} className="mr-1.5" />
                  Tambah Pos Pelkes Baru
                </Link>
              </Button>
            </div>
          )}
        </div>

        {elevatePosItem && (
          <StatusElevationModal
            isOpen={!!elevatePosItem}
            onClose={() => setElevatePosItem(null)}
            posItem={elevatePosItem}
          />
        )}
      </div>
    </PullToRefresh>
  );
}
