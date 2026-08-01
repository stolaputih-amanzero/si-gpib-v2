'use client';

import { useState, useEffect } from 'react';
import { useAsetList, useDeleteAset } from '@/hooks/use-aset';
import { AsetForm } from '@/components/aset/AsetForm';
import { AsetGenericItem } from '@/types/aset.types';
import { useToast } from '@/components/ui/toast';
import { getKategoriInfo } from '@/lib/constants/aset';
import { shareAsetWA } from '@/lib/share/share-aset-wa';
import {
  Plus,
  Search,
  Box,
  X,
  MapPin,
  Building,
  Edit2,
  Trash2,
  Share2,
  Clock,
  UserCheck,
  Car,
  Landmark,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ListRow } from '@/components/list/ListRow';
import { FilterChips } from '@/components/list/FilterChips';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { Badge } from '@/components/ui/badge';
import { PosName } from '@/components/ui/PosName';

function formatDateTimeIndonesian(dateString?: string | null) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';

    return (
      d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    );
  } catch {
    return dateString;
  }
}

export default function LaporanAsetPage() {
  const { toast, confirm: confirmModal } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPos] = useState<string>('');

  const [selectedDetail, setSelectedDetail] = useState<AsetGenericItem | null>(null);
  const [selectedEdit, setSelectedEdit] = useState<AsetGenericItem | null>(null);
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);
  const [activeHeroItem, setActiveHeroItem] = useState<any | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  const supabase = createClient();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const userMeta = user.user_metadata || {};
        const { data: userRow } = await supabase
          .from('users')
          .select('email, no_telepon')
          .eq('id', user.id)
          .maybeSingle();

        const displayUser =
          userRow?.email ||
          user.email ||
          userMeta.full_name ||
          userMeta.name ||
          userRow?.no_telepon ||
          user.phone ||
          'Pengguna System';

        setCurrentUserEmail(displayUser);
      }
    };
    fetchCurrentUser();
  }, [supabase]);

  const { data: asetList, isLoading } = useAsetList({
    kategori: activeCategory || undefined,
    search: searchQuery || undefined,
    id_pos: selectedPos || undefined,
  });

  const handleOpenDetail = (item: AsetGenericItem) => {
    setSelectedDetail(item);
    const firstImg = (item.lampiran || []).find((f: any) =>
      f.tipe_file?.startsWith('image/') || f.file_path?.match(/\.(jpg|jpeg|png|webp)$/i)
    );
    setActiveHeroItem(firstImg || (item.thumbnail_url ? { file_path: item.thumbnail_url } : null));
  };

  const deleteMutation = useDeleteAset();

  const handleDelete = (id: string, kategori: 'TANAH' | 'BANGUNAN' | 'BERGERAK') => {
    confirmModal({
      title: 'Hapus Inventaris Aset',
      message: 'Apakah Anda yakin ingin menghapus data aset ini? Dokumen lampiran juga akan terhapus.',
      confirmText: 'Hapus Aset',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync({ id, kategori });
          if (selectedDetail?.id === id) setSelectedDetail(null);
          toast.success('Berhasil Dihapus', 'Data aset telah dihapus dari inventaris.');
        } catch {
          toast.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus aset.');
        }
      },
    });
  };

  const counts = {
    ALL: asetList?.length || 0,
    TANAH: asetList?.filter((a) => a.kategori === 'TANAH').length || 0,
    BANGUNAN: asetList?.filter((a) => a.kategori === 'BANGUNAN').length || 0,
    BERGERAK: asetList?.filter((a) => a.kategori === 'BERGERAK').length || 0,
  };

  const selectedKategoriInfo = selectedDetail ? getKategoriInfo(selectedDetail.kategori) : null;

  return (
    <div className="w-full space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-primary tracking-tight">
            Inventaris Aset Pos Pelkes
          </h1>
          <p className="text-xs text-ink-tertiary mt-0.5">
            Pendataan Aset Tanah, Bangunan & Bergerak GPIB
          </p>
        </div>

        <Link
          href="/laporan/aset/baru"
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-xs min-h-[44px] shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Tambah Aset Baru</span>
          <span className="sm:hidden">Aset</span>
        </Link>
      </div>

      {/* Summary Metrics Strip */}
      <SummaryStrip
        metrics={[
          { label: 'Total Aset', value: counts.ALL, icon: <Box size={16} /> },
          { label: 'Tanah', value: counts.TANAH, icon: <Landmark size={16} /> },
          { label: 'Bangunan', value: counts.BANGUNAN, icon: <Building size={16} /> },
          { label: 'Bergerak', value: counts.BERGERAK, icon: <Car size={16} /> },
        ]}
        className="hairline-b bg-surface-1/40 rounded-xl py-2 px-3"
      />

      {/* Search Input Bar */}
      <div className="relative bg-surface-1 p-3 rounded-2xl border border-border-subtle shadow-xs">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-ink-tertiary" />
        <input
          type="text"
          placeholder="Cari aset (nama pos, jenis, status hukum)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      {/* Filter Chips */}
      <FilterChips
        items={[
          { key: '', label: 'Semua Kategori', count: counts.ALL },
          { key: 'TANAH', label: '🏞️ Tanah', count: counts.TANAH },
          { key: 'BANGUNAN', label: '⛪ Bangunan', count: counts.BANGUNAN },
          { key: 'BERGERAK', label: '🚗 Bergerak', count: counts.BERGERAK },
        ]}
        active={activeCategory}
        onChange={(key) => setActiveCategory(key)}
        className="px-0 py-1"
      />

      {/* Main Aset List */}
      <div className="pt-1">
        {isLoading ? (
          <ListSkeleton count={6} />
        ) : asetList && asetList.length > 0 ? (
          <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden">
            {asetList.map((item) => {
              const iconComponent =
                item.kategori === 'TANAH' ? (
                  <Landmark className="h-5 w-5" />
                ) : item.kategori === 'BANGUNAN' ? (
                  <Building className="h-5 w-5" />
                ) : (
                  <Car className="h-5 w-5" />
                );

              const iconVariant =
                item.kategori === 'TANAH' ? 'accent' : item.kategori === 'BANGUNAN' ? 'brand' : 'default';

              const posNameDisplay = item.pos_nama ? (
                <PosName name={item.pos_nama} />
              ) : (
                item.jemaat_induk || 'Sinode GPIB'
              );

              return (
                <ListRow
                  key={item.id}
                  icon={iconComponent}
                  iconVariant={iconVariant}
                  title={item.judul}
                  subtitle={
                    <span>
                      {posNameDisplay} {item.mupel_nama ? `· Mupel ${item.mupel_nama}` : ''}
                    </span>
                  }
                  meta={
                    <span>
                      Kategori: {item.kategori} {item.tahun ? `· Thn ${item.tahun}` : ''}
                    </span>
                  }
                  badge={
                    item.kondisi ? (
                      <Badge variant="outline" className="text-[10px] py-0 px-2">
                        {item.kondisi}
                      </Badge>
                    ) : undefined
                  }
                  onClick={() => handleOpenDetail(item)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Box}
            title="Belum Ada Aset Terdaftar"
            description="Tidak ada data aset yang cocok dengan kriteria pencarian Anda."
            action={{
              label: 'Tambah Aset Baru',
              href: '/laporan/aset/baru',
              variant: 'primary',
            }}
          />
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-1 w-full max-w-2xl rounded-2xl border border-border-subtle shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken/40">
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{
                    backgroundColor: `${selectedKategoriInfo?.warna || '#3B82F6'}1A`,
                  }}
                >
                  {selectedKategoriInfo?.icon || '📦'}
                </span>
                <div>
                  <h3 className="font-serif font-bold text-ink-primary text-lg leading-tight truncate max-w-[260px] sm:max-w-md">
                    {selectedDetail.judul}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-brand-600">
                      {selectedKategoriInfo?.nama || selectedDetail.kategori}
                    </span>
                    {selectedDetail.kondisi && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-sunken font-medium text-ink-tertiary border border-border-subtle">
                        {selectedDetail.kondisi}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="w-9 h-9 rounded-xl bg-surface-sunken hover:bg-surface-sunken/80 text-ink-tertiary flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
              {/* Featured Hero Photo Showcase */}
              {activeHeroItem ? (
                <div className="space-y-2">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/90 border border-border-subtle shadow-md group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activeHeroItem.file_path} alt={selectedDetail.judul} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setActivePreviewImage(activeHeroItem.file_path)}
                      className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px]"
                    >
                      <span>Perbesar Foto</span>
                    </button>

                    {activeHeroItem.keterangan && (
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white text-xs font-medium flex items-center gap-1.5">
                        <span>📝</span>
                        <span className="line-clamp-1">{activeHeroItem.keterangan}</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {selectedDetail.lampiran && selectedDetail.lampiran.filter((f: any) => f.tipe_file?.startsWith('image/') || f.file_path?.match(/\.(jpg|jpeg|png|webp)$/i)).length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {selectedDetail.lampiran
                        .filter((f: any) => f.tipe_file?.startsWith('image/') || f.file_path?.match(/\.(jpg|jpeg|png|webp)$/i))
                        .map((img: any) => (
                          <button
                            key={img.id_lampiran}
                            type="button"
                            onClick={() => setActiveHeroItem(img)}
                            className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                              activeHeroItem.id_lampiran === img.id_lampiran
                                ? 'border-brand-600 ring-2 ring-brand-600/30 opacity-100'
                                : 'border-border-subtle opacity-60 hover:opacity-100'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.file_path} alt={img.nama_file} className="w-full h-full object-cover" />
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Section 1: Lokasi & Hierarki */}
              <div className="p-4 rounded-xl bg-surface-sunken/60 border border-border-subtle space-y-3">
                <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Building size={14} className="text-brand-600" />
                  <span>Lokasi Wilayah & Hierarki GPIB</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-ink-tertiary block">Mupel</span>
                    <span className="font-semibold text-ink-primary">
                      {selectedDetail.mupel_nama || selectedDetail.raw?.pos?.jemaat_induk?.mupel?.nama_mupel || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-tertiary block">Jemaat Induk</span>
                    <span className="font-semibold text-ink-primary">
                      {selectedDetail.jemaat_induk || selectedDetail.raw?.pos?.jemaat_induk?.nama_induk || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-tertiary block">Pos Pelkes</span>
                    <span className="font-semibold text-ink-primary flex items-center gap-1">
                      {selectedDetail.pos_nama &&
                      !selectedDetail.pos_nama.toLowerCase().startsWith('jemaat ') &&
                      selectedDetail.pos_nama !== selectedDetail.jemaat_induk &&
                      selectedDetail.pos_nama !== 'Pelayanan Jemaat Direct' &&
                      selectedDetail.pos_nama !== '-' ? (
                        <>
                          <MapPin size={12} className="text-brand-600 shrink-0" />
                          <PosName name={selectedDetail.pos_nama} />
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </span>
                  </div>
                </div>

                {selectedDetail.latitude && selectedDetail.longitude && (
                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
                    <span className="text-[11px] text-ink-tertiary font-medium flex items-center gap-1">
                      <MapPin size={12} className="text-brand-600 shrink-0" />
                      <span>Koordinat Fisik Aset:</span>
                    </span>
                    <span className="font-mono font-semibold text-brand-600">
                      {selectedDetail.latitude}, {selectedDetail.longitude}
                    </span>
                  </div>
                )}
              </div>

              {/* Section 2: Spesifikasi Detail Aset */}
              <div className="p-4 rounded-xl bg-surface-sunken/60 border border-border-subtle space-y-3">
                <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                  Spesifikasi & Informasi Detail Aset
                </h4>

                {/* TANAH SPECS */}
                {selectedDetail.kategori === 'TANAH' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-ink-tertiary block">Luas Lahan</span>
                      <span className="font-semibold text-ink-primary text-sm">
                        {selectedDetail.raw?.luas_m2 || '-'} m²
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-ink-tertiary block">Tahun Perolehan</span>
                      <span className="font-semibold text-ink-primary">{selectedDetail.tahun || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-ink-tertiary block">Status Hukum</span>
                      <span className="font-semibold text-brand-600">
                        {selectedDetail.raw?.status_hukum || '-'}
                      </span>
                    </div>
                  </div>
                )}

                {/* BANGUNAN SPECS */}
                {selectedDetail.kategori === 'BANGUNAN' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-ink-tertiary block">Nama Bangunan</span>
                      <span className="font-semibold text-ink-primary">{selectedDetail.raw?.nama_bangunan || selectedDetail.judul || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-ink-tertiary block">Fungsi Utama</span>
                      <span className="font-semibold text-ink-primary">{selectedDetail.raw?.fungsi || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-ink-tertiary block">Tahun Berdiri</span>
                      <span className="font-semibold text-ink-primary">{selectedDetail.tahun || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-ink-tertiary block">Kondisi Bangunan</span>
                      <span className="font-semibold text-brand-600">{selectedDetail.kondisi || '-'}</span>
                    </div>
                  </div>
                )}

                {/* BERGERAK SPECS */}
                {selectedDetail.kategori === 'BERGERAK' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-ink-tertiary block">Jenis Aset</span>
                      <span className="font-semibold text-ink-primary">{selectedDetail.raw?.jenis || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-ink-tertiary block">Merk / Tipe</span>
                      <span className="font-semibold text-ink-primary">{selectedDetail.raw?.merk_tipe || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-ink-tertiary block">Kondisi Aset</span>
                      <span className="font-semibold text-brand-600">{selectedDetail.kondisi || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-ink-tertiary block">Tahun Perolehan</span>
                      <span className="font-semibold text-ink-primary">{selectedDetail.tahun || '-'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Audit Metadata */}
              <div className="space-y-1.5 p-3 rounded-xl bg-surface-sunken/60 border border-border-subtle/50 text-xs">
                <div className="flex items-center justify-between text-ink-tertiary">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock size={14} className="text-brand-600 shrink-0" />
                    Terakhir Diperbarui:
                  </span>
                  <span className="font-semibold text-ink-primary tabular-nums">
                    {formatDateTimeIndonesian(selectedDetail.updated_at || selectedDetail.raw?.updated_at || selectedDetail.raw?.created_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-ink-tertiary border-t border-border-subtle/30 pt-1.5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <UserCheck size={14} className="text-emerald-500 shrink-0" />
                    Diperbarui Oleh:
                  </span>
                  <span className="font-bold text-ink-primary font-mono text-[11px]">
                    {selectedDetail.updated_by || selectedDetail.raw?.updated_by || currentUserEmail || 'Pengguna System'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border-subtle bg-surface-sunken/40 flex items-center gap-2">
              <button
                type="button"
                onClick={() => shareAsetWA(selectedDetail)}
                className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 shadow-xs shrink-0"
                title="Bagikan Laporan Aset ke WhatsApp"
              >
                <Share2 size={16} />
                <span>WA</span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(selectedDetail.id, selectedDetail.kategori)}
                className="py-2.5 px-3.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/40 transition-all min-h-[44px] flex items-center justify-center gap-1.5 shrink-0"
                title="Hapus Data Aset"
              >
                <Trash2 size={16} />
                <span>Hapus</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const itemToEdit = selectedDetail;
                  setSelectedDetail(null);
                  setSelectedEdit(itemToEdit);
                }}
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 active:scale-95 transition-all shadow-xs min-h-[44px] flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {selectedEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-1 w-full max-w-3xl rounded-2xl border border-border-subtle shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken/40">
              <div>
                <h3 className="font-bold text-ink-primary text-lg">Edit Inventaris Aset</h3>
                <p className="text-xs text-ink-tertiary mt-0.5">Ubah spesifikasi, foto, dan lokasi hierarki aset</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEdit(null)}
                className="w-9 h-9 rounded-xl bg-surface-sunken hover:bg-surface-sunken/80 text-ink-tertiary flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto">
              <AsetForm
                id_pos={selectedEdit.id_pos}
                defaultKategori={selectedEdit.kategori}
                initialData={selectedEdit.raw}
                showHierarchySelector={true}
                onSuccess={() => {
                  setSelectedEdit(null);
                  toast.success('Berhasil Diperbarui', 'Data inventaris aset telah diperbarui.');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* FULL PHOTO PREVIEW MODAL */}
      {activePreviewImage && (
        <div
          onClick={() => setActivePreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setActivePreviewImage(null)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/20 hover:bg-white/40"
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activePreviewImage} alt="Foto Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}
