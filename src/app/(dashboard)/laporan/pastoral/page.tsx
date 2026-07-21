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
import { PosCascadingSelector, HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
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
  Download,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

export default function LaporanPastoralPage() {
  const { toast, confirm: confirmModal } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPos] = useState('');

  // Selected Log state for Detail & Edit Modal
  const [selectedLog, setSelectedLog] = useState<LogPastoralItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);

  // Modal Edit Form state
  const [editKegiatan, setEditKegiatan] = useState('');
  const [editTgl, setEditTgl] = useState('');
  const [editJam, setEditJam] = useState('');
  const [editJmlJiwa, setEditJmlJiwa] = useState<number | ''>('');
  const [editCatatan, setEditCatatan] = useState('');
  const [editPhotoBase64, setEditPhotoBase64] = useState<string | null>(null);
  const [editIdPos, setEditIdPos] = useState<string | null>(null);
  const [editHierarchyMeta, setEditHierarchyMeta] = useState<HierarchyMetaInfo | null>(null);

  const { data: pastoralLogs, isLoading } = useLogPastoralList(searchQuery, selectedPos);
  const deleteMutation = useDeleteLogPastoral();
  const updateMutation = useUpdateLogPastoral();

  // Helper to extract time tag, photo, and hierarchy info from catatan string
  const extractMetaFromCatatan = (catatan?: string | null) => {
    if (!catatan) return { jamStr: '09:00', photoBase64: null, hierarchyInfo: null, cleanNotes: '' };
    
    let jamStr = '09:00';
    let photoBase64: string | null = null;
    let hierarchyInfo: { mupelName?: string; jemaatName?: string; posName?: string } | null = null;
    let cleanNotes = catatan;

    const timeMatch = cleanNotes.match(/\[⏰ Jam Pelayanan:\s*([\d:]+)\s*WIB\]/);
    if (timeMatch && timeMatch[1]) {
      jamStr = timeMatch[1];
      cleanNotes = cleanNotes.replace(/\[⏰ Jam Pelayanan:\s*[\d:]+\s*WIB\]\n?/, '');
    }

    const hierarchyMatch = cleanNotes.match(/\[🏛️ HIERARKI:\s*([^|]+)\|\s*([^|]+)\|\s*([^\]]+)\]/);
    if (hierarchyMatch) {
      hierarchyInfo = {
        mupelName: hierarchyMatch[1].trim(),
        jemaatName: hierarchyMatch[2].trim(),
        posName: hierarchyMatch[3].trim(),
      };
      cleanNotes = cleanNotes.replace(/\[🏛️ HIERARKI:\s*[^|]+\|\s*[^|]+\|\s*[^\]]+\]\n?/, '');
    }

    // Robust regex to extract full image base64 or URL
    const photoMatch = cleanNotes.match(/\[📷 FOTO_BASE64:([\s\S]+?)\]/);
    if (photoMatch && photoMatch[1]) {
      photoBase64 = photoMatch[1].trim();
      cleanNotes = cleanNotes.replace(/\[📷 FOTO_BASE64:[\s\S]+?\]\n?/, '');
    }

    return { jamStr, photoBase64, hierarchyInfo, cleanNotes: cleanNotes.trim() };
  };

  const handleShareWhatsApp = (e: React.MouseEvent, log: LogPastoralItem) => {
    e.stopPropagation();
    const { jamStr, hierarchyInfo, cleanNotes } = extractMetaFromCatatan(log.catatan);

    const posNama = log.pos?.nama_pos || hierarchyInfo?.posName || 'Pelayanan Jemaat Direct';
    const posKategori = log.pos?.kategori || 'Pos Pelkes';
    const jemaatNama = log.pos?.jemaat_induk?.nama_induk || hierarchyInfo?.jemaatName || '-';
    const mupelNama = log.pos?.jemaat_induk?.mupel?.nama_mupel || hierarchyInfo?.mupelName || '-';
    const pendetaNama = log.pendeta?.nama_lengkap || '-';

    const lines = [
      `📋 *LAPORAN KEGIATAN PASTORAL GPIB*`,
      `──────────────────────`,
      `✝️ *Kegiatan:* ${log.kegiatan}`,
      `📅 *Tanggal:* ${log.tgl}`,
      `⏰ *Waktu:* ${jamStr || '09:00'} WIB`,
      log.jml_jiwa ? `👥 *Jiwa Dilayani:* ${log.jml_jiwa} Jiwa` : null,
      ``,
      `📍 *LOKASI PELAYANAN HIERARKI:*`,
      `• *Pos Pelkes / Bajem:* ${posNama}${posNama !== 'Pelayanan Jemaat Direct' ? ` (${posKategori})` : ''}`,
      `• *Jemaat Induk:* ${jemaatNama}`,
      `• *Mupel:* ${mupelNama}`,
      ``,
      `👤 *Pelayan Pendeta:* ${pendetaNama}`,
      cleanNotes ? `\n📝 *Catatan Pelayanan:*\n"${cleanNotes}"` : null,
      `──────────────────────`,
      `_Dikirim melalui Aplikasi Sistem Informasi GPIB v2_`,
    ].filter(Boolean).join('\n');

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(lines)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
    setEditIdPos(log.id_pos || null);
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

      // Construct hierarchy tag if meta info is resolved
      const mupelName = editHierarchyMeta?.mupelName || selectedLog.pos?.jemaat_induk?.mupel?.nama_mupel || 'Mupel GPIB';
      const jemaatName = editHierarchyMeta?.jemaatName || selectedLog.pos?.jemaat_induk?.nama_induk || 'Jemaat Induk';
      const posName = editHierarchyMeta?.posName || selectedLog.pos?.nama_pos || 'Pelayanan Jemaat Direct';
      const hierarchyTag = `[🏛️ HIERARKI: ${mupelName} | ${jemaatName} | ${posName}]`;

      finalCatatan = `${timeTag}\n${hierarchyTag}\n${finalCatatan}`;

      if (editPhotoBase64) {
        finalCatatan += `\n[📷 FOTO_BASE64:${editPhotoBase64}]`;
      }

      await updateMutation.mutateAsync({
        id_log: selectedLog.id_log,
        kegiatan: editKegiatan,
        tgl: editTgl,
        jml_jiwa: editJmlJiwa !== '' ? Number(editJmlJiwa) : null,
        catatan: finalCatatan,
        id_pos: editIdPos || null,
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
      {/* Header Section (2 Clean Rows/Sections) */}
      <div className="bg-surface-elevated/60 p-4 rounded-2xl border border-border-subtle/60 shadow-soft space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-brand-primary">
            Log Pastoral & Kunjungan
          </h1>

          <Link
            href="/laporan/pastoral/baru"
            className="px-3.5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark active:scale-95 transition-all flex items-center gap-1.5 shadow-soft min-h-[44px] shrink-0"
          >
            <Plus size={18} className="shrink-0" />
            <span className="hidden sm:inline">Catat Kunjungan</span>
            <span className="sm:hidden">Log</span>
          </Link>
        </div>

        <p className="text-xs md:text-sm text-text-muted leading-relaxed">
          Catatan Pelayanan Pastoral, Konseling & Waktu Kunjungan Jemaat
        </p>
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
              const { jamStr, photoBase64, hierarchyInfo, cleanNotes } = extractMetaFromCatatan(log.catatan);

              const posNama = log.pos?.nama_pos || hierarchyInfo?.posName;
              const posKategori = log.pos?.kategori || 'Pos Pelkes';
              const jemaatNama = log.pos?.jemaat_induk?.nama_induk || hierarchyInfo?.jemaatName;
              const mupelNama = log.pos?.jemaat_induk?.mupel?.nama_mupel || hierarchyInfo?.mupelName;

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
                        onClick={(e) => handleShareWhatsApp(e, log)}
                        className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        title="Bagikan ke WhatsApp"
                      >
                        <Share2 size={16} />
                      </button>
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
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewPhotoUrl(photoBase64);
                      }}
                      className="relative h-36 w-full rounded-xl overflow-hidden bg-black/90 border border-border-subtle/80 cursor-zoom-in group/photo"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoBase64} alt="Foto Pastoral Stamped" className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/75 text-white text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-sm border border-white/10">
                        <Camera size={11} className="text-amber-400" />
                        <span>Foto GPS Stamped (Klik untuk Perbesar)</span>
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
                        {posNama && posNama !== 'Pelayanan Jemaat Direct' ? `${posNama} (${posKategori})` : 'Pelayanan Jemaat Direct'}
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

                  <div className="flex items-center justify-between pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => handleShareWhatsApp(e, log)}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Share2 size={12} />
                      <span>Share WA</span>
                    </button>

                    <div className="flex items-center text-[11px] font-semibold text-brand-primary gap-1 group-hover:translate-x-0.5 transition-transform">
                      <Eye size={12} />
                      <span>Lihat Detail Hierarki & Foto</span>
                    </div>
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

                {/* Selector Wilayah Hierarki (Mupel, Jemaat Induk, Pos Pelkes) */}
                <div className="space-y-1.5 border border-border-subtle/80 p-3 rounded-2xl bg-surface-base">
                  <label className="text-xs font-bold text-brand-primary flex items-center gap-1.5 mb-1">
                    <Building size={14} />
                    <span>Wilayah Pelayanan Hierarki (Mupel, Jemaat, Pos) *</span>
                  </label>
                  <PosCascadingSelector
                    value={editIdPos}
                    onChange={(val) => setEditIdPos(val)}
                    onMetaChange={(meta) => setEditHierarchyMeta(meta)}
                    defaultPosId={selectedLog?.id_pos || undefined}
                    disabled={updateMutation.isPending}
                    required={false}
                  />
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
                  hierarchyMeta={editHierarchyMeta}
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

                {/* Photo Preview Full Modal (Click to View High Res) */}
                {extractMetaFromCatatan(selectedLog.catatan).photoBase64 && (
                  <div
                    onClick={() => setViewPhotoUrl(extractMetaFromCatatan(selectedLog.catatan).photoBase64!)}
                    className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/90 border border-border-subtle shadow-medium cursor-zoom-in group/modalphoto"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={extractMetaFromCatatan(selectedLog.catatan).photoBase64!}
                      alt="Dokumentasi Pastoral Stamped"
                      className="w-full h-full object-cover group-hover/modalphoto:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm border border-white/10">
                      <Camera size={13} className="text-amber-400" />
                      <span>Dokumentasi Foto Stamped (Klik untuk Layar Penuh)</span>
                    </div>
                  </div>
                )}

                {/* Full 3-Level Hierarchy Breakdown in Detail Modal */}
                {(() => {
                  const { hierarchyInfo } = extractMetaFromCatatan(selectedLog.catatan);
                  const posNama = selectedLog.pos?.nama_pos || hierarchyInfo?.posName;
                  const posKategori = selectedLog.pos?.kategori || 'Pos Pelkes';
                  const jemaatNama = selectedLog.pos?.jemaat_induk?.nama_induk || hierarchyInfo?.jemaatName;
                  const mupelNama = selectedLog.pos?.jemaat_induk?.mupel?.nama_mupel || hierarchyInfo?.mupelName;

                  return (
                    <div className="bg-surface-base p-3.5 rounded-2xl border border-border-subtle/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted flex items-center gap-1.5 font-medium">
                          <MapPin size={14} className="text-brand-primary" /> Pos Pelkes / Bajem:
                        </span>
                        <span className="font-bold text-text-high">
                          {posNama && posNama !== 'Pelayanan Jemaat Direct' ? `${posNama} (${posKategori})` : 'Pelayanan Jemaat Direct'}
                        </span>
                      </div>

                      {jemaatNama && (
                        <div className="flex items-center justify-between border-t border-border-subtle/40 pt-2">
                          <span className="text-text-muted flex items-center gap-1.5">
                            <Building size={14} className="text-blue-500" /> Jemaat Induk Terkait:
                          </span>
                          <span className="font-bold text-text-high">
                            {jemaatNama}
                          </span>
                        </div>
                      )}

                      {mupelNama && (
                        <div className="flex items-center justify-between border-t border-border-subtle/40 pt-2">
                          <span className="text-text-muted flex items-center gap-1.5">
                            <Layers size={14} className="text-purple-500" /> Mupel Terkait:
                          </span>
                          <span className="font-bold text-text-high">
                            {mupelNama}
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
                  );
                })()}

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
                    onClick={(e) => handleShareWhatsApp(e, selectedLog)}
                    className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all min-h-[44px] flex items-center gap-1.5 shadow-soft"
                    title="Bagikan ke WhatsApp"
                  >
                    <Share2 size={16} />
                    <span className="hidden sm:inline">Bagikan WA</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, selectedLog.id_log, selectedLog.kegiatan)}
                    className="py-2.5 px-3.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/40 transition-all min-h-[44px] flex items-center gap-1.5"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Hapus Log</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark active:scale-95 transition-all shadow-soft min-h-[44px] flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    <span>Edit Log & Foto</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full-Screen Glassmorphic Lightbox Photo Viewer Modal */}
      {viewPhotoUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200"
          onClick={() => setViewPhotoUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setViewPhotoUrl(null)}
              className="absolute -top-12 right-0 sm:top-2 sm:right-2 z-20 p-2.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors border border-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Tutup Foto"
            >
              <X size={20} />
            </button>

            {/* High Resolution Image View */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewPhotoUrl}
              alt="Foto Pastoral Full Screen"
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-heavy border border-white/10"
            />

            {/* Bottom Actions */}
            <div className="flex items-center justify-between w-full max-w-xl px-2 text-xs text-white/90 gap-2">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5 truncate text-[11px] sm:text-xs">
                <Camera size={14} className="shrink-0" />
                <span className="truncate">Foto Dokumentasi Stamped</span>
              </span>
              <a
                href={viewPhotoUrl}
                download="foto-pastoral-gpib-stamped.jpg"
                className="p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold transition-all border border-white/30 flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] shrink-0 shadow-soft"
                title="Unduh Foto Dokumentasi"
              >
                <Download size={18} />
                <span className="hidden sm:inline text-xs">Unduh Foto</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
