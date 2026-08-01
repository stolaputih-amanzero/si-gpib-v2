'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePelayanList, useDeletePelayan, PelayanItem } from '@/hooks/use-pelayan';
import { PelayanForm } from '@/components/pelayan/PelayanForm';
import { useToast } from '@/components/ui/toast';
import { Plus, Search, Users, Edit, Trash2, ShieldCheck } from 'lucide-react';
import { ListRow } from '@/components/list/ListRow';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { Badge } from '@/components/ui/badge';
import { PosName } from '@/components/ui/PosName';

function PelayanPageContent() {
  const { toast, confirm: confirmModal } = useToast();
  const searchParams = useSearchParams();
  const queryPos = searchParams.get('id_pos') || '';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPos, setSelectedPos] = useState<string>(queryPos);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<PelayanItem | null>(null);

  const { data: pelayanList, isLoading } = usePelayanList(
    selectedPos || undefined,
    searchQuery || undefined
  );

  const deleteMutation = useDeletePelayan();

  const handleEdit = (e: React.MouseEvent, item: PelayanItem) => {
    e.stopPropagation();
    setEditingItem(item);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleDelete = (e: React.MouseEvent, id_pelayan: string) => {
    e.stopPropagation();
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
    <div className="w-full space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-primary tracking-tight">
            Data Pelayan Pos Pelkes
          </h1>
          <p className="text-xs text-ink-tertiary mt-0.5">
            Pendeta Pos, Penatua & Diaken Pelayan Field
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-xs min-h-[44px] shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Tambah Pelayan</span>
          <span className="sm:hidden">+ Pelayan</span>
        </button>
      </div>

      {/* Summary Metrics Strip */}
      <SummaryStrip
        metrics={[
          { label: 'Total Pelayan', value: totalPelayan, icon: <Users size={16} /> },
          { label: 'Pelayan Aktif', value: aktifCount, icon: <ShieldCheck size={16} /> },
        ]}
        className="hairline-b bg-surface-1/40 rounded-xl py-2 px-3"
      />

      {/* Search Input & Pos Filter Bar */}
      <div className="bg-surface-1 p-3 rounded-2xl border border-border-subtle shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" size={18} />
            <input
              type="text"
              placeholder="Cari pelayan (nama, jabatan, pos pelkes)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-400 min-h-[44px]"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Filter ID Pos Pelkes..."
              value={selectedPos}
              onChange={(e) => setSelectedPos(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-xs sm:text-sm font-medium text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-400 min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Pelayan List */}
      <div className="pt-1">
        {isLoading ? (
          <ListSkeleton count={6} />
        ) : pelayanList && pelayanList.length > 0 ? (
          <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden">
            {pelayanList.map((item) => {
              const posNamaDisplay = item.pos?.nama_pos ? (
                <PosName name={item.pos.nama_pos} />
              ) : (
                <span>ID Pos: {item.id_pos}</span>
              );

              return (
                <ListRow
                  key={item.id_pelayan}
                  icon={<Users className="h-5 w-5" />}
                  iconVariant="brand"
                  title={item.nama}
                  subtitle={
                    <span>
                      {item.jabatan || 'Pelayan Pastoral'} · Pos: {posNamaDisplay}
                    </span>
                  }
                  meta={
                    <span>
                      WA: {item.no_wa || '—'} · Status: {item.status}
                    </span>
                  }
                  badge={
                    <Badge variant={item.status === 'Aktif' ? 'brand' : 'outline'} className="text-[10px] py-0 px-2">
                      {item.status}
                    </Badge>
                  }
                  action={
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleEdit(e, item)}
                        className="p-2 rounded-xl text-ink-tertiary hover:text-brand-600 hover:bg-surface-brand transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Edit Pelayan"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, item.id_pelayan)}
                        className="p-2 rounded-xl text-ink-tertiary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Hapus Pelayan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  }
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="Belum Ada Pelayan Terdaftar"
            description="Tidak ada data pelayan yang sesuai dengan pencarian Anda."
            action={{
              label: 'Tambah Pelayan Baru',
              onClick: handleAddNew,
              variant: 'primary',
            }}
          />
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-1 w-full sm:max-w-2xl md:max-w-3xl rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 border border-border-subtle shadow-lg max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 className="text-base font-serif font-bold text-brand-600">
                {editingItem ? 'Edit Data Pelayan' : 'Input Pelayan Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-ink-tertiary hover:text-ink-primary min-h-[44px] min-w-[44px]"
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

export default function PelayanPage() {
  return (
    <Suspense fallback={<ListSkeleton count={4} className="my-8" />}>
      <PelayanPageContent />
    </Suspense>
  );
}
