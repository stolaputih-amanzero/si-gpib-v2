'use client';

import React, { useState } from 'react';
import { Users, Plus, Heart, Trash2, Edit3, UserCheck, Phone, ShieldAlert } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useToast } from '@/components/ui/toast';
import {
  useKeluargaPendeta,
  useCreateKeluarga,
  useUpdateKeluarga,
  useDeleteKeluarga,
} from '@/hooks/use-pendeta-360';
import { KeluargaPendeta } from '@/types/pendeta-360.types';
import { HUBUNGAN_KELUARGA } from '@/lib/constants/pendeta-360.constants';

interface KeluargaSectionProps {
  idPendeta?: string | null;
  isOwnerOrSuperUser: boolean;
}

export function KeluargaSection({ idPendeta, isOwnerOrSuperUser }: KeluargaSectionProps) {
  const { toast } = useToast();
  const { data: keluargaList = [], isLoading } = useKeluargaPendeta(idPendeta || undefined);
  const createMutation = useCreateKeluarga();
  const updateMutation = useUpdateKeluarga();
  const deleteMutation = useDeleteKeluarga();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KeluargaPendeta | null>(null);

  // Form State
  const [hubungan, setHubungan] = useState<string>('Suami');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [gender, setGender] = useState<string>('Laki-Laki');
  const [tglLahir, setTglLahir] = useState('');
  const [noWa, setNoWa] = useState('');
  const [pendidikan, setPendidikan] = useState('');
  const [pekerjaan, setPekerjaan] = useState('');
  const [statusHidup, setStatusHidup] = useState<string>('Hidup');
  const [isTanggungan, setIsTanggungan] = useState(false);
  const [keterangan, setKeterangan] = useState('');

  if (!isOwnerOrSuperUser) {
    return (
      <section className="card-flat p-6 space-y-3">
        <div className="flex items-center gap-2 text-ink-primary font-semibold">
          <ShieldAlert size={20} className="text-amber-500 shrink-0" />
          <h3>Keluarga Pendeta (Privat)</h3>
        </div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          Informasi keluarga pendeta dilindungi oleh kebijakan privasi (RLS Privat). Hanya dapat diakses oleh pemilik akun dan Super User.
        </p>
      </section>
    );
  }

  const handleOpenCreate = () => {
    setEditingItem(null);
    setHubungan('Suami');
    setNamaLengkap('');
    setGender('Laki-Laki');
    setTglLahir('');
    setNoWa('');
    setPendidikan('');
    setPekerjaan('');
    setStatusHidup('Hidup');
    setIsTanggungan(false);
    setKeterangan('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: KeluargaPendeta) => {
    setEditingItem(item);
    setHubungan(item.hubungan);
    setNamaLengkap(item.nama_lengkap);
    setGender(item.gender || 'Laki-Laki');
    setTglLahir(item.tgl_lahir || '');
    setNoWa(item.no_wa || '');
    setPendidikan(item.pendidikan || '');
    setPekerjaan(item.pekerjaan || '');
    setStatusHidup(item.status_hidup || 'Hidup');
    setIsTanggungan(Boolean(item.is_tanggungan));
    setKeterangan(item.keterangan || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPendeta || !namaLengkap.trim()) return;

    if (navigator.vibrate) navigator.vibrate(40);

    const payload = {
      id_pendeta: idPendeta,
      hubungan,
      nama_lengkap: namaLengkap,
      gender,
      tgl_lahir: tglLahir || null,
      no_wa: noWa || null,
      pendidikan: pendidikan || null,
      pekerjaan: pekerjaan || null,
      status_hidup: statusHidup,
      is_tanggungan: isTanggungan,
      keterangan: keterangan || null,
    };

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id_keluarga: editingItem.id_keluarga,
          ...payload,
        });
        toast.success('Berhasil Diperbarui', 'Data anggota keluarga berhasil diperbarui.');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Berhasil Ditambahkan', 'Data anggota keluarga berhasil ditambahkan.');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan data keluarga.');
    }
  };

  const handleDelete = async (id_keluarga: string) => {
    if (!idPendeta || !confirm('Apakah Anda yakin ingin menghapus data anggota keluarga ini?')) return;
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    try {
      await deleteMutation.mutateAsync({ id_keluarga, id_pendeta: idPendeta });
      toast.success('Berhasil Dihapus', 'Data anggota keluarga telah dihapus.');
    } catch (err: any) {
      toast.error('Gagal Menghapus', err.message || 'Terjadi kesalahan saat menghapus anggota keluarga.');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center font-semibold shrink-0">
            <Heart size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink-primary">Keluarga Pendeta</h3>
            <p className="text-xs text-ink-tertiary">Data Pasangan, Anak, dan Tanggungan</p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="h-10 px-4 rounded-xl bg-brand-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs hover:bg-brand-700 active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>Tambah</span>
        </button>
      </div>

      {isLoading ? (
        <div className="card-flat p-6 text-center text-sm text-ink-tertiary">Memuat data keluarga...</div>
      ) : keluargaList.length === 0 ? (
        <div className="card-flat p-8 text-center space-y-3">
          <Users size={32} className="mx-auto text-ink-tertiary opacity-40" />
          <p className="text-sm font-medium text-ink-secondary">Belum ada anggota keluarga yang dicatat.</p>
          <button
            onClick={handleOpenCreate}
            className="h-11 px-5 rounded-xl border border-brand-500 text-brand-600 font-semibold text-xs inline-flex items-center gap-2 hover:bg-brand-50 transition-colors"
          >
            <Plus size={16} />
            <span>Tambah Anggota Keluarga Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {keluargaList.map((item) => {
            const age = item.tgl_lahir ? differenceInYears(new Date(), new Date(item.tgl_lahir)) : null;

            return (
              <div
                key={item.id_keluarga}
                className="card-flat p-4 space-y-3 relative group border border-line-subtle hover:border-brand-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
                        {item.hubungan}
                      </span>
                      {item.is_tanggungan && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1">
                          <UserCheck size={12} />
                          Tanggungan
                        </span>
                      )}
                      {item.status_hidup === 'Meninggal' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                          Almarhum/ah
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-ink-primary">{item.nama_lengkap}</h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-lg text-ink-tertiary hover:text-brand-600 hover:bg-surface-sunken transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id_keluarga)}
                      className="p-2 rounded-lg text-ink-tertiary hover:text-red-600 hover:bg-surface-sunken transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-ink-secondary space-y-1 bg-surface-sunken p-3 rounded-xl">
                  {item.tgl_lahir && (
                    <p>
                      <strong className="text-ink-primary font-medium">Lahir:</strong>{' '}
                      {format(new Date(item.tgl_lahir), 'd MMMM yyyy', { locale: localeId })}{' '}
                      {age !== null && <span className="text-ink-tertiary">({age} tahun)</span>}
                    </p>
                  )}
                  {item.pekerjaan && (
                    <p>
                      <strong className="text-ink-primary font-medium">Pekerjaan:</strong> {item.pekerjaan}
                    </p>
                  )}
                  {item.pendidikan && (
                    <p>
                      <strong className="text-ink-primary font-medium">Pendidikan:</strong> {item.pendidikan}
                    </p>
                  )}
                  {item.no_wa && (
                    <p className="flex items-center gap-1 text-emerald-600 font-mono mt-1">
                      <Phone size={13} />
                      <span>{item.no_wa}</span>
                    </p>
                  )}
                </div>

                {item.keterangan && (
                  <p className="text-xs text-ink-tertiary italic">"{item.keterangan}"</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Bottom Sheet Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-lg bg-surface-1 rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-rise">
            <h3 className="text-lg font-bold text-ink-primary">
              {editingItem ? 'Edit Anggota Keluarga' : 'Tambah Anggota Keluarga'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Hubungan Keluarga</label>
                <select
                  value={hubungan}
                  onChange={(e) => setHubungan(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                >
                  {HUBUNGAN_KELUARGA.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                  >
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">Status Hidup</label>
                  <select
                    value={statusHidup}
                    onChange={(e) => setStatusHidup(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                  >
                    <option value="Hidup">Hidup</option>
                    <option value="Meninggal">Meninggal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={tglLahir}
                    onChange={(e) => setTglLahir(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={noWa}
                    onChange={(e) => setNoWa(e.target.value)}
                    placeholder="0812..."
                    className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">Pendidikan</label>
                  <input
                    type="text"
                    value={pendidikan}
                    onChange={(e) => setPendidikan(e.target.value)}
                    placeholder="S1 Teologi, SMA..."
                    className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={pekerjaan}
                    onChange={(e) => setPekerjaan(e.target.value)}
                    placeholder="Pelajar, Swasta..."
                    className="w-full h-12 px-3 rounded-xl border border-line-subtle bg-surface-1 text-sm text-ink-primary"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isTanggungan}
                  onChange={(e) => setIsTanggungan(e.target.checked)}
                  className="w-5 h-5 rounded border-line-subtle text-brand-600"
                />
                <span className="text-xs font-semibold text-ink-primary">Anggota Tanggungan Keluarga</span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Keterangan</label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Catatan tambahan..."
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
