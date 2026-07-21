'use client';

import { useState } from 'react';
import { usePelayanList, useDeletePelayan, PelayanItem } from '@/hooks/use-pelayan';
import { PelayanCard } from '@/components/pelayan/PelayanCard';
import { PelayanForm } from '@/components/pelayan/PelayanForm';
import { useToast } from '@/components/ui/toast';
import { Plus, Search, Users } from 'lucide-react';

export default function PelayanPage() {
  const { toast, confirm: confirmModal } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPos, setSelectedPos] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<PelayanItem | null>(null);

  const { data: pelayanList, isLoading } = usePelayanList(
    selectedPos || undefined,
    searchQuery || undefined
  );

  const deleteMutation = useDeletePelayan();

  const handleEdit = (item: PelayanItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleDelete = (id_pelayan: string) => {
    confirmModal({
      title: 'Hapus Pelayan Pos',
      message: 'Apakah Anda yakin ingin menghapus data pelayan ini?',
      confirmText: 'Hapus Pelayan',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id_pelayan);
          toast.success('Berhasil Dihapus', 'Data pelayan telah dihapus.');
        } catch {
          toast.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus data.');
        }
      },
    });
  };

  const totalPelayan = pelayanList?.length || 0;
  const aktifCount = pelayanList?.filter((p) => p.status === 'Aktif').length || 0;

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">Data Pelayan Pos Pelkes</h1>
          <p className="text-xs md:text-sm text-text-muted mt-0.5">Pendeta Pos, Penatua & Diaken Pelayan Field</p>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-dark transition-all flex items-center gap-2 shadow-soft min-h-[44px]"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Tambah Pelayan</span>
          <span className="sm:hidden">+ Pelayan</span>
        </button>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-text-muted font-medium">Total Pelayan</p>
          <p className="text-2xl font-serif font-bold text-brand-primary tabular-nums mt-1">{totalPelayan}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Seluruh Pos Pelkes</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Pelayan Aktif</p>
          <p className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">{aktifCount}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Aktif Melayani</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft col-span-2 md:col-span-1">
          <p className="text-xs text-text-muted font-medium">Filter Pos Pelkes</p>
          <input
            type="text"
            placeholder="Filter ID Pos..."
            value={selectedPos}
            onChange={(e) => setSelectedPos(e.target.value)}
            className="w-full mt-1.5 px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[36px]"
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Cari pelayan (nama, jabatan, pos pelkes)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
          />
        </div>
      </div>

      {/* Pelayan List */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-text-high">
          Daftar Pelayan ({pelayanList?.length || 0})
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
        ) : pelayanList && pelayanList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pelayanList.map((item) => (
              <PelayanCard
                key={item.id_pelayan}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface-elevated rounded-2xl p-8 text-center border border-border-subtle space-y-2">
            <Users size={36} className="mx-auto text-text-muted opacity-50" />
            <p className="font-semibold text-text-high text-sm">Belum Ada Pelayan Terdaftar</p>
            <p className="text-xs text-text-muted">
              Klik tombol "+ Tambah Pelayan" untuk menginput pelayan Pos Pelkes pertama.
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
                {editingItem ? 'Edit Data Pelayan' : 'Input Pelayan Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                ✕
              </button>
            </div>

            <PelayanForm
              initialData={editingItem}
              onSuccess={() => {
                setShowModal(false);
                toast.success('Berhasil Disimpan', 'Data pelayan telah diperbarui.');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
