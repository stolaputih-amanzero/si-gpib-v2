'use client';

import { useState } from 'react';
import {
  useKerawananList,
  usePosPelkesList,
  useDeleteKerawanan,
  KerawananItem,
} from '@/hooks/use-wilayah';
import { KerawananForm } from '@/components/wilayah/KerawananForm';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, Search, Filter, Trash2, X, AlertTriangle, Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function LaporanKerawananPage() {
  const [selectedPosFilter, setSelectedPosFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showKerawananModal, setShowKerawananModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: kerawananList, isLoading: isLoadingKerawanan } = useKerawananList(selectedPosFilter);
  const { data: posPelkesList } = usePosPelkesList();
  const deleteKerawananMutation = useDeleteKerawanan();

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

  const handleDeleteKerawanan = async (id_risiko: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data kerawanan ini?')) return;
    setDeletingId(id_risiko);
    try {
      await deleteKerawananMutation.mutateAsync(id_risiko);
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

  const getFrekuensiBadge = (frekuensi: KerawananItem['frekuensi']) => {
    switch (frekuensi) {
      case 'Kritis':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-300">Kritis</span>;
      case 'Tinggi':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300">Tinggi</span>;
      case 'Sedang':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300">Sedang</span>;
      case 'Rendah':
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">Rendah</span>;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">
            Analisis Kerawanan Wilayah
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-0.5">
            Pendataan Kerawanan Sosial, Alam, & Tantangan Pelayanan Pos
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowKerawananModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-soft min-h-[44px]"
        >
          <ShieldAlert size={18} />
          <span className="hidden sm:inline">+ Tambah Kerawanan</span>
          <span className="sm:hidden">+ Kerawanan</span>
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
            placeholder="Cari jenis risiko, kategori, atau nama pos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-9 pr-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Kerawanan Content */}
      <div className="space-y-4">
        {isLoadingKerawanan ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : filteredKerawanan.length === 0 ? (
          <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle text-text-muted space-y-2">
            <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 opacity-60" />
            <p className="text-sm font-semibold">Belum ada data kerawanan yang terdaftar.</p>
            <p className="text-xs">Klik tombol "+ Tambah Kerawanan" untuk mendata risiko wilayah.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        )}
      </div>

      {/* Modal Form */}
      {showKerawananModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface-elevated rounded-3xl p-2 shadow-heavy border border-border-subtle relative animate-slide-up">
            <button
              onClick={() => setShowKerawananModal(false)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-high rounded-full bg-surface-sunken transition-colors z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
    </div>
  );
}
