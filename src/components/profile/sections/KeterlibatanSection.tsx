'use client';

import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  useKeterlibatanPendeta,
  useCreateKeterlibatan,
  useUpdateKeterlibatan,
  useDeleteKeterlibatan,
} from '@/hooks/use-pendeta-360';
import { KeterlibatanPendeta } from '@/types/pendeta-360.types';
import {
  TINGKAT_KETERLIBATAN,
  JENIS_KETERLIBATAN,
  JABATAN_KETERLIBATAN,
} from '@/lib/constants/pendeta-360.constants';
import { VerticalTimeline, TimelineItemProps } from '@/components/profile/timeline/VerticalTimeline';

interface KeterlibatanSectionProps {
  idPendeta?: string | null;
  canEdit: boolean;
}

export function KeterlibatanSection({ idPendeta, canEdit }: KeterlibatanSectionProps) {
  const { data: keterlibatanList = [], isLoading } = useKeterlibatanPendeta(idPendeta || undefined);
  const createMutation = useCreateKeterlibatan();
  const updateMutation = useUpdateKeterlibatan();
  const deleteMutation = useDeleteKeterlibatan();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KeterlibatanPendeta | null>(null);

  // Form State
  const [tingkat, setTingkat] = useState<string>('Sinodal');
  const [idMupel, setIdMupel] = useState<string>('');
  const [jenis, setJenis] = useState<string>('Pokja');
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [jabatan, setJabatan] = useState<string>('Anggota');
  const [tglMulai, setTglMulai] = useState('');
  const [tglSelesai, setTglSelesai] = useState('');
  const [status, setStatus] = useState<string>('Aktif');
  const [keterangan, setKeterangan] = useState('');

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
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: KeterlibatanPendeta) => {
    setEditingItem(item);
    setTingkat(item.tingkat);
    setIdMupel(item.id_mupel || '');
    setJenis(item.jenis);
    setNamaKegiatan(item.nama_kegiatan);
    setJabatan(item.jabatan || 'Anggota');
    setTglMulai(item.tgl_mulai || '');
    setTglSelesai(item.tgl_selesai || '');
    setStatus(item.status || 'Aktif');
    setKeterangan(item.keterangan || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPendeta || !namaKegiatan.trim()) return;

    if (navigator.vibrate) navigator.vibrate(40);

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
      keterangan: keterangan || null,
    };

    if (editingItem) {
      await updateMutation.mutateAsync({
        id_keterlibatan: editingItem.id_keterlibatan,
        ...payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id_keterlibatan: string) => {
    if (!idPendeta || !confirm('Apakah Anda yakin ingin menghapus data keterlibatan ini?')) return;
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    await deleteMutation.mutateAsync({ id_keterlibatan, id_pendeta: idPendeta });
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

    return {
      id: item.id_keterlibatan,
      date: `${startStr} — ${endStr}`,
      title: item.nama_kegiatan,
      subtitle: `${item.jabatan || 'Anggota'} • ${item.jenis}`,
      badge: (
        <div className="flex items-center gap-2">
          {getTingkatBadge(item.tingkat, item.status)}
          {canEdit && (
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEdit(item);
                }}
                className="p-1 text-ink-tertiary hover:text-brand-600 rounded transition-colors"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id_keterlibatan);
                }}
                className="p-1 text-ink-tertiary hover:text-red-600 rounded transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      ),
      body: item.keterangan || null,
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
                    onChange={(e) => setStatus(e.target.value)}
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
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 h-12 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-2xs hover:bg-brand-700 disabled:opacity-50"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
