'use client';

import { use, useState } from 'react';
import { useAsetByPos, useDeleteAset } from '@/hooks/use-aset';
import { AsetTabs } from '@/components/aset/AsetTabs';
import { AsetCard } from '@/components/aset/AsetCard';
import { ArrowLeft, Plus, Box, MapPin } from 'lucide-react';
import Link from 'next/link';

import { SecureDeleteModal } from '@/components/ui/SecureDeleteModal';

export default function AsetPosDetailPage({ params }: { params: Promise<{ id_pos: string }> }) {
  const resolvedParams = use(params);
  const id_pos = resolvedParams.id_pos;

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [targetToDelete, setTargetToDelete] = useState<{ id: string; kategori: 'TANAH' | 'BANGUNAN' | 'BERGERAK'; nama: string } | null>(null);
  const { data: asetList, isLoading } = useAsetByPos(id_pos);
  const deleteMutation = useDeleteAset();

  const handleDeleteClick = (id: string, kategori: 'TANAH' | 'BANGUNAN' | 'BERGERAK') => {
    const item = asetList?.find(a => a.id === id);
    const nama = item?.judul || `${kategori} - ${id}`;
    setTargetToDelete({ id, kategori, nama });
  };

  const handleConfirmDelete = async () => {
    if (targetToDelete) {
      await deleteMutation.mutateAsync({ id: targetToDelete.id, kategori: targetToDelete.kategori });
      setTargetToDelete(null);
    }
  };

  const filteredItems = activeCategory 
    ? asetList?.filter(a => a.kategori.toUpperCase() === activeCategory.toUpperCase())
    : asetList;

  const counts = {
    ALL: asetList?.length || 0,
    TANAH: asetList?.filter(a => a.kategori === 'TANAH').length || 0,
    BANGUNAN: asetList?.filter(a => a.kategori === 'BANGUNAN').length || 0,
    BERGERAK: asetList?.filter(a => a.kategori === 'BERGERAK').length || 0,
  };

  return (
    <div className="w-full min-h-full bg-surface-base pb-32 md:pb-12">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/aset"
              className="w-10 h-10 rounded-xl bg-surface-sunken flex items-center justify-center text-text-high hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-brand-primary truncate max-w-[200px] sm:max-w-xs">
                Inventaris Pos Pelkes
              </h1>
              <p className="text-xs text-text-muted flex items-center gap-1">
                <MapPin size={12} /> ID Pos: {id_pos}
              </p>
            </div>
          </div>

          <Link
            href={`/dashboard/aset/baru?id_pos=${id_pos}`}
            className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <Plus size={16} />
            <span>Tambah Aset</span>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-6">
        {/* Category Tabs */}
        <div className="bg-surface-elevated p-3.5 rounded-xl border border-border-subtle shadow-soft">
          <AsetTabs
            activeTab={activeCategory}
            onTabChange={setActiveCategory}
            counts={counts}
          />
        </div>

        {/* Assets Cards List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-high">
              Daftar Aset Terdaftar ({filteredItems?.length || 0})
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface-elevated p-4 rounded-xl border border-border-subtle animate-pulse space-y-3">
                  <div className="h-4 bg-surface-sunken rounded w-3/4"></div>
                  <div className="h-3 bg-surface-sunken rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredItems && filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <AsetCard key={item.id} item={item} onDelete={handleDeleteClick} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-elevated rounded-xl p-8 text-center border border-border-subtle space-y-3">
              <Box size={36} className="mx-auto text-text-muted opacity-50" />
              <p className="font-semibold text-text-high text-sm">Belum Ada Aset untuk Pos Ini</p>
              <p className="text-xs text-text-muted">
                Silakan tambahkan data aset Tanah, Bangunan, atau Bergerak untuk Pos Pelkes ini.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Link
                  href={`/aset/${id_pos}/tanah`}
                  className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Aset Tanah</span>
                </Link>
                <Link
                  href={`/aset/${id_pos}/bangunan`}
                  className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Aset Bangunan</span>
                </Link>
                <Link
                  href={`/aset/${id_pos}/bergerak`}
                  className="px-3 py-2 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 text-xs font-semibold hover:bg-pink-100 transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Aset Bergerak</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <SecureDeleteModal
        isOpen={Boolean(targetToDelete)}
        onClose={() => setTargetToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Data Aset"
        targetName={targetToDelete?.nama || ''}
        targetId={targetToDelete?.id || ''}
        itemType={`Aset ${targetToDelete?.kategori || ''}`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
