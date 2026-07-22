'use client';

import { useState, useEffect } from 'react';
import { useAsetByPos, useDeleteAset } from '@/hooks/use-aset';
import { AsetTabs } from '@/components/aset/AsetTabs';
import { AsetCard } from '@/components/aset/AsetCard';
import { AsetForm } from '@/components/aset/AsetForm';
import { AsetGenericItem } from '@/types/aset.types';
import { SecureDeleteModal } from '@/components/ui/SecureDeleteModal';
import { getKategoriInfo } from '@/lib/constants/aset';
import { shareAsetWA } from '@/lib/share/share-aset-wa';
import { 
  Plus, Search, Box, X, MapPin, Building, 
  FileText, Share2, Clock, UserCheck, Edit2, Trash2, ExternalLink 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PosAsetTabContentProps {
  id_pos: string;
  canWrite: boolean;
}

function formatDateTimeIndonesian(dateString?: string | null) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';
  } catch {
    return dateString;
  }
}

export function PosAsetTabContent({ id_pos, canWrite }: PosAsetTabContentProps) {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedDetail, setSelectedDetail] = useState<AsetGenericItem | null>(null);
  const [selectedEdit, setSelectedEdit] = useState<AsetGenericItem | null>(null);
  const [targetToDelete, setTargetToDelete] = useState<{ id: string; kategori: 'TANAH' | 'BANGUNAN' | 'BERGERAK'; nama: string } | null>(null);
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);
  const [activeHeroItem, setActiveHeroItem] = useState<any | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  const supabase = createClient();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
          'Pelayan Pos';

        setCurrentUserEmail(displayUser);
      }
    };
    fetchCurrentUser();
  }, [supabase]);

  const { data: rawAsetList, isLoading } = useAsetByPos(id_pos);
  const deleteMutation = useDeleteAset();

  const handleOpenDetail = (item: AsetGenericItem) => {
    setSelectedDetail(item);
    const firstImg = (item.lampiran || []).find((f: any) =>
      f.tipe_file?.startsWith('image/') || f.file_path?.match(/\.(jpg|jpeg|png|webp)$/i)
    );
    setActiveHeroItem(firstImg || (item.thumbnail_url ? { file_path: item.thumbnail_url } : null));
  };

  const handleDeleteClick = (id: string, kategori: 'TANAH' | 'BANGUNAN' | 'BERGERAK') => {
    const item = rawAsetList?.find(a => a.id === id);
    const nama = item?.judul || `${kategori} - ${id}`;
    setTargetToDelete({ id, kategori, nama });
  };

  const handleConfirmDelete = async () => {
    if (targetToDelete) {
      await deleteMutation.mutateAsync({ id: targetToDelete.id, kategori: targetToDelete.kategori });
      setTargetToDelete(null);
      if (selectedDetail?.id === targetToDelete.id) {
        setSelectedDetail(null);
      }
    }
  };

  // Filter Items
  const filteredItems = rawAsetList?.filter((item) => {
    const matchCategory = !activeCategory || item.kategori.toUpperCase() === activeCategory.toUpperCase();
    const matchSearch =
      !searchQuery ||
      item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subjudul && item.subjudul.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const counts = {
    ALL: rawAsetList?.length || 0,
    TANAH: rawAsetList?.filter((a) => a.kategori === 'TANAH').length || 0,
    BANGUNAN: rawAsetList?.filter((a) => a.kategori === 'BANGUNAN').length || 0,
    BERGERAK: rawAsetList?.filter((a) => a.kategori === 'BERGERAK').length || 0,
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border-subtle pb-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-extrabold text-text-high">
            <Building className="w-5 h-5 text-brand-primary" />
            Daftar Inventaris Aset Pos Pelkes
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Total {counts.ALL} aset terdaftar (Tanah, Bangunan, & Barang Bergerak)
          </p>
        </div>

        {canWrite && (
          <button
            type="button"
            onClick={() => setSelectedEdit({ id: '', id_pos, kategori: 'TANAH', judul: '', subjudul: '', kondisi: '', tahun: new Date().getFullYear(), lampiran_count: 0, raw: null })}
            className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[36px]"
          >
            <Plus size={14} />
            <span>Tambah Aset</span>
          </button>
        )}
      </div>

      {/* Filter Category Tabs & Search Bar */}
      <div className="bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft space-y-3">
        <AsetTabs activeTab={activeCategory} onTabChange={setActiveCategory} counts={counts} />

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="Cari aset berdasarkan nama, lokasi, spesifikasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-sunken text-xs font-medium text-text-high placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-high"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content List */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <AsetCard
              key={item.id}
              item={item}
              onSelect={handleOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface-elevated rounded-2xl p-8 text-center border border-border-subtle space-y-3">
          <Box size={40} className="mx-auto text-text-muted opacity-40 animate-pulse" />
          <p className="font-semibold text-text-high text-sm">Belum Ada Aset Terdaftar</p>
          <p className="text-xs text-text-muted max-w-xs mx-auto">
            {searchQuery
              ? 'Tidak ditemukan aset yang sesuai dengan pencarian Anda.'
              : 'Belum ada data inventaris tanah, bangunan, maupun barang bergerak untuk pos pelkes ini.'}
          </p>
          {canWrite && !searchQuery && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setSelectedEdit({ id: '', id_pos, kategori: 'TANAH', judul: '', subjudul: '', kondisi: '', tahun: new Date().getFullYear(), lampiran_count: 0, raw: null })}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-all shadow-soft active:scale-95"
              >
                <Plus size={14} />
                <span>Tambah Aset Pertama</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Detail Aset */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-elevated w-full max-w-2xl rounded-2xl border border-border-subtle shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken/40">
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{
                    backgroundColor: `${getKategoriInfo(selectedDetail.kategori)?.warna || '#3B82F6'}1A`,
                  }}
                >
                  {getKategoriInfo(selectedDetail.kategori)?.icon || '📦'}
                </span>
                <div>
                  <h3 className="font-serif font-bold text-text-high text-lg leading-tight truncate max-w-[260px] sm:max-w-md">
                    {selectedDetail.judul}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-brand-primary">
                      {getKategoriInfo(selectedDetail.kategori)?.nama || selectedDetail.kategori}
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
                    <img
                      src={
                        activeHeroItem.file_path?.startsWith('http')
                          ? activeHeroItem.file_path
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pos-pelkes-images/${activeHeroItem.file_path}`
                      }
                      alt={selectedDetail.judul}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setActivePreviewImage(
                          activeHeroItem.file_path?.startsWith('http')
                            ? activeHeroItem.file_path
                            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pos-pelkes-images/${activeHeroItem.file_path}`
                        )
                      }
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
                  {selectedDetail.lampiran &&
                    selectedDetail.lampiran.filter(
                      (f: any) => f.tipe_file?.startsWith('image/') || f.file_path?.match(/\.(jpg|jpeg|png|webp)$/i)
                    ).length > 1 && (
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
                              <img
                                src={
                                  img.file_path?.startsWith('http')
                                    ? img.file_path
                                    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pos-pelkes-images/${img.file_path}`
                                }
                                alt={img.nama_file}
                                className="w-full h-full object-cover"
                              />
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
                              href={
                                file.file_path?.startsWith('http')
                                  ? file.file_path
                                  : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pos-pelkes-images/${file.file_path}`
                              }
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

              {/* Audit Metadata: Tanggal Terakhir Diperbarui & User Peng-Update */}
              <div className="space-y-1.5 p-3 rounded-xl bg-surface-sunken/60 border border-border-subtle/50 text-xs">
                <div className="flex items-center justify-between text-text-muted">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock size={14} className="text-brand-primary shrink-0" />
                    Terakhir Diperbarui:
                  </span>
                  <span className="font-semibold text-text-high tabular-nums">
                    {formatDateTimeIndonesian(selectedDetail.updated_at || selectedDetail.raw?.updated_at || selectedDetail.raw?.created_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-text-muted border-t border-border-subtle/30 pt-1.5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <UserCheck size={14} className="text-emerald-500 shrink-0" />
                    Diperbarui Oleh:
                  </span>
                  <span className="font-bold text-text-high font-mono text-[11px]">
                    {selectedDetail.updated_by || selectedDetail.raw?.updated_by || currentUserEmail || 'Pelayan Pos'}
                  </span>
                </div>
              </div>
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

              {canWrite && (
                <button
                  type="button"
                  onClick={() => {
                    const itemToDelete = selectedDetail;
                    handleDeleteClick(itemToDelete.id, itemToDelete.kategori);
                  }}
                  className="py-2.5 px-3.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/40 transition-all min-h-[44px] flex items-center justify-center gap-1.5 shrink-0"
                  title="Hapus Data Aset"
                >
                  <Trash2 size={16} />
                  <span>Hapus</span>
                </button>
              )}

              {canWrite && (
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
                  <span>Edit Aset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit / Tambah Aset */}
      {selectedEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-elevated w-full max-w-2xl rounded-2xl border border-border-subtle shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken/40">
              <h3 className="font-serif font-bold text-text-high text-lg">
                {selectedEdit.id ? `Edit Data Aset (${selectedEdit.kategori})` : 'Input Data Aset Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedEdit(null)}
                className="w-9 h-9 rounded-xl bg-surface-sunken hover:bg-gray-200 dark:hover:bg-gray-800 text-text-muted flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto">
              <AsetForm
                id_pos={id_pos}
                defaultKategori={selectedEdit.kategori || 'TANAH'}
                initialData={selectedEdit.id ? (selectedEdit.raw || selectedEdit) : undefined}
                showHierarchySelector={true}
                onSuccess={() => {
                  setSelectedEdit(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Photo Preview */}
      {activePreviewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setActivePreviewImage(null)}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
          >
            <X size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activePreviewImage}
            alt="Preview Aset"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/10 shadow-heavy"
          />
        </div>
      )}

      {/* Secure Delete Modal */}
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
