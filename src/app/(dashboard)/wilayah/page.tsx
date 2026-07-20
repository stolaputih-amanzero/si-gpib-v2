'use client';

import { useState } from 'react';
import {
  useWilayahMapData,
  useKerawananList,
  usePotensiList,
  usePosPelkesList,
  useDeleteKerawanan,
  useDeletePotensi,
  KerawananItem,
  PotensiItem,
} from '@/hooks/use-wilayah';
import { WilayahMap } from '@/components/wilayah/WilayahMap';
import { KerawananForm } from '@/components/wilayah/KerawananForm';
import { PotensiForm } from '@/components/wilayah/PotensiForm';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin,
  ShieldAlert,
  Sparkles,
  Search,
  Filter,
  Trash2,
  X,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { format } from 'date-fns';

type TabType = 'map' | 'kerawanan' | 'potensi';

export default function WilayahPage() {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [selectedPosFilter, setSelectedPosFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal Form States
  const [showKerawananModal, setShowKerawananModal] = useState(false);
  const [showPotensiModal, setShowPotensiModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Queries
  const { data: mapData, isLoading: isLoadingMap } = useWilayahMapData();
  const { data: kerawananList, isLoading: isLoadingKerawanan } = useKerawananList(selectedPosFilter);
  const { data: potensiList, isLoading: isLoadingPotensi } = usePotensiList(selectedPosFilter);
  const { data: posPelkesList } = usePosPelkesList();

  // Mutations
  const deleteKerawananMutation = useDeleteKerawanan();
  const deletePotensiMutation = useDeletePotensi();

  // Filtered Kerawanan List
  const filteredKerawanan = (kerawananList || []).filter((k) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      k.jenis_risiko.toLowerCase().includes(q) ||
      k.kategori.toLowerCase().includes(q) ||
      (k.pos?.nama_pos || '').toLowerCase().includes(q) ||
      (k.keterangan || '').toLowerCase().includes(q)
    );
  });

  // Filtered Potensi List
  const filteredPotensi = (potensiList || []).filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.nama_potensi.toLowerCase().includes(q) ||
      p.kategori.toLowerCase().includes(q) ||
      p.deskripsi.toLowerCase().includes(q) ||
      (p.pos?.nama_pos || '').toLowerCase().includes(q)
    );
  });

  // Handle Delete Kerawanan
  const handleDeleteKerawanan = async (id_risiko: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data kerawanan ini?')) return;
    setDeletingId(id_risiko);
    try {
      await deleteKerawananMutation.mutateAsync(id_risiko);
    } finally {
      setDeletingId(null);
    }
  };

  // Handle Delete Potensi
  const handleDeletePotensi = async (id_potensi: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data potensi ini?')) return;
    setDeletingId(id_potensi);
    try {
      await deletePotensiMutation.mutateAsync(id_potensi);
    } finally {
      setDeletingId(null);
    }
  };

  // Format Date Safely
  const formatDateStr = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  // Frekuensi Badge Helper
  const getFrekuensiBadge = (frekuensi: KerawananItem['frekuensi']) => {
    switch (frekuensi) {
      case 'Kritis':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800">Kritis</span>;
      case 'Tinggi':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800">Tinggi</span>;
      case 'Sedang':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">Sedang</span>;
      case 'Rendah':
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">Rendah</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-text-high tracking-tight">
              Peta & Analisis Wilayah
            </h1>
          </div>
          <p className="text-xs md:text-sm text-text-muted">
            Visualisasi Geospatial Kerawanan & Potensi Pos Pelkes GPIB (US-13.1, US-13.2, US-13.3)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowKerawananModal(true)}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <ShieldAlert size={16} />
            <span>+ Tambah Kerawanan</span>
          </button>

          <button
            onClick={() => setShowPotensiModal(true)}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles size={16} />
            <span>+ Tambah Potensi</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft">
        <div className="w-full sm:w-64 relative">
          <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <select
            value={selectedPosFilter}
            onChange={(e) => setSelectedPosFilter(e.target.value)}
            className="w-full min-h-[44px] pl-9 pr-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">Semua Pos Pelkes</option>
            {posPelkesList?.map((pos) => (
              <option key={pos.id_pos} value={pos.id_pos}>
                {pos.nama_pos}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Cari risiko, potensi, atau lokasi pos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-9 pr-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-surface-sunken rounded-2xl border border-border-subtle">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'map'
              ? 'bg-surface-elevated text-brand-primary shadow-sm border border-border-subtle'
              : 'text-text-muted hover:text-text-high'
          }`}
        >
          <MapPin size={16} />
          <span>Peta Sebaran</span>
          {mapData && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-primary/10 text-brand-primary tabular-nums">
              {mapData.length} Pos
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('kerawanan')}
          className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'kerawanan'
              ? 'bg-surface-elevated text-amber-600 shadow-sm border border-border-subtle'
              : 'text-text-muted hover:text-text-high'
          }`}
        >
          <ShieldAlert size={16} />
          <span>Daftar Kerawanan</span>
          {kerawananList && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 tabular-nums">
              {filteredKerawanan.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('potensi')}
          className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'potensi'
              ? 'bg-surface-elevated text-emerald-600 shadow-sm border border-border-subtle'
              : 'text-text-muted hover:text-text-high'
          }`}
        >
          <Sparkles size={16} />
          <span>Daftar Potensi</span>
          {potensiList && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 tabular-nums">
              {filteredPotensi.length}
            </span>
          )}
        </button>
      </div>

      {/* 4. TAB CONTENT: PETA SEBARAN */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          {isLoadingMap ? (
            <Skeleton className="w-full h-[60vh] md:h-[70vh] rounded-2xl" />
          ) : (
            <WilayahMap data={mapData || []} selectedPosId={selectedPosFilter !== 'all' ? selectedPosFilter : undefined} />
          )}
        </div>
      )}

      {/* 5. TAB CONTENT: DAFTAR KERAWANAN */}
      {activeTab === 'kerawanan' && (
        <div className="space-y-4">
          {isLoadingKerawanan ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : filteredKerawanan.length === 0 ? (
            <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle text-text-muted space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 opacity-60" />
              <p className="text-sm font-semibold">Belum ada data kerawanan yang terdaftar.</p>
              <p className="text-xs">Klik tombol "+ Tambah Kerawanan" di atas untuk mendata risiko wilayah.</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {filteredKerawanan.map((item: KerawananItem) => (
                  <div
                    key={item.id_risiko}
                    className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-soft space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                          {item.kategori}
                        </span>
                        <h3 className="font-bold text-text-high text-sm">{item.jenis_risiko}</h3>
                      </div>
                      {getFrekuensiBadge(item.frekuensi)}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Building2 size={14} className="shrink-0" />
                      <span className="font-semibold text-text-high">{item.pos?.nama_pos || item.id_pos}</span>
                    </div>

                    {item.keterangan && (
                      <p className="text-xs text-text-muted bg-surface-sunken p-2.5 rounded-xl border border-border-subtle line-clamp-2">
                        {item.keterangan}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-[11px] text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDateStr(item.created_at)}
                      </span>
                      <button
                        onClick={() => handleDeleteKerawanan(item.id_risiko)}
                        disabled={deletingId === item.id_risiko}
                        className="text-red-500 hover:text-red-700 min-h-[36px] px-2 flex items-center gap-1 font-semibold transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-hidden rounded-2xl border border-border-subtle bg-surface-elevated shadow-soft">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-sunken text-xs font-extrabold text-text-muted uppercase tracking-wider">
                      <th className="p-4">Pos Pelkes</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Jenis Risiko</th>
                      <th className="p-4">Frekuensi</th>
                      <th className="p-4">Keterangan</th>
                      <th className="p-4">Tanggal Input</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-xs font-medium text-text-high">
                    {filteredKerawanan.map((item: KerawananItem) => (
                      <tr key={item.id_risiko} className="hover:bg-surface-sunken/50 transition-colors">
                        <td className="p-4 font-bold">{item.pos?.nama_pos || item.id_pos}</td>
                        <td className="p-4 text-text-muted">{item.kategori}</td>
                        <td className="p-4 font-bold text-amber-700 dark:text-amber-400">{item.jenis_risiko}</td>
                        <td className="p-4">{getFrekuensiBadge(item.frekuensi)}</td>
                        <td className="p-4 text-text-muted max-w-xs truncate">{item.keterangan || '-'}</td>
                        <td className="p-4 text-text-muted">{formatDateStr(item.created_at)}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteKerawanan(item.id_risiko)}
                            disabled={deletingId === item.id_risiko}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
                            title="Hapus data"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* 6. TAB CONTENT: DAFTAR POTENSI */}
      {activeTab === 'potensi' && (
        <div className="space-y-4">
          {isLoadingPotensi ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : filteredPotensi.length === 0 ? (
            <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle text-text-muted space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
              <p className="text-sm font-semibold">Belum ada data potensi yang terdaftar.</p>
              <p className="text-xs">Klik tombol "+ Tambah Potensi" di atas untuk mendata potensi wilayah.</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {filteredPotensi.map((item: PotensiItem) => (
                  <div
                    key={item.id_potensi}
                    className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-soft space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                          {item.kategori}
                        </span>
                        <h3 className="font-bold text-text-high text-sm">{item.nama_potensi}</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        {item.kategori.split(' ')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Building2 size={14} className="shrink-0" />
                      <span className="font-semibold text-text-high">{item.pos?.nama_pos || item.id_pos}</span>
                    </div>

                    <p className="text-xs text-text-muted bg-surface-sunken p-2.5 rounded-xl border border-border-subtle line-clamp-2">
                      {item.deskripsi}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-[11px] text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDateStr(item.created_at)}
                      </span>
                      <button
                        onClick={() => handleDeletePotensi(item.id_potensi)}
                        disabled={deletingId === item.id_potensi}
                        className="text-red-500 hover:text-red-700 min-h-[36px] px-2 flex items-center gap-1 font-semibold transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-hidden rounded-2xl border border-border-subtle bg-surface-elevated shadow-soft">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-sunken text-xs font-extrabold text-text-muted uppercase tracking-wider">
                      <th className="p-4">Pos Pelkes</th>
                      <th className="p-4">Nama Potensi</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Deskripsi</th>
                      <th className="p-4">Keterangan</th>
                      <th className="p-4">Tanggal Input</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-xs font-medium text-text-high">
                    {filteredPotensi.map((item: PotensiItem) => (
                      <tr key={item.id_potensi} className="hover:bg-surface-sunken/50 transition-colors">
                        <td className="p-4 font-bold">{item.pos?.nama_pos || item.id_pos}</td>
                        <td className="p-4 font-bold text-emerald-700 dark:text-emerald-400">{item.nama_potensi}</td>
                        <td className="p-4 text-text-muted">{item.kategori}</td>
                        <td className="p-4 text-text-muted max-w-xs truncate">{item.deskripsi}</td>
                        <td className="p-4 text-text-muted max-w-xs truncate">{item.keterangan || '-'}</td>
                        <td className="p-4 text-text-muted">{formatDateStr(item.created_at)}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeletePotensi(item.id_potensi)}
                            disabled={deletingId === item.id_potensi}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
                            title="Hapus data"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* 7. MODAL FORM: KERAWANAN */}
      {showKerawananModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface-elevated rounded-3xl p-2 shadow-float border border-border-subtle relative">
            <button
              onClick={() => setShowKerawananModal(false)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-high rounded-full bg-surface-sunken transition-colors z-10"
            >
              <X size={18} />
            </button>
            <KerawananForm
              defaultPosId={selectedPosFilter !== 'all' ? selectedPosFilter : undefined}
              onSuccess={() => setShowKerawananModal(false)}
              onCancel={() => setShowKerawananModal(false)}
            />
          </div>
        </div>
      )}

      {/* 8. MODAL FORM: POTENSI */}
      {showPotensiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface-elevated rounded-3xl p-2 shadow-float border border-border-subtle relative">
            <button
              onClick={() => setShowPotensiModal(false)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-high rounded-full bg-surface-sunken transition-colors z-10"
            >
              <X size={18} />
            </button>
            <PotensiForm
              defaultPosId={selectedPosFilter !== 'all' ? selectedPosFilter : undefined}
              onSuccess={() => setShowPotensiModal(false)}
              onCancel={() => setShowPotensiModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
