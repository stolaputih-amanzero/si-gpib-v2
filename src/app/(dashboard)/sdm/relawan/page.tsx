'use client';

import { useState } from 'react';
import { useRelawanList, useDeleteRelawan, RelawanItem } from '@/hooks/use-relawan';
import { RelawanCard } from '@/components/relawan/RelawanCard';
import { RelawanForm } from '@/components/relawan/RelawanForm';
import { useToast } from '@/components/ui/toast';
import { Plus, Search, HeartHandshake } from 'lucide-react';

export default function RelawanPage() {
  const { toast, confirm: confirmModal } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPos, setSelectedPos] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<RelawanItem | null>(null);

  const { data: relawanList, isLoading } = useRelawanList(
    selectedPos || undefined,
    searchQuery || undefined
  );

  const deleteMutation = useDeleteRelawan();

  const handleEdit = (item: RelawanItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleDelete = (id_relawan: string) => {
    confirmModal({
      title: 'Hapus Data Relawan',
      message: 'Apakah Anda yakin ingin menghapus data relawan ini?',
      confirmText: 'Hapus Relawan',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id_relawan);
          toast.success('Berhasil Dihapus', 'Data relawan telah dihapus.');
        } catch {
          toast.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus data.');
        }
      },
    });
  };

  const totalRelawan = relawanList?.length || 0;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">Data Relawan Pos Pelkes</h1>
          <p className="text-xs md:text-sm text-text-muted mt-0.5">Relawan Pemuda, Pelayanan Medis & Kemasyarakatan</p>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-dark transition-all flex items-center gap-2 shadow-soft min-h-[44px]"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Tambah Relawan</span>
          <span className="sm:hidden">+ Relawan</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-text-muted font-medium">Total Relawan</p>
          <p className="text-2xl font-serif font-bold text-brand-primary tabular-nums mt-1">{totalRelawan}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Seluruh Kategori</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft sm:col-span-2">
          <p className="text-xs text-text-muted font-medium">Filter Pos Pelkes</p>
          <input
            type="text"
            placeholder="Filter ID Pos..."
            value={selectedPos}
            onChange={(e) => setSelectedPos(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Cari relawan (nama, kategori, pelatihan)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
          />
        </div>
      </div>

      {/* Relawan List */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-text-high">
          Daftar Relawan ({relawanList?.length || 0})
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle animate-pulse space-y-3">
                <div className="h-4 bg-surface-sunken rounded w-3/4"></div>
                <div className="h-3 bg-surface-sunken rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : relawanList && relawanList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relawanList.map((item) => (
              <RelawanCard
                key={item.id_relawan}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface-elevated rounded-2xl p-8 text-center border border-border-subtle space-y-2">
            <HeartHandshake size={36} className="mx-auto text-text-muted opacity-50" />
            <p className="font-semibold text-text-high text-sm">Belum Ada Relawan Terdaftar</p>
            <p className="text-xs text-text-muted">
              Klik tombol "+ Tambah Relawan" untuk mendata relawan baru.
            </p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 className="text-base font-serif font-bold text-brand-primary">
                {editingItem ? 'Edit Data Relawan' : 'Input Relawan Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                ✕
              </button>
            </div>

            <RelawanForm
              initialData={editingItem}
              onSuccess={() => {
                setShowModal(false);
                toast.success('Berhasil Disimpan', 'Data relawan telah diperbarui.');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
