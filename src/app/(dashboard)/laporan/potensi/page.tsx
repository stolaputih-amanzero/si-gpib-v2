'use client';

import { useState } from 'react';
import {
  usePotensiList,
  usePosPelkesList,
  useDeletePotensi,
  PotensiItem,
} from '@/hooks/use-wilayah';
import { PotensiForm } from '@/components/wilayah/PotensiForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Search, Filter, Trash2, X, Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function LaporanPotensiPage() {
  const [selectedPosFilter, setSelectedPosFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPotensiModal, setShowPotensiModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: potensiList, isLoading: isLoadingPotensi } = usePotensiList(selectedPosFilter);
  const { data: posPelkesList } = usePosPelkesList();
  const deletePotensiMutation = useDeletePotensi();

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

  const handleDeletePotensi = async (id_potensi: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data potensi ini?')) return;
    setDeletingId(id_potensi);
    try {
      await deletePotensiMutation.mutateAsync(id_potensi);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateStr = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">
            Potensi Wilayah & Sumber Daya Pos
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-0.5">
            Pendataan Peluang Ekonomi, Sosial, Kemitraan & SDM Pos Pelkes
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPotensiModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-soft min-h-[44px]"
        >
          <Sparkles size={18} />
          <span className="hidden sm:inline">+ Tambah Potensi</span>
          <span className="sm:hidden">+ Potensi</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
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
            placeholder="Cari potensi, deskripsi, atau pos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-9 pr-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Potensi Content */}
      <div className="space-y-4">
        {isLoadingPotensi ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : filteredPotensi.length === 0 ? (
          <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle text-text-muted space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
            <p className="text-sm font-semibold">Belum ada data potensi yang terdaftar.</p>
            <p className="text-xs">Klik tombol "+ Tambah Potensi" untuk mendata potensi wilayah.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
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
        )}
      </div>

      {/* Modal Form */}
      {showPotensiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface-elevated rounded-3xl p-2 shadow-heavy border border-border-subtle relative animate-slide-up">
            <button
              onClick={() => setShowPotensiModal(false)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-high rounded-full bg-surface-sunken transition-colors z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
