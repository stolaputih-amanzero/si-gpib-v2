'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useJadwalList, useDeleteJadwal, JadwalItem } from '@/hooks/use-jadwal';
import { JadwalCard } from '@/components/jadwal/JadwalCard';
import { JadwalForm } from '@/components/jadwal/JadwalForm';
import { useToast } from '@/components/ui/toast';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { SearchBar } from '@/components/ui/search-bar';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { Plus, Calendar, Clock, Filter } from 'lucide-react';

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
    <div className="w-full space-y-4 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-1 p-5 rounded-2xl border border-border-subtle shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-surface-brand text-brand-600">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight">
              Jadwal Ibadah Pos Pelkes
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-ink-tertiary">
            Penjadwalan Ibadah Rutin, Pelkat &amp; Sektor Terintegrasi
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-dark transition-all flex items-center justify-center gap-2 shadow-soft min-h-[44px] shrink-0"
        >
          <Plus size={18} />
          <span>Tambah Jadwal</span>
        </button>
      </div>

      {/* Summary Metrics Strip */}
      <SummaryStrip
        metrics={[
          { label: 'Total Jadwal Terdaftar', value: totalJadwal, icon: <Calendar size={16} className="text-brand-600 dark:text-brand-400" /> },
          { label: 'Frekuensi Penjadwalan', value: 'Rutin & Sektor', icon: <Clock size={16} className="text-purple-600 dark:text-purple-400" /> },
        ]}
        className="hairline-b bg-surface-1/40 rounded-xl py-2 px-3"
      />

      {/* Search & Filter Bar */}
      <div className="bg-surface-1 p-3.5 rounded-2xl border border-border-subtle shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <div className="flex-1">
          <SearchBar
            placeholder="Cari jadwal ibadah, hari, jenis, atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
            <input
              type="text"
              placeholder="Filter ID Pos..."
              value={selectedPos}
              onChange={(e) => setSelectedPos(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border-subtle bg-surface-sunken text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[40px]"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area (Cardless Fluid List) */}
      {isLoading ? (
        <ListSkeleton count={6} />
      ) : !jadwalList || jadwalList.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Belum Ada Jadwal Ibadah"
          description={selectedPos ? `Belum ada jadwal ibadah rutin terdaftar untuk Pos Pelkes ${selectedPos}.` : 'Belum ada jadwal ibadah rutin yang cocok dengan pencarian Anda.'}
          action={{
            label: 'Tambah Jadwal Baru',
            onClick: handleAddNew,
          }}
        />
      ) : (
        <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden shadow-xs">
          {jadwalList.map((item) => (
            <JadwalCard
              key={item.id_ibadah}
              item={item}
              onClickCard={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 className="text-base font-serif font-bold text-brand-primary">
                {editingItem ? 'Detail & Edit Jadwal' : 'Input Jadwal Ibadah Baru'}
              </h2>
              <div className="flex items-center gap-2">
                {editingItem && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      handleDelete(editingItem.id_ibadah);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 flex items-center gap-1 border border-red-200 dark:border-red-900/50"
                  >
                    Hapus
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
                >
                  ✕
                </button>
              </div>
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
