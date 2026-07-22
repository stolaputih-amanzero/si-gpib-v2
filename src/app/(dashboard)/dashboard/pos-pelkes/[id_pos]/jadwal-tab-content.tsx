'use client';

import { useState } from 'react';
import { useJadwalList, useDeleteJadwal, JadwalItem } from '@/hooks/use-jadwal';
import { JadwalCard } from '@/components/jadwal/JadwalCard';
import { JadwalForm } from '@/components/jadwal/JadwalForm';
import { useToast } from '@/components/ui/toast';
import { Plus, Calendar, Loader2, Share2 } from 'lucide-react';

interface JadwalTabContentProps {
  id_pos: string;
  canWrite: boolean;
}

export function JadwalTabContent({ id_pos, canWrite }: JadwalTabContentProps) {
  const { toast, confirm: confirmModal } = useToast();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<JadwalItem | null>(null);

  const { data: jadwalList, isLoading } = useJadwalList(id_pos);
  const deleteMutation = useDeleteJadwal();

  const handleEdit = (item: JadwalItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleDelete = (id_ibadah: string) => {
    confirmModal({
      title: 'Hapus Jadwal Ibadah',
      message: 'Apakah Anda yakin ingin menghapus jadwal ibadah ini?',
      confirmText: 'Hapus Jadwal',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id_ibadah);
          toast.success('Berhasil Dihapus', 'Jadwal ibadah telah dihapus.');
        } catch (err: any) {
          toast.error('Gagal Menghapus', err.message || 'Terjadi kesalahan sistem.');
        }
      },
    });
  };

  const handleShareAllWhatsApp = () => {
    if (!jadwalList || jadwalList.length === 0) return;

    const firstItem = jadwalList[0];
    const isJemaatScope = firstItem.pos?.nama_pos?.startsWith('Jemaat ');
    const displayName = isJemaatScope
      ? firstItem.pos?.nama_pos.substring(7)
      : firstItem.pos?.nama_pos || id_pos;

    const mupelNama = firstItem.pos?.jemaat_induk?.mupel?.nama_mupel || '-';
    const jemaatNama = firstItem.pos?.jemaat_induk?.nama_induk || '-';
    const posNamaFormatted = isJemaatScope ? '-' : displayName;

    const formatTime = (timeStr: string) => {
      return timeStr.substring(0, 5);
    };

    const linesArr = [
      `*JADWAL IBADAH*`,
      `Gereja Protestan di Indonesia bagian Barat (GPIB)`,
      ``,
      `*WILAYAH PELAYANAN*`,
      isJemaatScope ? `Lingkup: Jemaat Induk` : `Lingkup: Pos Pelkes / Bajem`,
      !isJemaatScope ? `Nama: ${posNamaFormatted}` : null,
      `Jemaat Induk: ${jemaatNama}`,
      `Mupel: ${mupelNama}`,
      ``,
      `*DAFTAR JADWAL IBADAH*`,
    ];

    jadwalList.forEach((j, index) => {
      linesArr.push(
        `${index + 1}. *${j.jenis}*`,
        `   Hari: ${j.hari}`,
        `   Jam: ${formatTime(j.jam)} ${j.zona_waktu || 'WIB'}`,
        j.keterangan ? `   Keterangan: ${j.keterangan}` : null,
        ``
      );
    });

    linesArr.push(`_Dibagikan dari SI GPIB v2.2_`);

    const lines = linesArr.filter((l) => l !== null).join('\n');
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(lines)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="w-full h-32 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        <span className="ml-2 text-xs text-text-muted">Memuat jadwal ibadah...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border-subtle pb-3">
        <h3 className="flex items-center gap-2 text-base font-extrabold text-text-high">
          <Calendar className="w-5 h-5 text-brand-primary" />
          Daftar Jadwal Ibadah
        </h3>
        <div className="flex items-center gap-2">
          {jadwalList && jadwalList.length > 0 && (
            <button
              type="button"
              onClick={handleShareAllWhatsApp}
              className="px-2.5 py-1.5 rounded-lg border border-emerald-600/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 transition-all active:scale-95 shadow-xs"
            >
              <Share2 size={10} className="shrink-0" />
              <span>Share WA</span>
            </button>
          )}
          {canWrite && (
            <button
              type="button"
              onClick={handleAddNew}
              className="px-2.5 py-1.5 rounded-lg border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-[10px] font-bold text-brand-primary flex items-center gap-1 transition-all active:scale-95 shadow-xs"
            >
              <Plus size={10} />
              <span>Tambah Jadwal</span>
            </button>
          )}
        </div>
      </div>

      {jadwalList && jadwalList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-surface-sunken p-3 rounded-2xl border border-border-subtle/50">
          <div className="p-3 bg-surface-elevated rounded-xl border border-border-subtle flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Total Jadwal</span>
            <span className="text-xl font-extrabold text-brand-primary mt-1">{jadwalList.length}</span>
          </div>
          <div className="p-3 bg-surface-elevated rounded-xl border border-border-subtle flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Ibadah Minggu</span>
            <span className="text-xl font-extrabold text-brand-primary mt-1">
              {jadwalList.filter(j => j.jenis === 'Ibadah Hari Minggu').length}
            </span>
          </div>
          <div className="p-3 bg-surface-elevated rounded-xl border border-border-subtle flex flex-col justify-between shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Kategorial / Lainnya</span>
            <span className="text-xl font-extrabold text-brand-primary mt-1">
              {jadwalList.filter(j => j.jenis !== 'Ibadah Hari Minggu').length}
            </span>
          </div>
        </div>
      )}

      {!jadwalList || jadwalList.length === 0 ? (
        <div className="bg-surface-elevated rounded-2xl p-8 text-center border border-border-subtle space-y-3">
          <Calendar size={36} className="mx-auto text-text-muted opacity-40 animate-pulse" />
          <p className="font-semibold text-text-high text-sm">Belum Ada Jadwal Ibadah Terdaftar</p>
          <p className="text-xs text-text-muted max-w-xs mx-auto">
            Daftarkan jadwal ibadah rutin mingguan atau kategorial untuk pos pelkes ini.
          </p>
          {canWrite && (
            <button
              type="button"
              onClick={handleAddNew}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-primary-dark transition-all shadow-soft active:scale-95"
            >
              <Plus size={14} />
              <span>+ Jadwal</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {jadwalList.map((item) => (
            <JadwalCard
              key={item.id_ibadah}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 className="text-base font-serif font-bold text-brand-primary">
                {editingItem ? 'Edit Jadwal Ibadah' : 'Input Jadwal Ibadah Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                ✕
              </button>
            </div>

            <JadwalForm
              id_pos={id_pos}
              initialData={editingItem}
              onSuccess={() => {
                setShowModal(false);
                toast.success('Berhasil Disimpan', 'Jadwal ibadah telah diperbarui.');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
