'use client';

import { useState } from 'react';
import {
  useLogPastoralList,
  useDeleteLogPastoral,
  useUpdateLogPastoral,
  LogPastoralItem,
} from '@/hooks/use-log-pastoral';
import { useToast } from '@/components/ui/toast';
import { PastoralPhotoPicker } from '@/components/pastoral/PastoralPhotoPicker';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  MapPin,
  Trash2,
  HeartHandshake,
  Edit,
  X,
  Save,
  Eye,
  Camera,
  Building,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

export default function LaporanPastoralPage() {
  const { toast, confirm: confirmModal } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPos] = useState('');

  // Selected Log state for Detail & Edit Modal
  const [selectedLog, setSelectedLog] = useState<LogPastoralItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Modal Edit Form state
  const [editKegiatan, setEditKegiatan] = useState('');
  const [editTgl, setEditTgl] = useState('');
  const [editJam, setEditJam] = useState('');
  const [editJmlJiwa, setEditJmlJiwa] = useState<number | ''>('');
  const [editCatatan, setEditCatatan] = useState('');
  const [editPhotoBase64, setEditPhotoBase64] = useState<string | null>(null);

  const { data: pastoralLogs, isLoading } = useLogPastoralList(searchQuery, selectedPos);
  const deleteMutation = useDeleteLogPastoral();
  const updateMutation = useUpdateLogPastoral();

  // Helper to extract time tag and photo from catatan string
  const extractMetaFromCatatan = (catatan?: string | null) => {
    if (!catatan) return { jamStr: '09:00', photoBase64: null, cleanNotes: '' };
    
    let jamStr = '09:00';
    let photoBase64: string | null = null;
    let cleanNotes = catatan;

    const timeMatch = cleanNotes.match(/\[⏰ Jam Pelayanan:\s*([\d:]+)\s*WIB\]/);
    if (timeMatch && timeMatch[1]) {
      jamStr = timeMatch[1];
      cleanNotes = cleanNotes.replace(/\[⏰ Jam Pelayanan:\s*[\d:]+\s*WIB\]\n?/, '');
    }

    const photoMatch = cleanNotes.match(/\[📷 FOTO_BASE64:(data:image\/[^;]+;base64,[^\]]+)\]/);
    if (photoMatch && photoMatch[1]) {
      photoBase64 = photoMatch[1];
      cleanNotes = cleanNotes.replace(/\[📷 FOTO_BASE64:data:image\/[^;]+;base64,[^\]]+\]\n?/, '');
    }

    return { jamStr, photoBase64, cleanNotes: cleanNotes.trim() };
  };

  const handleOpenDetailModal = (log: LogPastoralItem) => {
    const { jamStr, photoBase64, cleanNotes } = extractMetaFromCatatan(log.catatan);
    setSelectedLog(log);
    setEditKegiatan(log.kegiatan);
    setEditTgl(log.tgl);
    setEditJam(jamStr || '09:00');
    setEditJmlJiwa(log.jml_jiwa ?? '');
    setEditCatatan(cleanNotes);
    setEditPhotoBase64(photoBase64);
    setIsEditing(false);
  };

  const handleOpenEditDirect = (e: React.MouseEvent, log: LogPastoralItem) => {
    e.stopPropagation();
    handleOpenDetailModal(log);
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog) return;

    try {
      const jamStr = editJam || '09:00';
      let finalCatatan = editCatatan ? editCatatan.trim() : '';
      const timeTag = `[⏰ Jam Pelayanan: ${jamStr} WIB]`;
      finalCatatan = finalCatatan ? `${timeTag}\n${finalCatatan}` : timeTag;

      if (editPhotoBase64) {
        finalCatatan += `\n[📷 FOTO_BASE64:${editPhotoBase64}]`;
      }

      await updateMutation.mutateAsync({
        id_log: selectedLog.id_log,
        kegiatan: editKegiatan,
        tgl: editTgl,
        jml_jiwa: editJmlJiwa !== '' ? Number(editJmlJiwa) : null,
        catatan: finalCatatan,
      });

      toast.success('Log Pastoral Diperbarui', 'Data kegiatan & lokasi hierarki telah diperbarui.');
      setSelectedLog(null);
      setIsEditing(false);
    } catch (error: any) {
      toast.error('Gagal Memperbarui', error?.message || 'Terjadi kesalahan saat menyimpan perubahan.');
    }
  };

  const handleDelete = (e: React.MouseEvent, id_log: string, kegiatan: string) => {
    e.stopPropagation();
    confirmModal({
      title: 'Hapus Log Pastoral',
      message: `Apakah Anda yakin ingin menghapus catatan kegiatan "${kegiatan}"?`,
      confirmText: 'Hapus Log',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id_log);
          toast.success('Berhasil Dihapus', 'Catatan log pastoral telah dihapus.');
          if (selectedLog?.id_log === id_log) {
            setSelectedLog(null);
          }
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
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">Log Pastoral & Kunjungan</h1>
          <p className="text-xs md:text-sm text-text-muted mt-0.5">Catatan Pelayanan Pastoral, Konseling & Waktu Kunjungan Jemaat</p>
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
            placeholder="Cari log pastoral (kegiatan, mupel, jemaat, pos pelkes, pendeta)..."
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
            {isLoading ? 'Memuat...' : 'Klik kartu untuk melihat detail hierarki & foto'}
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
            {pastoralLogs.map((log) => {
              const { jamStr, photoBase64, cleanNotes } = extractMetaFromCatatan(log.catatan);

              const posNama = log.pos?.nama_pos;
              const posKategori = log.pos?.kategori || 'Pos Pelkes';
              const jemaatNama = log.pos?.jemaat_induk?.nama_induk;
              const mupelNama = log.pos?.jemaat_induk?.mupel?.nama_mupel;

              return (
                <div
                  key={log.id_log}
                  onClick={() => handleOpenDetailModal(log)}
                  className="bg-surface-elevated p-4.5 rounded-2xl border border-border-subtle shadow-soft space-y-3 hover:border-brand-primary hover:shadow-medium transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-serif font-bold text-base text-text-high leading-snug truncate group-hover:text-brand-primary transition-colors">
                        {log.kegiatan}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
                        <span className="inline-flex items-center gap-1 font-medium bg-surface-sunken px-2 py-0.5 rounded-md">
                          <Calendar size={13} className="text-brand-primary" />
                          {log.tgl}
                        </span>
                        {jamStr ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">
                            <Clock size={12} />
                            {jamStr} WIB
                          </span>
                        ) : null}
                        {log.jml_jiwa ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            <Users size={12} />
                            {log.jml_jiwa} Jiwa
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditDirect(e, log)}
                        className="p-2 rounded-xl text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
                        title="Edit Log Pastoral"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, log.id_log, log.kegiatan)}
                        className="p-2 rounded-xl text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Hapus Log"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Photo Thumbnail if available */}
                  {photoBase64 && (
                    <div className="relative h-28 w-full rounded-xl overflow-hidden bg-black/90 border border-border-subtle/80">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoBase64} alt="Foto Pastoral Stamped" className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
                        <Camera size={10} className="text-amber-400" />
                        <span>Foto GPS Stamped</span>
                      </div>
                    </div>
                  )}

                  {/* Full 3-Level Hierarchy Breakdown Details */}
                  <div className="bg-surface-base p-2.5 rounded-xl border border-border-subtle/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-text-muted">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin size={13} className="text-brand-primary" /> Pos Pelkes / Bajem:
                      </span>
                      <span className="font-bold text-text-high truncate max-w-[180px]">
                        {posNama ? `${posNama} (${posKategori})` : 'Pelayanan Jemaat Direct'}
                      </span>
                    </div>

                    {jemaatNama && (
                      <div className="flex items-center justify-between text-text-muted border-t border-border-subtle/30 pt-1">
                        <span className="flex items-center gap-1">
                          <Building size={13} className="text-blue-500" /> Jemaat Induk:
                        </span>
                        <span className="font-semibold text-text-high truncate max-w-[180px]">
                          {jemaatNama}
                        </span>
                      </div>
                    )}

                    {mupelNama && (
                      <div className="flex items-center justify-between text-text-muted border-t border-border-subtle/30 pt-1">
                        <span className="flex items-center gap-1">
                          <Layers size={13} className="text-purple-500" /> Mupel:
                        </span>
                        <span className="font-semibold text-text-high truncate max-w-[180px]">
                          {mupelNama}
                        </span>
                      </div>
                    )}

                    {log.pendeta && (
                      <div className="flex items-center justify-between text-text-muted border-t border-border-subtle/40 pt-1">
                        <span className="flex items-center gap-1">
                          <HeartHandshake size={13} className="text-emerald-500" /> Pelayan:
                        </span>
                        <span className="font-semibold text-text-high truncate max-w-[180px]">
                          {log.pendeta.nama_lengkap}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Catatan Snippet */}
                  {cleanNotes && (
                    <p className="text-xs text-text-high italic bg-surface-sunken/60 p-2.5 rounded-xl border border-border-subtle/40 line-clamp-2">
                      "{cleanNotes}"
                    </p>
                  )}

                  <div className="flex items-center justify-end text-[11px] font-semibold text-brand-primary gap-1 group-hover:translate-x-0.5 transition-transform pt-0.5">
                    <Eye size={12} />
                    <span>Lihat Detail Hierarki & Foto</span>
                  </div>
                </div>
              );
            })}
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

      {/* Modal Detail & Edit Log Pastoral */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                  <FileText size={18} />
                  <span>{isEditing ? 'Edit Log Pastoral' : 'Detail Log Pastoral'}</span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  ID Log: <strong className="text-text-high font-mono">{selectedLog.id_log}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal View / Form */}
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                {/* Tanggal & Jam */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
                      <Calendar size={14} className="text-brand-primary" />
                      Tanggal *
                    </label>
                    <input
                      type="date"
                      value={editTgl}
                      onChange={(e) => setEditTgl(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
                      <Clock size={14} className="text-brand-primary" />
                      Waktu / Jam *
                    </label>
                    <input
                      type="time"
                      value={editJam}
                      onChange={(e) => setEditJam(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Kegiatan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-high">Kegiatan Pastoral *</label>
                  <textarea
                    rows={3}
                    value={editKegiatan}
                    onChange={(e) => setEditKegiatan(e.target.value)}
                    required
                    placeholder="Deskripsi kegiatan..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                  />
                </div>

                {/* Foto Dokumentasi */}
                <PastoralPhotoPicker
                  photo={null}
                  photoUrl={editPhotoBase64}
                  onPhotoChange={(_, base64) => setEditPhotoBase64(base64 || null)}
                  disabled={updateMutation.isPending}
                />

                {/* Jumlah Jiwa */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
                    <Users size={14} className="text-brand-primary" />
                    Jumlah Jiwa Dilayani
                  </label>
                  <input
                    type="number"
                    value={editJmlJiwa}
                    onChange={(e) => setEditJmlJiwa(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
                  />
                </div>

                {/* Catatan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-high">Catatan Pastoral (Opsional)</label>
                  <textarea
                    rows={3}
                    value={editCatatan}
                    onChange={(e) => setEditCatatan(e.target.value)}
                    placeholder="Catatan hasil kunjungan..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                  />
                </div>

                {/* Modal Edit Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border-subtle text-xs font-bold text-text-high hover:bg-surface-sunken transition-all min-h-[44px]"
                  >
                    Batal Edit
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark active:scale-95 transition-all shadow-soft min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save size={16} />
                    <span>{updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Detail Information */}
                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-lg text-text-high">
                    {selectedLog.kegiatan}
                  </h3>
                  <div className="flex items-center gap-2.5 text-xs text-text-muted flex-wrap">
                    <span className="inline-flex items-center gap-1 font-medium bg-surface-sunken px-2.5 py-1 rounded-lg">
                      <Calendar size={14} className="text-brand-primary" />
                      Tanggal: {selectedLog.tgl}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-lg">
                      <Clock size={14} />
                      Waktu: {extractMetaFromCatatan(selectedLog.catatan).jamStr || '09:00'} WIB
                    </span>
                    {selectedLog.jml_jiwa ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-lg">
                        <Users size={14} />
                        {selectedLog.jml_jiwa} Jiwa Dilayani
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Photo Preview Full Modal */}
                {extractMetaFromCatatan(selectedLog.catatan).photoBase64 && (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/90 border border-border-subtle shadow-medium">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={extractMetaFromCatatan(selectedLog.catatan).photoBase64!}
                      alt="Dokumentasi Pastoral Stamped"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm border border-white/10">
                      <Camera size={13} className="text-amber-400" />
                      <span>Dokumentasi Foto Stamped</span>
                    </div>
                  </div>
                )}

                {/* Full 3-Level Hierarchy Breakdown in Detail Modal */}
                <div className="bg-surface-base p-3.5 rounded-2xl border border-border-subtle/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted flex items-center gap-1.5 font-medium">
                      <MapPin size={14} className="text-brand-primary" /> Pos Pelkes / Bajem:
                    </span>
                    <span className="font-bold text-text-high">
                      {selectedLog.pos?.nama_pos ? `${selectedLog.pos.nama_pos} (${selectedLog.pos.kategori || 'Pos Pelkes'})` : 'Pelayanan Jemaat Induk Direct'}
                    </span>
                  </div>

                  {selectedLog.pos?.jemaat_induk?.nama_induk && (
                    <div className="flex items-center justify-between border-t border-border-subtle/40 pt-2">
                      <span className="text-text-muted flex items-center gap-1.5">
                        <Building size={14} className="text-blue-500" /> Jemaat Induk Terkait:
                      </span>
                      <span className="font-bold text-text-high">
                        {selectedLog.pos.jemaat_induk.nama_induk}
                      </span>
                    </div>
                  )}

                  {selectedLog.pos?.jemaat_induk?.mupel?.nama_mupel && (
                    <div className="flex items-center justify-between border-t border-border-subtle/40 pt-2">
                      <span className="text-text-muted flex items-center gap-1.5">
                        <Layers size={14} className="text-purple-500" /> Mupel Terkait:
                      </span>
                      <span className="font-bold text-text-high">
                        {selectedLog.pos.jemaat_induk.mupel.nama_mupel}
                      </span>
                    </div>
                  )}

                  {selectedLog.pendeta && (
                    <div className="flex items-center justify-between border-t border-border-subtle/40 pt-2">
                      <span className="text-text-muted flex items-center gap-1.5">
                        <HeartHandshake size={14} className="text-emerald-500" /> Pelayan Pendeta:
                      </span>
                      <span className="font-bold text-text-high">
                        {selectedLog.pendeta.nama_lengkap}
                      </span>
                    </div>
                  )}
                </div>

                {extractMetaFromCatatan(selectedLog.catatan).cleanNotes ? (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-high">Catatan Tambahan:</label>
                    <p className="text-xs text-text-high italic bg-surface-sunken/60 p-3 rounded-xl border border-border-subtle/60 leading-relaxed whitespace-pre-line">
                      "{extractMetaFromCatatan(selectedLog.catatan).cleanNotes}"
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted italic">Tidak ada catatan tambahan.</p>
                )}

                {/* Modal View Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, selectedLog.id_log, selectedLog.kegiatan)}
                    className="py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/40 transition-all min-h-[44px] flex items-center gap-1.5"
                  >
                    <Trash2 size={16} />
                    <span>Hapus Log</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark active:scale-95 transition-all shadow-soft min-h-[44px] flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    <span>Edit Log & Hierarki</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
