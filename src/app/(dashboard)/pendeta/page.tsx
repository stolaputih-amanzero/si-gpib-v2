'use client';

import { useState } from 'react';
import { usePendetaList, useDeletePendeta, PendetaItem } from '@/hooks/use-pendeta';
import { PendetaCard } from '@/components/pendeta/PendetaCard';
import { PendetaForm } from '@/components/pendeta/PendetaForm';
import { Plus, Search, UserCheck, Crown, ShieldCheck } from 'lucide-react';

export default function PendetaOverviewPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInduk, setSelectedInduk] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<PendetaItem | null>(null);

  const { data: pendetaList, isLoading } = usePendetaList(
    selectedInduk || undefined,
    searchQuery || undefined
  );

  const deleteMutation = useDeletePendeta();

  const handleEdit = (item: PendetaItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleDelete = async (id_pendeta: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pendeta ini?')) {
      await deleteMutation.mutateAsync(id_pendeta);
    }
  };

  const totalPendeta = pendetaList?.length || 0;
  const totalKmj = pendetaList?.filter((p) => p.is_kmj).length || 0;
  const totalPj = pendetaList?.filter((p) => p.is_pj).length || 0;

  return (
    <div className="w-full min-h-full bg-surface-base pb-32 md:pb-12">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">Manajemen Pendeta GPIB</h1>
            <p className="text-xs md:text-sm text-text-muted mt-0.5">Pendeta Jemaat, KMJ & Penanggung Jawab Pos Pelkes</p>
          </div>

          <button
            type="button"
            onClick={handleAddNew}
            className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Tambah Pendeta</span>
            <span className="sm:hidden">+ Pendeta</span>
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-5 space-y-6">
        {/* KPI Cards Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-text-muted font-medium">Total Pendeta</p>
            <p className="text-2xl font-serif font-bold text-brand-primary tabular-nums mt-1">{totalPendeta}</p>
            <p className="text-[11px] text-text-muted mt-0.5">Terdaftar di Sistem</p>
          </div>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <Crown size={12} />
              <span>Ketua Majelis (KMJ)</span>
            </p>
            <p className="text-2xl font-serif font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-1">{totalKmj}</p>
            <p className="text-[11px] text-text-muted mt-0.5">KMJ Jemaat Induk</p>
          </div>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>PJ Pos Pelkes</span>
            </p>
            <p className="text-2xl font-serif font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-1">{totalPj}</p>
            <p className="text-[11px] text-text-muted mt-0.5">Penanggung Jawab Pos</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                placeholder="Cari pendeta (nama, jabatan, jemaat induk)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Filter ID Jemaat Induk (misal: IND-13055)"
                value={selectedInduk}
                onChange={(e) => setSelectedInduk(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Pendeta List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-high">
              Daftar Pendeta ({pendetaList?.length || 0})
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-surface-elevated p-4 rounded-xl border border-border-subtle animate-pulse space-y-3">
                  <div className="h-4 bg-surface-sunken rounded w-3/4"></div>
                  <div className="h-3 bg-surface-sunken rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : pendetaList && pendetaList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendetaList.map((item) => (
                <PendetaCard
                  key={item.id_pendeta}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface-elevated rounded-xl p-8 text-center border border-border-subtle space-y-2">
              <UserCheck size={36} className="mx-auto text-text-muted opacity-50" />
              <p className="font-semibold text-text-high text-sm">Belum Ada Pendeta Terdaftar</p>
              <p className="text-xs text-text-muted">
                Klik tombol "+ Tambah Pendeta" untuk mendaftarkan pendeta baru.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Input/Edit Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 border border-border-subtle shadow-float max-h-[90vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 className="text-base font-bold text-brand-primary">
                {editingItem ? 'Edit Data Pendeta' : 'Input Pendeta Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high"
              >
                ✕
              </button>
            </div>

            <PendetaForm
              initialData={editingItem}
              onSuccess={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
