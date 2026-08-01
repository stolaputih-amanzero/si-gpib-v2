'use client';

import { useState } from 'react';
import { usePendetaList, useDeletePendeta, PendetaItem, usePendetaKontrakSegeraBerakhir } from '@/hooks/use-pendeta';
import { PendetaForm } from '@/components/pendeta/PendetaForm';
import { useToast } from '@/components/ui/toast';
import { useCurrentUser, isSuperUserRole } from '@/hooks/use-current-user';
import {
  Plus,
  Search,
  UserCheck,
  Crown,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Edit,
  Trash2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { ListRow } from '@/components/list/ListRow';
import { FilterChips } from '@/components/list/FilterChips';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { Badge } from '@/components/ui/badge';

export default function PendetaPage() {
  const { toast, confirm: confirmModal } = useToast();
  const { data: currentUser, isLoading: isAuthLoading } = useCurrentUser();
  const isSuperUser = isSuperUserRole(currentUser?.role);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInduk, setSelectedInduk] = useState<string>('');
  const [jenisFilter, setJenisFilter] = useState<'all' | 'Organik' | 'Non-Organik'>('all');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<PendetaItem | null>(null);

  const { data: pendetaList, isLoading } = usePendetaList({
    id_induk: selectedInduk || undefined,
    search: searchQuery || undefined,
    jenis_pendeta: jenisFilter === 'all' ? undefined : jenisFilter,
  });

  const { data: kontrakSegeraBerakhir } = usePendetaKontrakSegeraBerakhir();
  const deleteMutation = useDeletePendeta();

  if (isAuthLoading) {
    return <ListSkeleton count={4} className="my-8" />;
  }

  if (!isSuperUser) {
    return (
      <div className="card-flat p-8 text-center space-y-4 bg-surface-1 max-w-md mx-auto my-12 border border-line-subtle rounded-3xl shadow-float animate-rise">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20 shadow-inner">
          <ShieldAlert size={28} />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-serif font-bold text-lg text-ink-primary">Akses Khusus Super User</h2>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Halaman pengelolaan data terpusat SDM Pendeta GPIB terbatas dan hanya dapat diakses oleh role <strong>Super User / Admin Sinode</strong>.
          </p>
        </div>
        <Link href="/dashboard" className="btn btn-primary text-xs min-h-[44px] w-full inline-flex items-center justify-center gap-2">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const handleEdit = (e: React.MouseEvent, item: PendetaItem) => {
    e.stopPropagation();
    setEditingItem(item);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleDelete = (e: React.MouseEvent, id_pendeta: string) => {
    e.stopPropagation();
    confirmModal({
      title: 'Hapus Data Pendeta',
      message: 'Apakah Anda yakin ingin menghapus data pendeta ini dari sistem?',
      confirmText: 'Hapus Data',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id_pendeta);
          toast.success('Berhasil Dihapus', 'Data pendeta telah dihapus dari sistem.');
        } catch {
          toast.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus data.');
        }
      },
    });
  };

  const totalPendeta = pendetaList?.length || 0;
  const totalKmj = pendetaList?.filter((p) => p.is_kmj).length || 0;
  const totalPj = pendetaList?.filter((p) => p.is_pj).length || 0;

  return (
    <div className="w-full space-y-4 pb-12">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-40 bg-surface-1/85 backdrop-blur-md hairline-b pt-safe px-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-primary tracking-tight">
            Manajemen Pendeta GPIB
          </h1>
          <p className="text-xs text-ink-tertiary mt-0.5">
            Pendeta Jemaat, KMJ & Penanggung Jawab Pos Pelkes
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-xs min-h-[44px] shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Tambah Pendeta</span>
          <span className="sm:hidden">+ Pendeta</span>
        </button>
      </div>

      {/* Alert Kontrak Segera Berakhir */}
      {kontrakSegeraBerakhir && kontrakSegeraBerakhir.length > 0 && (
        <div className="mx-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm">
                Peringatan: {kontrakSegeraBerakhir.length} Pendeta dengan Kontrak Segera Berakhir (&lt; 90 hari)
              </h3>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1 mb-3">
                Terdapat pendeta Non-Organik yang masa kontraknya akan segera habis atau sudah kedaluwarsa.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {kontrakSegeraBerakhir.slice(0, 3).map((p) => (
                  <Link
                    key={p.id_pendeta}
                    href={`/sdm/pendeta/${p.id_pendeta}`}
                    className="bg-white/60 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 border border-amber-200/50 dark:border-amber-800/50 rounded-xl p-2.5 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate max-w-[150px]">
                        {p.nama_lengkap}
                      </p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400/80 mt-0.5">
                        Berakhir: {p.tgl_akhir_kontrak}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-amber-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Metrics Strip */}
      <SummaryStrip
        metrics={[
          { label: 'Total Pendeta', value: totalPendeta, icon: <Users size={16} /> },
          { label: 'KMJ Aktif', value: totalKmj, icon: <Crown size={16} /> },
          { label: 'PJ Pos Pelkes', value: totalPj, icon: <ShieldCheck size={16} /> },
        ]}
        className="hairline-b bg-surface-1/40 mx-4 rounded-xl py-2 px-3"
      />

      {/* Search Input Bar */}
      <div className="px-4 pt-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" size={18} />
            <input
              type="text"
              placeholder="Cari pendeta (nama, jabatan, jemaat)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-400 min-h-[44px]"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Filter ID Jemaat Induk..."
              value={selectedInduk}
              onChange={(e) => setSelectedInduk(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-400 min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <FilterChips
        items={[
          { key: 'all', label: 'Semua Pendeta', count: totalPendeta },
          { key: 'Organik', label: 'Organik' },
          { key: 'Non-Organik', label: 'Non-Organik' },
        ]}
        active={jenisFilter}
        onChange={(key) => setJenisFilter(key as 'all' | 'Organik' | 'Non-Organik')}
        className="px-4 py-1"
      />

      {/* Pendeta List */}
      <div className="pt-1">
        {isLoading ? (
          <ListSkeleton count={6} />
        ) : pendetaList && pendetaList.length > 0 ? (
          <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b">
            {pendetaList.map((item) => {
              const isKmj = item.is_kmj;
              const isPj = item.is_pj;

              const iconComponent = isKmj ? (
                <Crown className="h-5 w-5" />
              ) : isPj ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <UserCheck className="h-5 w-5" />
              );

              const iconVariant = isKmj ? 'accent' : isPj ? 'brand' : 'default';

              const jemaatNama = item.jemaat_induk?.nama_induk || item.id_induk || 'Sinode GPIB';

              return (
                <ListRow
                  key={item.id_pendeta}
                  icon={iconComponent}
                  iconVariant={iconVariant}
                  title={item.nama_lengkap}
                  subtitle={
                    <span>
                      {item.jabatan || 'Pendeta Jemaat'} · {jemaatNama}
                    </span>
                  }
                  meta={
                    <span>
                      {item.jenis_pendeta} · WA: {item.no_wa || '—'}
                    </span>
                  }
                  badge={
                    <div className="flex items-center gap-1">
                      {isKmj && (
                        <Badge variant="brand" className="text-[10px] py-0 px-2">
                          KMJ
                        </Badge>
                      )}
                      {isPj && (
                        <Badge variant="outline" className="bg-surface-accent text-accent-600 border-accent-300/40 text-[10px] py-0 px-2">
                          PJ Pos
                        </Badge>
                      )}
                    </div>
                  }
                  action={
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleEdit(e, item)}
                        className="p-2 rounded-xl text-ink-tertiary hover:text-brand-600 hover:bg-surface-brand transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Edit Data Pendeta"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, item.id_pendeta)}
                        className="p-2 rounded-xl text-ink-tertiary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Hapus Data Pendeta"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  }
                  href={`/sdm/pendeta/${item.id_pendeta}`}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={UserCheck}
            title="Belum Ada Pendeta Terdaftar"
            description="Tidak ada pendeta yang sesuai dengan filter pencarian Anda."
            action={{
              label: 'Tambah Pendeta Baru',
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
                {editingItem ? 'Edit Data Pendeta' : 'Input Pendeta Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-ink-tertiary hover:text-ink-primary min-h-[44px] min-w-[44px]"
              >
                ✕
              </button>
            </div>

            <PendetaForm
              initialData={editingItem}
              onSuccess={() => {
                setShowModal(false);
                toast.success('Berhasil Disimpan', 'Data pendeta berhasil diperbarui.');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
