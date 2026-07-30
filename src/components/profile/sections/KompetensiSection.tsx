'use client';

import React, { useState } from 'react';
import { Award, Plus, Sparkles, Trash2, Edit3, Compass, CheckCircle2 } from 'lucide-react';
import {
  useKompetensiPendeta,
  useCreateKompetensi,
  useUpdateKompetensi,
  useDeleteKompetensi,
} from '@/hooks/use-pendeta-360';
import { KompetensiPendeta } from '@/types/pendeta-360.types';
import {
  KATEGORI_KOMPETENSI,
  JENIS_KOMPETENSI,
  TINGKAT_KOMPETENSI,
} from '@/lib/constants/pendeta-360.constants';

interface KompetensiSectionProps {
  idPendeta?: string | null;
  canEdit: boolean;
}

export function KompetensiSection({ idPendeta, canEdit }: KompetensiSectionProps) {
  const { data: kompetensiList = [], isLoading } = useKompetensiPendeta(idPendeta || undefined);
  const createMutation = useCreateKompetensi();
  const updateMutation = useUpdateKompetensi();
  const deleteMutation = useDeleteKompetensi();

  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KompetensiPendeta | null>(null);

  // Form State
  const [kategori, setKategori] = useState<string>('Manajemen');
  const [namaKompetensi, setNamaKompetensi] = useState('');
  const [jenis, setJenis] = useState<string>('Kompetensi');
  const [tingkat, setTingkat] = useState<string>('Menengah');
  const [tahunMulai, setTahunMulai] = useState<string>('');
  const [keterangan, setKeterangan] = useState('');

  const filteredList =
    selectedKategori === 'Semua'
      ? kompetensiList
      : kompetensiList.filter((item) => item.kategori === selectedKategori);

  const categoriesAvailable = Array.from(new Set(kompetensiList.map((item) => item.kategori)));

  const handleOpenCreate = () => {
    setEditingItem(null);
    setKategori('Manajemen');
    setNamaKompetensi('');
    setJenis('Kompetensi');
    setTingkat('Menengah');
    setTahunMulai('');
    setKeterangan('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: KompetensiPendeta) => {
    setEditingItem(item);
    setKategori(item.kategori);
    setNamaKompetensi(item.nama_kompetensi);
    setJenis(item.jenis || 'Kompetensi');
    setTingkat(item.tingkat || 'Menengah');
    setTahunMulai(item.tahun_mulai ? String(item.tahun_mulai) : '');
    setKeterangan(item.keterangan || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPendeta || !namaKompetensi.trim()) return;

    if (navigator.vibrate) navigator.vibrate(40);

    const payload = {
      id_pendeta: idPendeta,
      kategori,
      nama_kompetensi: namaKompetensi,
      jenis,
      tingkat: tingkat || null,
      tahun_mulai: tahunMulai ? parseInt(tahunMulai, 10) : null,
      keterangan: keterangan || null,
    };

    if (editingItem) {
      await updateMutation.mutateAsync({
        id_kompetensi: editingItem.id_kompetensi,
        ...payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id_kompetensi: string) => {
    if (!idPendeta || !confirm('Apakah Anda yakin ingin menghapus kompetensi ini?')) return;
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    await deleteMutation.mutateAsync({ id_kompetensi, id_pendeta: idPendeta });
  };

  const getJenisBadge = (j: string) => {
    if (j === 'Karunia') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 flex items-center gap-1">
          <Sparkles size={12} />
          Karunia Rohani
        </span>
      );
    }
    if (j === 'Passion') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1">
          <Compass size={12} />
          Passion
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1">
        <Award size={12} />
        Kompetensi
      </span>
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-semibold shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink-primary">Kompetensi, Passion & Karunia</h3>
            <p className="text-xs text-ink-tertiary">Keahlian Praktis, Minat Pelayanan & Talenta Khusus</p>
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

      {/* Category Filter Chips */}
      {categoriesAvailable.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedKategori('Semua')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              selectedKategori === 'Semua'
                ? 'bg-brand-600 text-white shadow-2xs'
                : 'bg-surface-sunken text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Semua ({kompetensiList.length})
          </button>
          {categoriesAvailable.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedKategori(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                selectedKategori === cat
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'bg-surface-sunken text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="card-flat p-6 text-center text-sm text-ink-tertiary">Memuat kompetensi...</div>
      ) : filteredList.length === 0 ? (
        <div className="card-flat p-8 text-center space-y-3">
          <Award size={32} className="mx-auto text-ink-tertiary opacity-40" />
          <p className="text-sm font-medium text-ink-secondary">
            {selectedKategori === 'Semua'
              ? 'Belum ada kompetensi, passion, atau karunia yang dicatat.'
              : `Tidak ada item pada kategori "${selectedKategori}".`}
          </p>
          {canEdit && (
            <button
              onClick={handleOpenCreate}
              className="h-11 px-5 rounded-xl border border-brand-500 text-brand-600 font-semibold text-xs inline-flex items-center gap-2 hover:bg-brand-50 transition-colors"
            >
              <Plus size={16} />
              <span>Tambah Catatan Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredList.map((item) => (
            <div
              key={item.id_kompetensi}
              className="card-flat p-4 space-y-3 relative group border border-line-subtle hover:border-purple-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getJenisBadge(item.jenis)}
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-sunken text-ink-secondary border border-line-subtle">
                      {item.kategori}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-ink-primary">{item.nama_kompetensi}</h4>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-lg text-ink-tertiary hover:text-brand-600 hover:bg-surface-sunken transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id_kompetensi)}
                      className="p-2 rounded-lg text-ink-tertiary hover:text-red-600 hover:bg-surface-sunken transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-ink-secondary bg-surface-sunken p-2.5 rounded-xl border border-line-subtle">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-brand-600 shrink-0" />
                  <span>
                    Tingkat: <strong className="text-ink-primary">{item.tingkat || 'Belum diatur'}</strong>
                  </span>
                </div>
                {item.tahun_mulai && (
                  <span className="font-mono text-ink-tertiary">Sejak {item.tahun_mulai}</span>
                )}
              </div>

              {item.keterangan && (
                <p className="text-xs text-ink-tertiary italic leading-relaxed">"{item.keterangan}"</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Bottom Sheet Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-lg bg-surface-1 rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-rise">
            <h3 className="text-lg font-bold text-ink-primary">
              {editingItem ? 'Edit Kompetensi / Karunia' : 'Tambah Kompetensi / Karunia'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Jenis *</label>
                <select
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                >
                  {JENIS_KOMPETENSI.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Kategori *</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                >
                  {KATEGORI_KOMPETENSI.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Nama Kompetensi / Karunia *</label>
                <input
                  type="text"
                  required
                  value={namaKompetensi}
                  onChange={(e) => setNamaKompetensi(e.target.value)}
                  placeholder="Misal: Manajemen Keuangan Pelkes, Budidaya Ikan Lele..."
                  className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">Tingkat Kemahiran</label>
                  <select
                    value={tingkat}
                    onChange={(e) => setTingkat(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                  >
                    {TINGKAT_KOMPETENSI.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">Tahun Mulai</label>
                  <input
                    type="number"
                    value={tahunMulai}
                    onChange={(e) => setTahunMulai(e.target.value)}
                    placeholder="2018"
                    className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Keterangan / Pengalaman</label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Pengalaman sertifikasi atau penerapan dalam pelayanan..."
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
