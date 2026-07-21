'use client';

import { useState } from 'react';
import { useAsetList, useDeleteAset } from '@/hooks/use-aset';
import { AsetTabs } from '@/components/aset/AsetTabs';
import { AsetCard } from '@/components/aset/AsetCard';
import { AsetForm } from '@/components/aset/AsetForm';
import { AsetGenericItem } from '@/types/aset.types';
import { useToast } from '@/components/ui/toast';
import { getKategoriInfo } from '@/lib/constants/aset';
import { shareAsetWA } from '@/lib/share/share-aset-wa';
import { 
  Plus, Search, Box, X, MapPin, Building, 
  FileText, ExternalLink, Edit2, Trash2, Share2 
} from 'lucide-react';
import Link from 'next/link';

export default function LaporanAsetPage() {
  const { toast, confirm: confirmModal } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPos] = useState<string>('');

  const [selectedDetail, setSelectedDetail] = useState<AsetGenericItem | null>(null);
  const [selectedEdit, setSelectedEdit] = useState<AsetGenericItem | null>(null);
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);
  const [activeHeroItem, setActiveHeroItem] = useState<any | null>(null);

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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">Inventaris Aset Pos Pelkes</h1>
          <p className="text-xs md:text-sm text-text-muted mt-0.5">Pendataan Aset Tanah, Bangunan & Bergerak GPIB</p>
        </div>

        <Link
          href="/laporan/aset/baru"
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-dark transition-all flex items-center gap-2 shadow-soft min-h-[44px]"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Tambah Aset Baru</span>
          <span className="sm:hidden">Aset</span>
        </Link>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-text-muted font-medium">Total Aset Recorded</p>
          <p className="text-2xl font-serif font-bold text-brand-primary tabular-nums mt-1">{counts.ALL}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Seluruh Kategori</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Aset Tanah</p>
          <p className="text-2xl font-serif font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-1">{counts.TANAH}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Lahan Pos Pelkes</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Aset Bangunan</p>
          <p className="text-2xl font-serif font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-1">{counts.BANGUNAN}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Gereja / Pastori</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">Aset Bergerak</p>
          <p className="text-2xl font-serif font-bold text-pink-600 dark:text-pink-400 tabular-nums mt-1">{counts.BERGERAK}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Kendaraan / Peralatan</p>
        </div>
      </div>

      {/* Filter Controls & Search */}
      <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Cari aset (nama pos, jenis, status hukum)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
          />
        </div>

        {/* Category Tabs */}
        <AsetTabs
          activeTab={activeCategory}
          onTabChange={setActiveCategory}
          counts={counts}
        />
      </div>

      {/* Assets Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-high">
            Daftar Inventaris Aset {activeCategory ? `(${activeCategory})` : ''}
          </h2>
          <span className="text-xs text-text-muted">
            {isLoading ? 'Memuat...' : `${asetList?.length || 0} Aset Terdaftar`}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle animate-pulse space-y-3">
                <div className="h-4 bg-surface-sunken rounded w-3/4"></div>
                <div className="h-3 bg-surface-sunken rounded w-1/2"></div>
                <div className="h-12 bg-surface-sunken rounded"></div>
              </div>
            ))}
          </div>
        ) : asetList && asetList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {asetList.map((item) => (
              <AsetCard 
                key={item.id} 
                item={item} 
                onSelect={(selected) => handleOpenDetail(selected)}
                onEdit={(selected) => setSelectedEdit(selected)}
                onDelete={handleDelete}
                onShareWa={(selected) => shareAsetWA(selected)} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface-elevated rounded-2xl p-8 text-center border border-border-subtle space-y-2">
            <Box size={36} className="mx-auto text-text-muted opacity-50" />
            <p className="font-semibold text-text-high text-sm">Belum Ada Aset Terdaftar</p>
            <p className="text-xs text-text-muted">
              {searchQuery || activeCategory
                ? 'Tidak ada data aset yang cocok dengan kriteria pencarian.'
                : 'Pilih Pos Pelkes untuk mulai memasukkan inventaris aset baru.'}
            </p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-elevated w-full max-w-2xl rounded-2xl border border-border-subtle shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
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
                  <h3 className="font-serif font-bold text-text-high text-lg leading-tight truncate max-w-[260px] sm:max-w-md">
                    {selectedDetail.judul}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-brand-primary">
                      {selectedKategoriInfo?.nama || selectedDetail.kategori}
                    </span>
                    {selectedDetail.kondisi && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-sunken font-medium text-text-muted border border-border-subtle">
                        {selectedDetail.kondisi}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="w-9 h-9 rounded-xl bg-surface-sunken hover:bg-gray-200 dark:hover:bg-gray-800 text-text-muted flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
              {/* Featured Hero Photo Showcase */}
              {activeHeroItem ? (
                <div className="space-y-2">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/90 border border-border-subtle shadow-medium group">
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
                                ? 'border-brand-primary ring-2 ring-brand-primary/30 opacity-100'
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
                <h4 className="text-xs font-bold text-text-high uppercase tracking-wider flex items-center gap-1.5">
                  <Building size={14} className="text-brand-primary" />
                  <span>Lokasi Wilayah & Hierarki GPIB</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-text-muted block">Mupel</span>
                    <span className="font-semibold text-text-high">
                      {selectedDetail.mupel_nama || selectedDetail.raw?.pos?.jemaat_induk?.mupel?.nama_mupel || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-text-muted block">Jemaat Induk</span>
                    <span className="font-semibold text-text-high">
                      {selectedDetail.jemaat_induk || selectedDetail.raw?.pos?.jemaat_induk?.nama_induk || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-text-muted block">Pos Pelkes</span>
                    <span className="font-semibold text-text-high flex items-center gap-1">
                      {selectedDetail.pos_nama &&
                      !selectedDetail.pos_nama.toLowerCase().startsWith('jemaat ') &&
                      selectedDetail.pos_nama !== selectedDetail.jemaat_induk &&
                      selectedDetail.pos_nama !== 'Pelayanan Jemaat Direct' &&
                      selectedDetail.pos_nama !== '-' ? (
                        <>
                          <MapPin size={12} className="text-brand-primary shrink-0" />
                          <span>{selectedDetail.pos_nama}</span>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </span>
                  </div>
                </div>

                {selectedDetail.latitude && selectedDetail.longitude && (
                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
                    <span className="text-[11px] text-text-muted font-medium flex items-center gap-1">
                      <MapPin size={12} className="text-brand-primary shrink-0" />
                      <span>Koordinat Fisik Aset:</span>
                    </span>
                    <span className="font-mono font-semibold text-brand-primary">
                      {selectedDetail.latitude}, {selectedDetail.longitude}
                    </span>
                  </div>
                )}
              </div>

              {/* Section 2: Spesifikasi Detail Aset */}
              <div className="p-4 rounded-xl bg-surface-sunken/60 border border-border-subtle space-y-3">
                <h4 className="text-xs font-bold text-text-high uppercase tracking-wider">
                  Spesifikasi & Informasi Detail Aset
                </h4>

                {/* TANAH SPECS */}
                {selectedDetail.kategori === 'TANAH' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-text-muted block">Luas Lahan</span>
                      <span className="font-semibold text-text-high text-sm">
                        {selectedDetail.raw?.luas_m2 || '-'} m²
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-muted block">Tahun Perolehan</span>
                      <span className="font-semibold text-text-high">{selectedDetail.tahun || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-muted block">Status Hukum</span>
                      <span className="font-semibold text-brand-primary">
                        {selectedDetail.raw?.status_hukum || '-'}
                      </span>
                    </div>
                    {selectedDetail.raw?.potensi_sda && (
                      <div className="col-span-2 sm:col-span-3">
                        <span className="text-[11px] text-text-muted block">Potensi SDA</span>
                        <span className="font-medium text-text-high">{selectedDetail.raw.potensi_sda}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* BANGUNAN SPECS */}
                {selectedDetail.kategori === 'BANGUNAN' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-text-muted block">Nama Bangunan</span>
                      <span className="font-semibold text-text-high">{selectedDetail.raw?.nama_bangunan || selectedDetail.judul || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-muted block">Fungsi Utama</span>
                      <span className="font-semibold text-text-high">{selectedDetail.raw?.fungsi || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-muted block">Tahun Berdiri</span>
                      <span className="font-semibold text-text-high">{selectedDetail.tahun || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-muted block">Kondisi Bangunan</span>
                      <span className="font-semibold text-brand-primary">{selectedDetail.kondisi || '-'}</span>
                    </div>
                  </div>
                )}

                {/* BERGERAK SPECS */}
                {selectedDetail.kategori === 'BERGERAK' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-text-muted block">Jenis Aset</span>
                      <span className="font-semibold text-text-high">{selectedDetail.raw?.jenis || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-muted block">Merk / Tipe</span>
                      <span className="font-semibold text-text-high">{selectedDetail.raw?.merk_tipe || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-muted block">Kondisi Aset</span>
                      <span className="font-semibold text-brand-primary">{selectedDetail.kondisi || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-muted block">Tahun Perolehan</span>
                      <span className="font-semibold text-text-high">{selectedDetail.tahun || '-'}</span>
                    </div>
                    {selectedDetail.raw?.no_polisi && (
                      <div>
                        <span className="text-[11px] text-text-muted block">Nomor Polisi</span>
                        <span className="font-mono font-bold text-brand-primary">
                          {selectedDetail.raw.no_polisi}
                        </span>
                      </div>
                    )}
                    {selectedDetail.raw?.tgl_pajak && (
                      <div>
                        <span className="text-[11px] text-text-muted block">Jatuh Tempo Pajak</span>
                        <span className="font-medium text-text-high">{selectedDetail.raw.tgl_pajak}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Keterangan */}
                {selectedDetail.keterangan && (
                  <div className="p-3 bg-surface-sunken rounded-xl border border-border-subtle">
                    <span className="text-[11px] text-text-muted font-semibold block mb-0.5">Keterangan / Batas:</span>
                    <p className="text-xs text-text-high leading-relaxed">{selectedDetail.keterangan}</p>
                  </div>
                )}
              </div>

              {/* Section 3: Lampiran Dokumen & Sertifikat PDF */}
              {(() => {
                const docFiles = (selectedDetail.lampiran || []).filter(
                  (f: any) => !(f.tipe_file?.startsWith('image/') || f.file_path?.match(/\.(jpg|jpeg|png|webp)$/i))
                );

                return (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-text-high uppercase tracking-wider flex items-center justify-between">
                      <span>Dokumen & Sertifikat (PDF)</span>
                      <span className="text-[11px] font-normal text-text-muted">
                        {docFiles.length} Dokumen
                      </span>
                    </h4>

                    {docFiles.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {docFiles.map((file: any) => (
                          <div key={file.id_lampiran} className="p-3 rounded-xl bg-surface-sunken border border-border-subtle flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <FileText size={24} className="text-brand-primary shrink-0" />
                              <div className="overflow-hidden">
                                <p className="text-xs font-semibold text-text-high truncate">{file.keterangan || file.nama_file}</p>
                                <p className="text-[10px] text-text-muted truncate">{file.nama_file}</p>
                              </div>
                            </div>
                            <a
                              href={file.file_path}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1 transition-colors"
                            >
                              <span>Buka PDF</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted italic bg-surface-sunken p-3 rounded-xl border border-border-subtle text-center">
                        Tidak ada berkas PDF dokumen tambahan. Foto fisik sudah ditampilkan pada galeri di atas.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border-subtle bg-surface-sunken/40 flex items-center gap-2">
              <button
                type="button"
                onClick={() => shareAsetWA(selectedDetail)}
                className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 shadow-soft shrink-0"
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
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark active:scale-95 transition-all shadow-soft min-h-[44px] flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL WITH HIERARCHY SELECTOR */}
      {selectedEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-elevated w-full max-w-3xl rounded-2xl border border-border-subtle shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Edit Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken/40">
              <div>
                <h3 className="font-bold text-text-high text-lg">Edit Inventaris Aset</h3>
                <p className="text-xs text-text-muted mt-0.5">Ubah spesifikasi, foto, dan lokasi hierarki aset</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEdit(null)}
                className="w-9 h-9 rounded-xl bg-surface-sunken hover:bg-gray-200 dark:hover:bg-gray-800 text-text-muted flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Edit Form Body */}
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
