'use client';

import React, { useState, useRef } from 'react';
import {
  Award,
  Plus,
  Sparkles,
  Trash2,
  Edit3,
  Compass,
  CheckCircle2,
  ChevronRight,
  X,
  Calendar,
  FileText,
  Upload,
  Download,
  Paperclip,
  FileCheck,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useKompetensiPendeta } from '@/hooks/use-pendeta-360';
import {
  addKompetensiAction,
  updateKompetensiAction,
  deleteKompetensiAction,
} from '@/app/actions/pendeta';
import { KompetensiPendeta } from '@/types/pendeta-360.types';
import { useQueryClient } from '@tanstack/react-query';
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
  const { toast } = useToast();
  const { data: kompetensiList = [], isLoading } = useKompetensiPendeta(idPendeta || undefined);
  const queryClient = useQueryClient();
  const [isPending, startTransition] = React.useTransition();

  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KompetensiPendeta | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<KompetensiPendeta | null>(null);

  // Form State
  const [kategori, setKategori] = useState<string>('Manajemen');
  const [namaKompetensi, setNamaKompetensi] = useState('');
  const [jenis, setJenis] = useState<string>('Kompetensi');
  const [tingkat, setTingkat] = useState<string>('Menengah');
  const [tahunMulai, setTahunMulai] = useState<string>('');
  const [dokumenUrl, setDokumenUrl] = useState<string>('');
  const [docFileName, setDocFileName] = useState<string | null>(null);
  const [keterangan, setKeterangan] = useState('');

  const docInputRef = useRef<HTMLInputElement>(null);

  const filteredList =
    selectedKategori === 'Semua'
      ? kompetensiList
      : kompetensiList.filter((item) => item.kategori === selectedKategori);

  const categoriesAvailable = Array.from(new Set(kompetensiList.map((item) => item.kategori)));

  const handleDocumentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_DOC_SIZE_BYTES = 6 * 1024 * 1024; // 6MB
    if (file.size > MAX_DOC_SIZE_BYTES) {
      toast.error('Ukuran Dokumen Terlalu Besar', 'Maksimal ukuran file PDF / DOCX yang diperbolehkan adalah 6 MB.');
      if (docInputRef.current) docInputRef.current.value = '';
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isDocx =
      file.type.includes('word') ||
      file.type.includes('officedocument') ||
      file.name.endsWith('.docx') ||
      file.name.endsWith('.doc');

    if (!isPdf && !isDocx) {
      toast.error('Format File Tidak Sesuai', 'Harap unggah file dokumen berformat PDF atau DOCX.');
      if (docInputRef.current) docInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      setDokumenUrl(base64Str);
      setDocFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = () => {
    setDokumenUrl('');
    setDocFileName(null);
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setKategori('Manajemen');
    setNamaKompetensi('');
    setJenis('Kompetensi');
    setTingkat('Menengah');
    setTahunMulai('');
    setDokumenUrl('');
    setDocFileName(null);
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
    setDokumenUrl(item.dokumen_url || '');
    setDocFileName(item.dokumen_url ? 'Dokumen Sertifikat/Pendukung' : null);
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
      dokumen_url: dokumenUrl.trim() || null,
      keterangan: keterangan || null,
    };

    startTransition(async () => {
      try {
        let res;
        if (editingItem) {
          res = await updateKompetensiAction(editingItem.id_kompetensi, idPendeta, payload);
          if (res.success) {
            toast.success('Berhasil Diperbarui', 'Data kompetensi berhasil diperbarui.');
          }
        } else {
          res = await addKompetensiAction(idPendeta, payload);
          if (res.success) {
            toast.success('Berhasil Ditambahkan', 'Data kompetensi berhasil ditambahkan.');
          }
        }

        if (res?.success) {
          queryClient.invalidateQueries({ queryKey: ['kompetensi-pendeta', idPendeta] });
          setIsModalOpen(false);
        } else {
          toast.error('Gagal Menyimpan', res?.error || 'Terjadi kesalahan saat menyimpan kompetensi.');
        }
      } catch (err: any) {
        toast.error('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan kompetensi.');
      }
    });
  };

  const handleDelete = (id_kompetensi: string) => {
    if (!idPendeta || !confirm('Apakah Anda yakin ingin menghapus kompetensi ini?')) return;
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    startTransition(async () => {
      try {
        const res = await deleteKompetensiAction(id_kompetensi, idPendeta);
        if (res.success) {
          toast.success('Berhasil Dihapus', 'Data kompetensi telah dihapus.');
          queryClient.invalidateQueries({ queryKey: ['kompetensi-pendeta', idPendeta] });
          setSelectedDetailItem(null);
        } else {
          toast.error('Gagal Menghapus', res.error || 'Terjadi kesalahan saat menghapus kompetensi.');
        }
      } catch (err: any) {
        toast.error('Gagal Menghapus', err.message || 'Terjadi kesalahan saat menghapus kompetensi.');
      }
    });
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
              onClick={() => setSelectedDetailItem(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedDetailItem(item);
                }
              }}
              className="card-flat p-4 space-y-3 relative group border border-line-subtle hover:border-purple-500 hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getJenisBadge(item.jenis)}
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-sunken text-ink-secondary border border-line-subtle">
                      {item.kategori}
                    </span>
                    {item.dokumen_url && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1">
                        <Paperclip size={10} />
                        Dokumen
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-ink-primary group-hover:text-purple-600 transition-colors truncate">
                    {item.nama_kompetensi}
                  </h4>
                </div>

                <div className="p-1.5 rounded-lg text-ink-tertiary group-hover:text-purple-600 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/30 transition-colors shrink-0">
                  <ChevronRight size={18} />
                </div>
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
                <p className="text-xs text-ink-tertiary italic line-clamp-1">"{item.keterangan}"</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail Kompetensi & Karunia */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface-elevated rounded-t-3xl sm:rounded-3xl p-6 space-y-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Header Detail Modal */}
            <div className="flex items-start justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                  <Sparkles size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getJenisBadge(selectedDetailItem.jenis)}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-sunken text-ink-secondary border border-line-subtle">
                      {selectedDetailItem.kategori}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-ink-primary mt-1">{selectedDetailItem.nama_kompetensi}</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high shrink-0 min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Rincian Info */}
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-surface-sunken rounded-2xl border border-border-subtle space-y-1">
                  <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-brand-primary" />
                    <span>Tingkat Kemahiran</span>
                  </span>
                  <p className="font-semibold text-text-high">{selectedDetailItem.tingkat || 'Belum diatur'}</p>
                </div>

                <div className="p-3 bg-surface-sunken rounded-2xl border border-border-subtle space-y-1">
                  <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                    <Calendar size={14} className="text-brand-primary" />
                    <span>Tahun Mulai</span>
                  </span>
                  <p className="font-semibold text-text-high">
                    {selectedDetailItem.tahun_mulai ? `Sejak tahun ${selectedDetailItem.tahun_mulai}` : 'Tidak dicatat'}
                  </p>
                </div>
              </div>

              {selectedDetailItem.dokumen_url && (
                <div className="p-3.5 bg-surface-sunken rounded-2xl border border-border-subtle space-y-2">
                  <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                    <FileText size={14} className="text-purple-600" />
                    <span>Dokumen Sertifikat / Bukti Pendukung</span>
                  </span>
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-surface-elevated rounded-xl border border-border-subtle">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck size={18} className="text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-text-high truncate">
                        Sertifikat / Dokumen Pendukung (PDF/DOCX)
                      </span>
                    </div>
                    <a
                      href={selectedDetailItem.dokumen_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors shrink-0"
                    >
                      <Download size={13} />
                      <span>Unduh / Buka</span>
                    </a>
                  </div>
                </div>
              )}

              {selectedDetailItem.keterangan && (
                <div className="p-3 bg-surface-sunken rounded-2xl border border-border-subtle space-y-1">
                  <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                    <FileText size={14} className="text-brand-primary" />
                    <span>Keterangan / Pengalaman</span>
                  </span>
                  <p className="text-xs text-text-high leading-relaxed italic">"{selectedDetailItem.keterangan}"</p>
                </div>
              )}
            </div>

            {/* Action Header/Footer inside Details: Edit & Delete buttons */}
            {canEdit && (
              <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedDetailItem;
                    setSelectedDetailItem(null);
                    handleOpenEdit(target);
                  }}
                  className="flex-1 min-h-[44px] px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xs"
                >
                  <Edit3 size={15} />
                  <span>Edit Kompetensi</span>
                </button>

                <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(selectedDetailItem.id_kompetensi)}
                className="min-h-[44px] px-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Trash2 size={15} />
                <span>Hapus</span>
              </button>
              </div>
            )}
          </div>
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

              {/* Document Input (PDF/DOCX up to 6MB) */}
              <div className="space-y-2 bg-surface-sunken p-3.5 rounded-2xl border border-border-subtle">
                <label className="block text-xs font-semibold text-ink-secondary">
                  Dokumen Sertifikat / Bukti Pendukung (PDF / DOCX, Maks. 6 MB)
                </label>

                {!dokumenUrl ? (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border-subtle rounded-xl bg-surface-base hover:border-purple-500 cursor-pointer transition-colors group/upload">
                    <Upload size={22} className="text-text-muted group-hover/upload:text-purple-600 mb-1 transition-colors" />
                    <span className="text-xs font-semibold text-text-high">Unggah Dokumen PDF / DOCX</span>
                    <span className="text-[10px] text-text-muted mt-0.5 font-medium">Ukuran maksimal 6 MB</span>
                    <input
                      ref={docInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                      onChange={handleDocumentFileSelect}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-base border border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileCheck size={18} />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-text-high truncate">{docFileName || 'Dokumen Terlampir'}</p>
                        <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          <span>Dokumen Berhasil Divalidasi (Maks. 6MB)</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveDoc}
                      className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                      title="Hapus Dokumen"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold text-text-muted">Atau Gunakan Tautan URL Dokumen:</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={dokumenUrl}
                    onChange={(e) => {
                      setDokumenUrl(e.target.value);
                      if (e.target.value) setDocFileName('URL Dokumen External');
                      else setDocFileName(null);
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-line-subtle bg-surface-1 text-xs font-mono text-ink-primary"
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
    </section>
  );
}
