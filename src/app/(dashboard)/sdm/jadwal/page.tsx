'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useJadwalList, useDeleteJadwal, JadwalItem } from '@/hooks/use-jadwal';
import { JadwalCard } from '@/components/jadwal/JadwalCard';
import { JadwalForm } from '@/components/jadwal/JadwalForm';
import { useToast } from '@/components/ui/toast';
import { Plus, Search, Calendar } from 'lucide-react';

function JadwalPageContent() {
  const searchParams = useSearchParams();
  const initialPos = searchParams.get('pos') || '';
  const initialAction = searchParams.get('action') || '';
  const { toast, confirm: confirmModal } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPos, setSelectedPos] = useState<string>(initialPos);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<JadwalItem | null>(null);

  useEffect(() => {
    if (initialAction === 'new') {
      setEditingItem(null);
      setShowModal(true);
    }
  }, [initialAction]);

  const { data: jadwalList, isLoading } = useJadwalList(
    selectedPos || undefined,
    searchQuery || undefined
  );

  const deleteMutation = useDeleteJadwal();

  const handleEdit = (item: JadwalItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleDelete = (id_ibadah: string) => {
    confirmModal({
      title: 'Hapus Jadwal Ibadah',
      message: 'Apakah Anda yakin ingin menghapus jadwal ibadah ini?',
      confirmText: 'Hapus Jadwal',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id_ibadah);
          toast.success('Berhasil Dihapus', 'Jadwal ibadah telah dihapus.');
        } catch {
          toast.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus data.');
        }
      },
    });
  };

  const totalJadwal = jadwalList?.length || 0;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">Jadwal Ibadah Pos Pelkes</h1>
          <p className="text-xs md:text-sm text-text-muted mt-0.5">Penjadwalan Ibadah Rutin, Pelkat & Sektor</p>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-dark transition-all flex items-center gap-2 shadow-soft min-h-[44px]"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Tambah Jadwal</span>
          <span className="sm:hidden">+ Jadwal</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-text-muted font-medium">Total Jadwal Rutin</p>
          <p className="text-2xl font-serif font-bold text-brand-primary tabular-nums mt-1">{totalJadwal}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Terdaftar di Pos</p>
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
            placeholder="Cari jadwal (jenis ibadah, hari, pos pelkes)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
          />
        </div>
      </div>

      {/* Jadwal List */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-text-high">
          Daftar Jadwal Ibadah ({jadwalList?.length || 0})
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle animate-pulse space-y-3">
                <div className="h-4 bg-surface-sunken rounded w-3/4"></div>
                <div className="h-3 bg-surface-sunken rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : jadwalList && jadwalList.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {jadwalList.map((item) => (
              <JadwalCard
                key={item.id_ibadah}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface-elevated rounded-2xl p-8 text-center border border-border-subtle space-y-3 animate-fadeIn">
            <Calendar size={36} className="mx-auto text-text-muted opacity-50" />
            <p className="font-semibold text-text-high text-sm">Belum Ada Jadwal Ibadah Terdaftar</p>
            <p className="text-xs text-text-muted max-w-xs mx-auto">
              Belum ada jadwal ibadah rutin terdaftar {selectedPos ? `untuk Pos Pelkes ${selectedPos}` : ''}.
            </p>
            <button
              type="button"
              onClick={handleAddNew}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-primary-dark transition-all shadow-soft"
            >
              <Plus size={14} />
              <span>Tambah Jadwal</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 className="text-base font-serif font-bold text-brand-primary">
                {editingItem ? 'Edit Jadwal Ibadah' : 'Input Jadwal Ibadah Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                ✕
              </button>
            </div>

            <JadwalForm
              id_pos={selectedPos || undefined}
              initialData={editingItem}
              onSuccess={() => {
                setShowModal(false);
                toast.success('Berhasil Disimpan', 'Jadwal ibadah telah diperbarui.');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function JadwalPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    }>
      <JadwalPageContent />
    </Suspense>
  );
}
