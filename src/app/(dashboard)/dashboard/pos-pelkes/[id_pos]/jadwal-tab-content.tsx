'use client';

import { useState } from 'react';
import { useJadwalList, useDeleteJadwal, JadwalItem } from '@/hooks/use-jadwal';
import { JadwalCard } from '@/components/jadwal/JadwalCard';
import { JadwalForm } from '@/components/jadwal/JadwalForm';
import { useToast } from '@/components/ui/toast';
import { Plus, Calendar, Loader2, Share2, X, Trash2 } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3.5">
        <h3 className="flex items-center gap-2 text-base font-extrabold text-text-high">
          <Calendar className="w-5 h-5 text-brand-primary" />
          Daftar Jadwal Ibadah
        </h3>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {jadwalList && jadwalList.length > 0 && (
            <button
              type="button"
              onClick={handleShareAllWhatsApp}
              className="px-3.5 py-2 rounded-xl border border-emerald-600/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs min-h-[40px] flex-1 sm:flex-none"
            >
              <Share2 size={14} className="shrink-0" />
              <span>WA</span>
            </button>
          )}
          {canWrite && (
            <button
              type="button"
              onClick={handleAddNew}
              className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center justify-center gap-1.5 shadow-sm min-h-[40px] flex-1 sm:flex-none"
            >
              <Plus size={14} />
              <span>Jadwal</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Summary Ibadah: 2 Horizontal Sections */}
      {jadwalList && jadwalList.length > 0 && (
        <div className="bg-surface-elevated p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-soft space-y-3">
          {/* Section 1: Total Ringkasan */}
          <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Ringkasan Ibadah</span>
                <span className="text-xs font-bold text-text-high">Total Jadwal Terdaftar</span>
              </div>
            </div>
            <span className="text-lg font-black text-brand-primary tabular-nums">
              {jadwalList.length} <span className="text-xs font-normal text-text-muted">Jadwal</span>
            </span>
          </div>

          {/* Section 2: Split Rows - Ibadah Minggu vs Kategorial/Pos */}
          <div className="grid grid-cols-2 gap-3 pt-0.5 divide-x divide-border-subtle/60">
            <div className="flex items-center justify-between pr-2">
              <div>
                <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Ibadah Minggu</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400 tabular-nums">
                  {jadwalList.filter(j => j.jenis === 'Ibadah Hari Minggu').length} <span className="text-[10px] font-normal text-text-muted">Sesi</span>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pl-3 sm:pl-4">
              <div>
                <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Kategorial & Pos</span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400 tabular-nums">
                  {jadwalList.filter(j => j.jenis !== 'Ibadah Hari Minggu').length} <span className="text-[10px] font-normal text-text-muted">Sesi</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!jadwalList || jadwalList.length === 0 ? (
        <div className="bg-surface-elevated rounded-2xl p-8 text-center border border-border-subtle space-y-3">
          <Calendar size={36} className="mx-auto text-text-muted opacity-40 animate-pulse" />
          <p className="text-sm font-bold text-text-high">Belum ada Jadwal Ibadah</p>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Jadwal ibadah rutin hari Minggu maupun ibadah kategorial/pos belum diisi.
          </p>
          {canWrite && (
            <button
              type="button"
              onClick={handleAddNew}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-all shadow-sm active:scale-95 min-h-[40px]"
            >
              <Plus size={14} />
              <span>Jadwal Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {jadwalList.map((item) => (
            <JadwalCard
              key={item.id_ibadah}
              item={item}
              onClickCard={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Modal Form Mobile Bottom-Sheet Standard */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in">
          <div className="bg-surface-elevated w-full max-w-xl rounded-t-3xl sm:rounded-3xl border border-border-subtle shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken/50 shrink-0">
              <h3 className="font-serif font-bold text-text-high text-lg">
                {editingItem ? 'Detail & Edit Jadwal' : 'Input Jadwal Ibadah Baru'}
              </h3>
              <div className="flex items-center gap-2">
                {editingItem && canWrite && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      handleDelete(editingItem.id_ibadah);
                    }}
                    className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 flex items-center justify-center transition-colors border border-red-200 dark:border-red-900/50"
                    title="Hapus Jadwal Ibadah"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl bg-surface-sunken hover:bg-surface-elevated text-text-muted flex items-center justify-center transition-colors shadow-xs"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
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
        </div>
      )}
    </div>
  );
}
