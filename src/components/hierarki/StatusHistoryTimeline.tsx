'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useHistoriStatus, useUpdateHistoriStatus, useDeleteHistoriStatus } from '@/hooks/use-hierarki';
import { History, Calendar, FileText, ArrowRight, ShieldAlert, Sparkles, Church, Edit3, Trash2, Loader2, X, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

import { useRouter } from 'next/navigation';

interface StatusHistoryTimelineProps {
  id_pos: string;
  id_mupel?: string;
}

export function StatusHistoryTimeline({ id_pos, id_mupel }: StatusHistoryTimelineProps) {
  const router = useRouter();
  const { data: historiList, isLoading, refetch } = useHistoriStatus(id_pos);
  const updateHistoriMutation = useUpdateHistoriStatus();
  const deleteHistoriMutation = useDeleteHistoriStatus();
  const [editingHistori, setEditingHistori] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4 bg-surface-elevated rounded-2xl border border-border-subtle">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (!historiList || historiList.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle text-xs text-text-muted flex items-center gap-2.5">
        <History size={16} className="text-brand-primary opacity-60 shrink-0" />
        <span>Belum ada catatan riwayat perubahan status untuk lokasi pelayanan ini.</span>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    if (status === 'Jemaat Induk') return <Church size={14} className="text-purple-600 dark:text-purple-400" />;
    if (status === 'Bajem') return <Sparkles size={14} className="text-brand-primary" />;
    return <ShieldAlert size={14} className="text-emerald-600" />;
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHistori) return;
    try {
      await updateHistoriMutation.mutateAsync({
        id_histori: editingHistori.id_histori,
        tanggal_perubahan: editingHistori.tanggal_perubahan,
        keterangan_perubahan: editingHistori.keterangan_perubahan,
        jemaat_ke: editingHistori.jemaat_ke ? Number(editingHistori.jemaat_ke) : null,
        catatan: editingHistori.catatan || null,
      });
      setEditingHistori(null);
      await refetch();
      router.refresh();
    } catch (err: any) {
      alert(err?.message || 'Gagal memperbarui riwayat status.');
    }
  };

  const handleDelete = async (id_histori: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan riwayat perubahan status ini?')) {
      try {
        await deleteHistoriMutation.mutateAsync(id_histori);
        await refetch();
        router.refresh();
      } catch (err: any) {
        alert(err?.message || 'Gagal menghapus riwayat status.');
      }
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-soft space-y-4">
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
        <History className="w-5 h-5 text-brand-primary" />
        <h3 className="font-extrabold text-text-high text-sm">Riwayat Peningkatan Status</h3>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary">
          {historiList.length} Catatan
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-subtle">
        {historiList.map((item) => {
          let parsedDate = item.tanggal_perubahan;
          try {
            parsedDate = format(new Date(item.tanggal_perubahan), 'dd MMMM yyyy', { locale: localeId });
          } catch (e) {
            // fallback
          }

          return (
            <div key={item.id_histori} className="relative space-y-1.5 group">
              {/* Node Indicator Dot */}
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-brand-primary border-2 border-surface-elevated ring-2 ring-brand-primary/20" />

              {/* Card Content */}
              <div className="p-3.5 rounded-xl bg-surface-sunken border border-border-subtle space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="flex items-center gap-1 text-text-muted">
                      {getStatusIcon(item.status_lama)}
                      {item.status_lama}
                    </span>
                    <ArrowRight size={14} className="text-brand-primary shrink-0" />
                    <span className="flex items-center gap-1 text-brand-primary">
                      {getStatusIcon(item.status_baru)}
                      {item.status_baru}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                      <Calendar size={12} />
                      {parsedDate}
                    </span>

                    {/* Action Buttons: Edit & Hapus */}
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingHistori(item);
                        }}
                        className="min-h-[28px] px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                        title="Edit Catatan Histori Status Ini"
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(item.id_histori);
                        }}
                        className="min-h-[28px] px-2 py-0.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                        title="Hapus Catatan Histori Status Ini"
                      >
                        <Trash2 size={12} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>

                {item.jemaat_ke && (
                  <div className="inline-block px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-[11px] border border-purple-200">
                    Jemaat GPIB Ke-{item.jemaat_ke}
                  </div>
                )}

                {item.id_induk_baru && (
                  <div className="p-2 rounded-lg bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/60 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-mono text-purple-700 dark:text-purple-300 font-bold">
                      ID Jemaat Induk Baru: {item.id_induk_baru}
                    </span>
                    <Link
                      href={`/hierarki/${encodeURIComponent(id_mupel || 'all')}/${encodeURIComponent(item.id_induk_baru)}`}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1 transition-all shadow-xs active:scale-95"
                    >
                      <span>Detail Jemaat Induk</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-text-high font-semibold leading-relaxed flex items-start gap-1.5">
                    <FileText size={14} className="text-text-muted shrink-0 mt-0.5" />
                    <span>SK/Dasar: {item.keterangan_perubahan}</span>
                  </p>

                  {item.catatan && (
                    <p className="text-text-muted italic text-[11px] bg-surface-elevated/70 p-2 rounded-md border border-border-subtle/50 ml-5">
                      &quot;{item.catatan}&quot;
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Edit Histori Status */}
      {editingHistori && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-sunken">
              <h3 className="font-bold text-sm text-text-high flex items-center gap-2">
                <Edit3 size={16} className="text-amber-600" />
                <span>Edit Catatan Histori Status</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingHistori(null)}
                className="p-1.5 rounded-lg text-text-muted hover:bg-surface-elevated transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-high">Tanggal Perubahan Status *</label>
                <input
                  type="date"
                  required
                  value={editingHistori.tanggal_perubahan || ''}
                  onChange={(e) => setEditingHistori({ ...editingHistori, tanggal_perubahan: e.target.value })}
                  className="w-full min-h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-high">Nomor SK / Dasar Keputusan *</label>
                <textarea
                  rows={2}
                  required
                  value={editingHistori.keterangan_perubahan || ''}
                  onChange={(e) => setEditingHistori({ ...editingHistori, keterangan_perubahan: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-high">Jemaat Ke- (Nomor Urut Sinode)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Contoh: 354"
                  value={editingHistori.jemaat_ke || ''}
                  onChange={(e) => setEditingHistori({ ...editingHistori, jemaat_ke: e.target.value ? Number(e.target.value) : null })}
                  className="w-full min-h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-high">Catatan Peningkatan Status</label>
                <textarea
                  rows={2}
                  placeholder="Catatan latar belakang, sejarah, atau proses..."
                  value={editingHistori.catatan || ''}
                  onChange={(e) => setEditingHistori({ ...editingHistori, catatan: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingHistori(null)}
                  className="min-h-[40px] px-4 rounded-xl border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-xs font-bold text-text-high transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateHistoriMutation.isPending}
                  className="min-h-[40px] px-5 rounded-xl bg-amber-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 hover:bg-amber-700 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                >
                  {updateHistoriMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
