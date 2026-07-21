'use client';

import { useState } from 'react';
import { useLogPastoralList, useDeleteLogPastoral } from '@/hooks/use-log-pastoral';
import { useToast } from '@/components/ui/toast';
import { FileText, Plus, Search, Calendar, Users, MapPin, Trash2, HeartHandshake } from 'lucide-react';
import Link from 'next/link';

export default function LaporanPastoralPage() {
  const { toast, confirm: confirmModal } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPos] = useState('');

  const { data: pastoralLogs, isLoading } = useLogPastoralList(searchQuery, selectedPos);
  const deleteMutation = useDeleteLogPastoral();

  const handleDelete = (id_log: string, kegiatan: string) => {
    confirmModal({
      title: 'Hapus Log Pastoral',
      message: `Apakah Anda yakin ingin menghapus catatan kegiatan "${kegiatan}"?`,
      confirmText: 'Hapus Log',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id_log);
          toast.success('Berhasil Dihapus', 'Catatan log pastoral telah dihapus.');
        } catch {
          toast.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus data.');
        }
      },
    });
  };

  const totalLogs = pastoralLogs?.length || 0;
  
  const currentMonthLogs = pastoralLogs?.filter((l) => {
    const d = new Date(l.tgl);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length || 0;

  const totalJiwaServed = pastoralLogs?.reduce((sum, l) => sum + (l.jml_jiwa || 0), 0) || 0;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">Log Pastoral & Kunjungan</h1>
          <p className="text-xs md:text-sm text-text-muted mt-0.5">Catatan Pelayanan Pastoral, Konseling & Kunjungan Rumah Jemaat Pos</p>
        </div>

        <Link
          href="/laporan/pastoral/baru"
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-dark transition-all flex items-center gap-2 shadow-soft min-h-[44px]"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">+ Catat Kunjungan</span>
          <span className="sm:hidden">+ Log</span>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-text-muted font-medium">Total Log Pastoral</p>
          <p className="text-2xl font-serif font-bold text-brand-primary tabular-nums mt-1">{totalLogs}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Catatan Terdaftar</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Pelayanan Bulan Ini</p>
          <p className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">{currentMonthLogs}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Kunjungan Terbuka</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Jiwa Dilayani</p>
          <p className="text-2xl font-serif font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-1">{totalJiwaServed}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Jiwa Terjangkau</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Cari log pastoral (kegiatan, catatan, pos pelkes, pendeta)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
          />
        </div>
      </div>

      {/* Logs List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-high">
            Riwayat Kegiatan Pastoral ({pastoralLogs?.length || 0})
          </h2>
          <span className="text-xs text-text-muted">
            {isLoading ? 'Memuat...' : `${totalLogs} Catatan`}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle animate-pulse space-y-3">
                <div className="h-4 bg-surface-sunken rounded w-3/4"></div>
                <div className="h-3 bg-surface-sunken rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : pastoralLogs && pastoralLogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pastoralLogs.map((log) => (
              <div
                key={log.id_log}
                className="bg-surface-elevated p-4.5 rounded-2xl border border-border-subtle shadow-soft space-y-3 hover:border-brand-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-serif font-bold text-base text-text-high leading-snug truncate">
                      {log.kegiatan}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={13} className="text-brand-primary" />
                        {log.tgl}
                      </span>
                      {log.jml_jiwa ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          <Users size={12} />
                          {log.jml_jiwa} Jiwa
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(log.id_log, log.kegiatan)}
                    className="p-2 rounded-xl text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                    title="Hapus Log"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Details Meta */}
                <div className="bg-surface-base p-2.5 rounded-xl border border-border-subtle/60 text-xs space-y-1">
                  <div className="flex items-center justify-between text-text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-brand-primary" /> Pos Pelkes:
                    </span>
                    <span className="font-semibold text-text-high truncate max-w-[180px]">
                      {log.pos?.nama_pos || 'Jemaat Induk Direct'}
                    </span>
                  </div>
                  {log.pendeta && (
                    <div className="flex items-center justify-between text-text-muted">
                      <span className="flex items-center gap-1">
                        <HeartHandshake size={13} className="text-brand-primary" /> Pelayan:
                      </span>
                      <span className="font-semibold text-text-high truncate max-w-[180px]">
                        {log.pendeta.nama_lengkap}
                      </span>
                    </div>
                  )}
                </div>

                {/* Catatan */}
                {log.catatan && (
                  <p className="text-xs text-text-high italic bg-surface-sunken/60 p-2.5 rounded-xl border border-border-subtle/40">
                    "{log.catatan}"
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-elevated rounded-2xl p-10 text-center border border-border-subtle space-y-3">
            <FileText size={40} className="mx-auto text-text-muted opacity-40" />
            <h3 className="font-serif font-bold text-text-high text-base">Belum Ada Log Pastoral</h3>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              Catat kunjungan rumah tangga, konseling jemaat, dan pelayanan sakramen/doa di Pos Pelkes.
            </p>
            <Link
              href="/laporan/pastoral/baru"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-dark transition-all shadow-soft min-h-[44px]"
            >
              <Plus size={16} />
              <span>Tambah Log Pastoral Baru</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
