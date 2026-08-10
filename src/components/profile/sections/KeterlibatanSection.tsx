'use client';

import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit3, Camera, X, MessageSquare, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useToast } from '@/components/ui/toast';
import { useKeterlibatanPendeta } from '@/hooks/use-pendeta-360';
import {
  addKeterlibatanAction,
  updateKeterlibatanAction,
  deleteKeterlibatanAction,
} from '@/app/actions/pendeta';
import { KeterlibatanPendeta } from '@/types/pendeta-360.types';
import { useQueryClient } from '@tanstack/react-query';
import {
  TINGKAT_KETERLIBATAN,
  JENIS_KETERLIBATAN,
  JABATAN_KETERLIBATAN,
} from '@/lib/constants/pendeta-360.constants';
import { VerticalTimeline, TimelineItemProps } from '@/components/profile/timeline/VerticalTimeline';
import { PastoralPhotoPicker } from '@/components/pastoral/PastoralPhotoPicker';

interface KeterlibatanSectionProps {
  idPendeta?: string | null;
  canEdit: boolean;
}

export function KeterlibatanSection({ idPendeta, canEdit }: KeterlibatanSectionProps) {
  const { toast } = useToast();
  const { data: keterlibatanList = [], isLoading } = useKeterlibatanPendeta(idPendeta || undefined);
  const queryClient = useQueryClient();
  const [isPending, startTransition] = React.useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KeterlibatanPendeta | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<KeterlibatanPendeta | null>(null);

  // Form State
  const [tingkat, setTingkat] = useState<string>('Sinodal');
  const [idMupel, setIdMupel] = useState<string>('');
  const [jenis, setJenis] = useState<string>('Pokja');
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [jabatan, setJabatan] = useState<string>('Anggota');
  const [tglMulai, setTglMulai] = useState('');
  const [tglSelesai, setTglSelesai] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Selesai'>('Aktif');
  const [keterangan, setKeterangan] = useState('');

  // Photo & Caption State
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState<string>('');
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const extractMetaFromKeterangan = (catatan?: string | null) => {
    if (!catatan) return { photoBase64: null, photoCaption: null, cleanNotes: '' };

    let photoBase64Str: string | null = null;
    let photoCaptionStr: string | null = null;
    let cleanNotes = catatan;

    const photoMatch = cleanNotes.match(/\[📷 FOTO_BASE64:([\s\S]+?)\]/);
    if (photoMatch && photoMatch[1]) {
      photoBase64Str = photoMatch[1].trim();
      cleanNotes = cleanNotes.replace(/\[📷 FOTO_BASE64:[\s\S]+?\]\n?/, '');
    }

    const captionMatch = cleanNotes.match(/\[📝 KETERANGAN_FOTO:([\s\S]+?)\]/);
    if (captionMatch && captionMatch[1]) {
      photoCaptionStr = captionMatch[1].trim();
      cleanNotes = cleanNotes.replace(/\[📝 KETERANGAN_FOTO:[\s\S]+?\]\n?/, '');
    }

    return { photoBase64: photoBase64Str, photoCaption: photoCaptionStr, cleanNotes: cleanNotes.trim() };
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setTingkat('Sinodal');
    setIdMupel('');
    setJenis('Pokja');
    setNamaKegiatan('');
    setJabatan('Anggota');
    setTglMulai('');
    setTglSelesai('');
    setStatus('Aktif');
    setKeterangan('');
    setPhotoBase64(null);
    setPhotoCaption('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: KeterlibatanPendeta) => {
    const { photoBase64: pBase64, photoCaption: pCaption, cleanNotes } = extractMetaFromKeterangan(item.keterangan);

    setEditingItem(item);
    setTingkat(item.tingkat);
    setIdMupel(item.id_mupel || '');
    setJenis(item.jenis);
    setNamaKegiatan(item.nama_kegiatan);
    setJabatan(item.jabatan || 'Anggota');
    setTglMulai(item.tgl_mulai || '');
    setTglSelesai(item.tgl_selesai || '');
    setStatus((item.status as 'Aktif' | 'Selesai') || 'Aktif');
    setKeterangan(cleanNotes);
    setPhotoBase64(pBase64);
    setPhotoCaption(pCaption || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPendeta || !namaKegiatan.trim()) return;

    if (navigator.vibrate) navigator.vibrate(40);

    let finalKeterangan = keterangan.trim();
    if (photoCaption.trim()) {
      finalKeterangan += `\n[📝 KETERANGAN_FOTO:${photoCaption.trim()}]`;
    }
    if (photoBase64) {
      finalKeterangan += `\n[📷 FOTO_BASE64:${photoBase64}]`;
    }

    const payload = {
      id_pendeta: idPendeta,
      tingkat,
      id_mupel: idMupel || null,
      jenis,
      nama_kegiatan: namaKegiatan,
      jabatan: jabatan || null,
      tgl_mulai: tglMulai || null,
      tgl_selesai: tglSelesai || null,
      status,
      keterangan: finalKeterangan || null,
    };

    startTransition(async () => {
      try {
        let res;
        if (editingItem) {
          res = await updateKeterlibatanAction(editingItem.id_keterlibatan, idPendeta, payload);
          if (res.success) {
            toast.success('Berhasil Diperbarui', 'Data keterlibatan berhasil diperbarui.');
          }
        } else {
          res = await addKeterlibatanAction(idPendeta, payload);
          if (res.success) {
            toast.success('Berhasil Ditambahkan', 'Data keterlibatan berhasil ditambahkan.');
          }
        }

        if (res?.success) {
          queryClient.invalidateQueries({ queryKey: ['keterlibatan-pendeta', idPendeta] });
          setIsModalOpen(false);
        } else {
          toast.error('Gagal Menyimpan', res?.error || 'Terjadi kesalahan saat menyimpan keterlibatan.');
        }
      } catch (err: any) {
        toast.error('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan keterlibatan.');
      }
    });
  };

  const handleDelete = (id_keterlibatan: string) => {
    if (!idPendeta || !confirm('Apakah Anda yakin ingin menghapus data keterlibatan ini?')) return;
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    startTransition(async () => {
      try {
        const res = await deleteKeterlibatanAction(id_keterlibatan, idPendeta);
        if (res.success) {
          toast.success('Berhasil Dihapus', 'Data keterlibatan telah dihapus.');
          queryClient.invalidateQueries({ queryKey: ['keterlibatan-pendeta', idPendeta] });
        } else {
          toast.error('Gagal Menghapus', res.error || 'Terjadi kesalahan saat menghapus keterlibatan.');
        }
      } catch (err: any) {
        toast.error('Gagal Menghapus', err.message || 'Terjadi kesalahan saat menghapus keterlibatan.');
      }
    });
  };

  const getTingkatBadge = (t: string, statusVal: string) => {
    let bg = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    if (t === 'Sinodal') bg = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    if (t === 'Mupel') bg = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    if (t === 'Eksternal') bg = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${bg}`}>
          {t}
        </span>
        {statusVal === 'Aktif' ? (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500 text-white">
            Aktif
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Selesai
          </span>
        )}
      </div>
    );
  };

  const timelineItems: TimelineItemProps[] = keterlibatanList.map((item) => {
    const startStr = item.tgl_mulai
      ? format(new Date(item.tgl_mulai), 'MMM yyyy', { locale: localeId })
      : 'Awal';
    const endStr = item.tgl_selesai
      ? format(new Date(item.tgl_selesai), 'MMM yyyy', { locale: localeId })
      : item.status === 'Aktif'
      ? 'Sekarang'
      : 'Selesai';

    const { photoBase64: itemPhoto, photoCaption: itemCaption, cleanNotes: itemNotes } = extractMetaFromKeterangan(item.keterangan);

    return {
      id: item.id_keterlibatan,
      date: `${startStr} — ${endStr}`,
      title: item.nama_kegiatan,
      subtitle: `${item.jabatan || 'Anggota'} • ${item.jenis}`,
      onClick: () => setSelectedDetailItem(item),
      badge: getTingkatBadge(item.tingkat, item.status),
      body: (
        <div className="space-y-2 mt-1">
          {itemNotes && (
            <p className="text-xs text-ink-secondary leading-relaxed">{itemNotes}</p>
          )}

          {itemPhoto && (
            <div className="space-y-1.5 pt-1">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewPhotoUrl(itemPhoto);
                }}
                className="relative h-20 w-36 sm:w-44 rounded-xl overflow-hidden bg-black/90 border border-line-subtle cursor-zoom-in group/photo shadow-2xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={itemPhoto} alt="Dokumentasi Keterlibatan" className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300" />
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/75 text-white text-[9px] font-bold flex items-center gap-1 backdrop-blur-sm border border-white/10">
                  <Camera size={10} className="text-amber-400" />
                  <span>Foto Stamped</span>
                </div>
              </div>

              {itemCaption && (
                <p className="text-xs italic text-brand-600 font-medium bg-brand-500/10 p-2.5 rounded-xl border border-brand-500/20 flex items-start gap-1.5">
                  <MessageSquare size={13} className="shrink-0 mt-0.5 text-brand-600" />
                  <span>"{itemCaption}"</span>
                </p>
              )}
            </div>
          )}

          <div className="pt-1 flex items-center justify-end text-[11px] font-semibold text-brand-600">
            <span className="flex items-center gap-1">
              <Eye size={12} /> Lihat Detail
            </span>
          </div>
        </div>
      ),
      dotClass: item.status === 'Aktif' ? 'border-emerald-500 bg-emerald-50' : 'border-line-subtle',
    };
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center font-semibold shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink-primary">Keterlibatan Sinodal & Kepanitiaan</h3>
            <p className="text-xs text-ink-tertiary">Jejak Tim Kerja, Pokja, Komisi, dan Pengurus Organisasi</p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenCreate}
            className="h-10 px-4 rounded-xl bg-brand-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs hover:bg-brand-700 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Tambah</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="card-flat p-6 text-center text-sm text-ink-tertiary">Memuat keterlibatan...</div>
      ) : (
        <VerticalTimeline
          items={timelineItems}
          emptyMessage="Belum ada catatan keterlibatan sinodal / kepanitiaan."
        />
      )}

      {/* Modal Bottom Sheet Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-lg bg-surface-1 rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-rise">
            <h3 className="text-lg font-bold text-ink-primary">
              {editingItem ? 'Edit Keterlibatan' : 'Tambah Keterlibatan'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">Tingkat *</label>
                  <select
                    value={tingkat}
                    onChange={(e) => setTingkat(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                  >
                    {TINGKAT_KETERLIBATAN.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">Jenis Organisasi *</label>
                  <select
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                  >
                    {JENIS_KETERLIBATAN.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Nama Kegiatan / Tim Kerja *</label>
                <input
                  type="text"
                  required
                  value={namaKegiatan}
                  onChange={(e) => setNamaKegiatan(e.target.value)}
                  placeholder="Misal: Pokja Teologi Mupel Kaltim II, Panitia Persidangan Sinode..."
                  className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">Jabatan / Peran</label>
                  <select
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                  >
                    {JABATAN_KETERLIBATAN.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">Status Penugasan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Selesai')}
                    className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={tglMulai}
                    onChange={(e) => setTglMulai(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={tglSelesai}
                    onChange={(e) => setTglSelesai(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Keterangan / Hasil Karya</label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Catatan tugas atau kontribusi..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                />
              </div>

              {/* Foto Dokumentasi Stamped & Keterangan Foto */}
              <div className="space-y-3 pt-2 border-t border-line-hairline">
                <PastoralPhotoPicker
                  label="Foto Dokumentasi"
                  photoUrl={photoBase64}
                  hierarchyMeta={{ posName: 'KETERLIBATAN SINODAL' }}
                  onPhotoChange={(_file, base64) => setPhotoBase64(base64 || null)}
                />

                {photoBase64 && (
                  <div className="space-y-1 bg-surface-sunken p-3 rounded-2xl border border-line-subtle animate-rise">
                    <label className="block text-xs font-semibold text-ink-primary flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-brand-600" />
                      <span>Keterangan / Deskripsi Foto</span>
                    </label>
                    <input
                      type="text"
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                      placeholder="Misal: Penyerahan plakat saat Persidangan Sinode XX..."
                      className="w-full h-11 px-3 rounded-xl border border-line-subtle bg-surface-1 text-xs text-ink-primary focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 rounded-xl border border-line-subtle font-semibold text-sm text-ink-secondary"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-12 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-2xs hover:bg-brand-700 disabled:opacity-50"
                >
                  {isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Keterlibatan */}
      {selectedDetailItem && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedDetailItem(null)}
        >
          <div
            className="bg-surface-1 w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl p-6 border border-line-subtle shadow-heavy max-h-[85vh] overflow-y-auto space-y-4 animate-rise"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line-hairline pb-3">
              <div>
                <h3 className="text-base font-bold text-ink-primary flex items-center gap-2">
                  <Layers size={18} className="text-brand-600" />
                  <span>Detail Keterlibatan Sinodal</span>
                </h3>
                <p className="text-xs text-ink-tertiary mt-0.5">
                  ID: <strong className="text-ink-primary font-mono">{selectedDetailItem.id_keterlibatan}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-ink-tertiary hover:text-ink-primary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            {(() => {
              const { photoBase64: pPhoto, photoCaption: pCaption, cleanNotes: pNotes } = extractMetaFromKeterangan(selectedDetailItem.keterangan);
              const startStr = selectedDetailItem.tgl_mulai
                ? format(new Date(selectedDetailItem.tgl_mulai), 'dd MMM yyyy', { locale: localeId })
                : 'Awal Penugasan';
              const endStr = selectedDetailItem.tgl_selesai
                ? format(new Date(selectedDetailItem.tgl_selesai), 'dd MMM yyyy', { locale: localeId })
                : selectedDetailItem.status === 'Aktif'
                ? 'Sekarang (Aktif)'
                : 'Selesai';

              return (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-ink-primary leading-snug">
                      {selectedDetailItem.nama_kegiatan}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTingkatBadge(selectedDetailItem.tingkat, selectedDetailItem.status)}
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 border border-brand-500/20">
                        {selectedDetailItem.jenis} • {selectedDetailItem.jabatan || 'Anggota'}
                      </span>
                    </div>
                  </div>

                  {/* Periode Penugasan */}
                  <div className="bg-surface-sunken p-3 rounded-2xl border border-line-subtle text-xs space-y-1">
                    <span className="text-ink-tertiary font-medium">Periode Penugasan:</span>
                    <p className="font-semibold text-ink-primary">
                      {startStr} — {endStr}
                    </p>
                  </div>

                  {/* Stamped Photo Preview */}
                  {pPhoto && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-ink-primary flex items-center gap-1.5">
                        <Camera size={14} className="text-brand-600" />
                        <span>Foto Dokumentasi</span>
                      </label>
                      <div
                        onClick={() => setPreviewPhotoUrl(pPhoto)}
                        className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/90 border border-line-subtle cursor-zoom-in group/modalphoto"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pPhoto} alt="Dokumentasi Full" className="w-full h-full object-cover group-hover/modalphoto:scale-105 transition-transform duration-300" />
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm border border-white/10">
                          <Camera size={13} className="text-amber-400" />
                          <span>Klik untuk Layar Penuh</span>
                        </div>
                      </div>

                      {pCaption && (
                        <p className="text-xs italic text-brand-600 font-medium bg-brand-500/10 p-3 rounded-xl border border-brand-500/20 flex items-start gap-2">
                          <MessageSquare size={14} className="shrink-0 mt-0.5 text-brand-600" />
                          <span>"{pCaption}"</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Clean Notes */}
                  {pNotes && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-ink-primary">Keterangan / Hasil Karya:</label>
                      <p className="text-xs text-ink-secondary leading-relaxed bg-surface-sunken p-3 rounded-xl border border-line-subtle whitespace-pre-line">
                        "{pNotes}"
                      </p>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-line-hairline">
                    {canEdit && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const itemToEdit = selectedDetailItem;
                            setSelectedDetailItem(null);
                            handleOpenEdit(itemToEdit);
                          }}
                          className="flex-1 h-11 rounded-xl bg-brand-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:bg-brand-700 transition-all"
                        >
                          <Edit3 size={15} />
                          <span>Edit Data</span>
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(selectedDetailItem.id_keterlibatan)}
                          className="min-h-[44px] px-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                          <span>Hapus</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedDetailItem(null)}
                      className="h-11 px-4 rounded-xl border border-line-subtle font-semibold text-xs text-ink-secondary"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Full Screen Photo Viewer Modal */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-w-2xl w-full bg-surface-1 rounded-2xl overflow-hidden border border-line-subtle p-2 space-y-2">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
                <Camera size={14} className="text-brand-600" />
                Foto Dokumentasi
              </span>
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="p-1 rounded-lg text-ink-tertiary hover:text-ink-primary hover:bg-surface-sunken"
              >
                <X size={18} />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewPhotoUrl} alt="Dokumentasi Full" className="w-full max-h-[75vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </section>
  );
}
