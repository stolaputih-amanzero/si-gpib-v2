'use client';

import { useState, useEffect } from 'react';
import {
  usePotensiList,
  usePosPelkesList,
  useDeletePotensi,
  PotensiItem,
} from '@/hooks/use-wilayah';
import { PotensiForm } from '@/components/wilayah/PotensiForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { sharePotensiWA } from '@/lib/share/share-potensi-wa';
import { createClient } from '@/lib/supabase/client';
import { 
  Sparkles, Search, Filter, Trash2, X, Building2, Calendar, 
  Share2, Edit2, MapPin, Clock, UserCheck, Image as ImageIcon, ExternalLink 
} from 'lucide-react';
import { format } from 'date-fns';

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

export default function LaporanPotensiPage() {
  const { toast, confirm: confirmModal } = useToast();
  const [selectedPosFilter, setSelectedPosFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPotensiModal, setShowPotensiModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<PotensiItem | null>(null);
  const [selectedEdit, setSelectedEdit] = useState<PotensiItem | null>(null);
  const [activePreviewPhoto, setActivePreviewPhoto] = useState<{ url: string; caption?: string | null } | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  const { data: potensiList, isLoading: isLoadingPotensi } = usePotensiList(selectedPosFilter);
  const { data: posPelkesList } = usePosPelkesList();
  const deletePotensiMutation = useDeletePotensi();

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
          'Pengguna System';

        setCurrentUserEmail(displayUser);
      }
    };
    fetchCurrentUser();
  }, [supabase]);

  const filteredPotensi = (potensiList || []).filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.nama_potensi.toLowerCase().includes(q) ||
      p.kategori.toLowerCase().includes(q) ||
      p.deskripsi.toLowerCase().includes(q) ||
      (p.pos?.nama_pos || '').toLowerCase().includes(q)
    );
  });

  const handleDeletePotensi = (id_potensi: string) => {
    confirmModal({
      title: 'Hapus Data Potensi Wilayah',
      message: 'Apakah Anda yakin ingin menghapus data potensi ini? Dokumen lampiran juga akan terhapus.',
      confirmText: 'Hapus Potensi',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deletePotensiMutation.mutateAsync(id_potensi);
          if (selectedDetail?.id_potensi === id_potensi) setSelectedDetail(null);
          toast.success('Berhasil Dihapus', 'Data potensi wilayah telah dihapus.');
        } catch {
          toast.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus data potensi.');
        }
      },
    });
  };

  const formatDateStr = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">
            Potensi Wilayah & Sumber Daya Pos
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-0.5">
            Pendataan Peluang Ekonomi, Sosial, Kemitraan & SDM Pos Pelkes
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPotensiModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-soft min-h-[44px]"
        >
          <Sparkles size={18} />
          <span className="hidden sm:inline">Tambah Potensi</span>
          <span className="sm:hidden">Potensi</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
        <div className="w-full sm:w-64 relative">
          <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <select
            value={selectedPosFilter}
            onChange={(e) => setSelectedPosFilter(e.target.value)}
            className="w-full min-h-[44px] pl-9 pr-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">Semua Pos Pelkes</option>
            {posPelkesList?.map((pos) => (
              <option key={pos.id_pos} value={pos.id_pos}>
                {pos.nama_pos}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Cari potensi, deskripsi, atau pos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-9 pr-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Potensi Content */}
      <div className="space-y-4">
        {isLoadingPotensi ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : filteredPotensi.length === 0 ? (
          <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle text-text-muted space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
            <p className="text-sm font-semibold">Belum ada data potensi yang terdaftar.</p>
            <p className="text-xs">Klik tombol "Tambah Potensi" untuk mendata potensi wilayah.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredPotensi.map((item: PotensiItem) => {
              const posName = item.pos?.nama_pos || item.id_pos || '';
              const jemaatName = item.pos?.jemaat_induk || '';
              const isDirectJemaat = !posName || posName.toLowerCase().startsWith('jemaat ') || (jemaatName && posName === jemaatName) || posName === 'Pelayanan Jemaat Direct';
              const photoCount = item.lampiran?.length || 0;

              return (
                <div
                  key={item.id_potensi}
                  onClick={() => setSelectedDetail(item)}
                  className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-soft hover:border-brand-primary/40 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                        {item.kategori}
                      </span>
                      <h3 className="font-bold text-text-high text-sm group-hover:text-brand-primary transition-colors">
                        {item.nama_potensi}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {item.kategori.split(' ')[0]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Building2 size={14} className="shrink-0 text-brand-primary" />
                      <span className="font-semibold text-text-high truncate">
                        {isDirectJemaat ? `Jemaat Induk (${jemaatName || posName})` : posName}
                      </span>
                    </div>

                    {photoCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                        <ImageIcon size={12} />
                        <span>{photoCount} Foto</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-text-muted bg-surface-sunken p-2.5 rounded-xl border border-border-subtle line-clamp-2">
                    {item.deskripsi}
                  </p>

                  {/* Standardized Card Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-[11px]">
                    <span className="flex items-center gap-1 text-text-muted">
                      <Calendar size={12} />
                      {formatDateStr(item.created_at)}
                    </span>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => sharePotensiWA(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold transition-colors flex items-center gap-1 min-h-[36px]"
                      >
                        <Share2 size={13} />
                        <span>WA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedEdit(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold transition-colors flex items-center gap-1 min-h-[36px]"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePotensi(item.id_potensi)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold transition-colors flex items-center gap-1 min-h-[36px]"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add Potensi */}
      {showPotensiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface-elevated rounded-3xl p-2 shadow-heavy border border-border-subtle relative animate-slide-up">
            <button
              onClick={() => setShowPotensiModal(false)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-high rounded-full bg-surface-sunken transition-colors z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={18} />
            </button>
            <PotensiForm
              defaultPosId={selectedPosFilter !== 'all' ? selectedPosFilter : undefined}
              onSuccess={() => setShowPotensiModal(false)}
              onCancel={() => setShowPotensiModal(false)}
            />
          </div>
        </div>
      )}

      {/* Modal Edit Potensi */}
      {selectedEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface-elevated rounded-3xl p-2 shadow-heavy border border-border-subtle relative animate-slide-up">
            <button
              onClick={() => setSelectedEdit(null)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-high rounded-full bg-surface-sunken transition-colors z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={18} />
            </button>
            <PotensiForm
              initialData={selectedEdit}
              onSuccess={() => setSelectedEdit(null)}
              onCancel={() => setSelectedEdit(null)}
            />
          </div>
        </div>
      )}

      {/* Detail Modal Potensi Wilayah */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface-elevated rounded-3xl shadow-heavy border border-border-subtle relative animate-slide-up flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Sparkles size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                    {selectedDetail.kategori}
                  </span>
                  <h3 className="font-bold text-text-high text-base leading-tight">
                    {selectedDetail.nama_potensi}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedDetail(null)}
                className="p-2 text-text-muted hover:text-text-high rounded-full bg-surface-sunken transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {/* Deskripsi Potensi */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-text-high uppercase tracking-wider">Deskripsi Potensi</h4>
                <p className="text-xs text-text-high bg-surface-sunken p-3 rounded-xl border border-border-subtle leading-relaxed whitespace-pre-line">
                  {selectedDetail.deskripsi}
                </p>
              </div>

              {/* Hierarki Wilayah */}
              <div className="space-y-2 p-3.5 rounded-xl bg-surface-sunken border border-border-subtle text-xs">
                <h4 className="font-bold text-text-high flex items-center gap-1.5 border-b border-border-subtle/50 pb-2">
                  <Building2 size={15} className="text-brand-primary shrink-0" />
                  <span>Hierarki & Wilayah Pelayanan</span>
                </h4>
                <div className="grid grid-cols-1 gap-1.5 text-text-muted pt-1">
                  <div className="flex items-center justify-between">
                    <span>Mupel:</span>
                    <span className="font-semibold text-text-high">{selectedDetail.pos?.mupel || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border-subtle/30 pt-1.5">
                    <span>Jemaat Induk:</span>
                    <span className="font-semibold text-text-high">{selectedDetail.pos?.jemaat_induk || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border-subtle/30 pt-1.5">
                    <span>Pos Pelkes:</span>
                    <span className="font-semibold text-text-high">
                      {selectedDetail.pos?.nama_pos && !selectedDetail.pos.nama_pos.toLowerCase().startsWith('jemaat ') && selectedDetail.pos.nama_pos !== selectedDetail.pos.jemaat_induk
                        ? selectedDetail.pos.nama_pos
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Keterangan Tambahan */}
              {selectedDetail.keterangan && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-text-high uppercase tracking-wider">Keterangan / Rencana Pengembangan</h4>
                  <p className="text-xs text-text-high bg-surface-sunken p-3 rounded-xl border border-border-subtle leading-relaxed whitespace-pre-line">
                    {selectedDetail.keterangan}
                  </p>
                </div>
              )}

              {/* Galeri / Foto Dokumentasi */}
              {selectedDetail.lampiran && selectedDetail.lampiran.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-text-high flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-brand-primary" />
                      Foto Dokumentasi ({selectedDetail.lampiran.length})
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedDetail.lampiran.map((img) => (
                      <div
                        key={img.id_lampiran}
                        onClick={() => setActivePreviewPhoto({ url: img.file_path, caption: img.keterangan || img.nama_file })}
                        className="group relative flex flex-col rounded-xl overflow-hidden bg-surface-sunken border border-border-subtle cursor-pointer hover:border-brand-primary transition-all"
                      >
                        <div className="aspect-video relative overflow-hidden bg-surface-sunken">
                          <img
                            src={img.file_path}
                            alt={img.keterangan || img.nama_file}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <span>Lihat</span>
                            <ExternalLink size={12} />
                          </div>
                        </div>
                        {img.keterangan && (
                          <p className="p-1.5 text-[11px] text-text-muted truncate font-medium bg-surface-sunken border-t border-border-subtle/40" title={img.keterangan}>
                            {img.keterangan}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lokasi GPS */}
              {(selectedDetail.latitude != null && selectedDetail.longitude != null) && (
                <div className="p-3 rounded-xl bg-surface-sunken border border-border-subtle flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-text-muted font-medium">
                    <MapPin size={14} className="text-brand-primary shrink-0" />
                    Koordinat GPS: {selectedDetail.latitude}, {selectedDetail.longitude}
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${selectedDetail.latitude},${selectedDetail.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-primary font-bold hover:underline"
                  >
                    Buka Peta ↗
                  </a>
                </div>
              )}

              {/* Audit Metadata Box */}
              <div className="space-y-1.5 p-3 rounded-xl bg-surface-sunken/60 border border-border-subtle/50 text-xs">
                <div className="flex items-center justify-between text-text-muted">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock size={14} className="text-brand-primary shrink-0" />
                    Terakhir Diperbarui:
                  </span>
                  <span className="font-semibold text-text-high tabular-nums">
                    {formatDateTimeIndonesian(selectedDetail.updated_at || selectedDetail.created_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-text-muted border-t border-border-subtle/30 pt-1.5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <UserCheck size={14} className="text-emerald-500 shrink-0" />
                    Diperbarui Oleh:
                  </span>
                  <span className="font-bold text-text-high font-mono text-[11px]">
                    {selectedDetail.updated_by || currentUserEmail || 'Pengguna System'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Standardized Action Buttons */}
            <div className="p-4 border-t border-border-subtle bg-surface-sunken/40 flex items-center gap-2">
              <button
                type="button"
                onClick={() => sharePotensiWA(selectedDetail)}
                className="flex-1 min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-soft"
              >
                <Share2 size={16} />
                <span>WA</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const item = selectedDetail;
                  setSelectedDetail(null);
                  handleDeletePotensi(item.id_potensi);
                }}
                className="px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
              >
                <Trash2 size={16} />
                <span>Hapus</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const item = selectedDetail;
                  setSelectedDetail(null);
                  setSelectedEdit(item);
                }}
                className="flex-1 min-h-[44px] px-3 py-2 bg-brand-primary hover:opacity-90 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-soft"
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Photo Preview Modal */}
      {activePreviewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setActivePreviewPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePreviewPhoto(null)}
              className="absolute top-4 right-4 p-2 text-white bg-black/60 hover:bg-black/80 rounded-full transition-colors z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={20} />
            </button>
            <img
              src={activePreviewPhoto.url}
              alt="Preview Foto Dokumentasi"
              className="max-h-[75vh] w-auto object-contain rounded-t-xl"
            />
            {activePreviewPhoto.caption && (
              <div className="w-full p-3 bg-surface-elevated/95 border-t border-border-subtle text-center text-xs font-semibold text-text-high">
                <span>📷 Keterangan Foto: {activePreviewPhoto.caption}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
