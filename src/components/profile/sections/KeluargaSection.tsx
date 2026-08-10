'use client';

import React, { useState, useRef } from 'react';
import {
  Users,
  Plus,
  Heart,
  Trash2,
  Edit3,
  UserCheck,
  Phone,
  ShieldAlert,
  X,
  ChevronRight,
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
  User,
  Info,
  Camera,
  Image as ImageIcon,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useToast } from '@/components/ui/toast';
import { formatWhatsAppUrl } from '@/lib/utils';
import { useKeluargaPendeta } from '@/hooks/use-pendeta-360';
import {
  addKeluargaAction,
  updateKeluargaAction,
  deleteKeluargaAction,
} from '@/app/actions/pendeta';
import { KeluargaPendeta } from '@/types/pendeta-360.types';
import { HUBUNGAN_KELUARGA } from '@/lib/constants/pendeta-360.constants';
import { useQueryClient } from '@tanstack/react-query';
import { compressAvatarImage } from '@/lib/camera/compress';

interface KeluargaSectionProps {
  idPendeta?: string | null;
  isOwnerOrSuperUser: boolean;
}

export function KeluargaSection({ idPendeta, isOwnerOrSuperUser }: KeluargaSectionProps) {
  const { toast } = useToast();
  const { data: keluargaList = [], isLoading } = useKeluargaPendeta(idPendeta || undefined);
  const queryClient = useQueryClient();
  const [isPending, startTransition] = React.useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KeluargaPendeta | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<KeluargaPendeta | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [previewPhotoTitle, setPreviewPhotoTitle] = useState<string>('');

  // Form State
  const [hubungan, setHubungan] = useState<string>('Suami');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [gender, setGender] = useState<string>('Laki-Laki');
  const [fotoUrl, setFotoUrl] = useState('');
  const [tglLahir, setTglLahir] = useState('');
  const [noWa, setNoWa] = useState('');
  const [pendidikan, setPendidikan] = useState('');
  const [pekerjaan, setPekerjaan] = useState('');
  const [statusHidup, setStatusHidup] = useState<'Hidup' | 'Meninggal'>('Hidup');
  const [isTanggungan, setIsTanggungan] = useState(false);
  const [keterangan, setKeterangan] = useState('');

  const [isCompressingFoto, setIsCompressingFoto] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleOpenPhotoPreview = (url: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPreviewPhotoUrl(url);
    setPreviewPhotoTitle(title);
  };

  const handleFotoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const rawFile = files[0];

    const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
    if (rawFile.size > MAX_SIZE_BYTES) {
      toast.error('Ukuran Foto Terlalu Besar', 'Maksimal ukuran foto anggota keluarga yang diperbolehkan adalah 2 MB.');
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      return;
    }

    setIsCompressingFoto(true);
    try {
      const compressed = await compressAvatarImage(rawFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFotoUrl(base64);
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error('Error processing photo:', err);
      toast.error('Gagal Memuat Foto', 'Foto tidak dapat diproses, silakan coba foto lain.');
    } finally {
      setIsCompressingFoto(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

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
    setFotoUrl('');
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
    setFotoUrl(item.foto_url || '');
    setTglLahir(item.tgl_lahir || '');
    setNoWa(item.no_wa || '');
    setPendidikan(item.pendidikan || '');
    setPekerjaan(item.pekerjaan || '');
    setStatusHidup((item.status_hidup as 'Hidup' | 'Meninggal') || 'Hidup');
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
      foto_url: fotoUrl.trim() || null,
      tgl_lahir: tglLahir || null,
      no_wa: noWa || null,
      pendidikan: pendidikan || null,
      pekerjaan: pekerjaan || null,
      status_hidup: statusHidup,
      is_tanggungan: isTanggungan,
      keterangan: keterangan || null,
    };

    startTransition(async () => {
      try {
        let res;
        if (editingItem) {
          res = await updateKeluargaAction(editingItem.id_keluarga, idPendeta, payload);
          if (res.success) {
            toast.success('Berhasil Diperbarui', 'Data anggota keluarga berhasil diperbarui.');
          }
        } else {
          res = await addKeluargaAction(idPendeta, payload);
          if (res.success) {
            toast.success('Berhasil Ditambahkan', 'Data anggota keluarga berhasil ditambahkan.');
          }
        }
        
        if (res?.success) {
          queryClient.invalidateQueries({ queryKey: ['keluarga-pendeta', idPendeta] });
          setIsModalOpen(false);
        } else {
          toast.error('Gagal Menyimpan', res?.error || 'Terjadi kesalahan saat menyimpan data keluarga.');
        }
      } catch (err: any) {
        toast.error('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan data keluarga.');
      }
    });
  };

  const handleDelete = (id_keluarga: string) => {
    if (!idPendeta || !confirm('Apakah Anda yakin ingin menghapus data anggota keluarga ini?')) return;
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    
    startTransition(async () => {
      try {
        const res = await deleteKeluargaAction(id_keluarga, idPendeta);
        if (res.success) {
          toast.success('Berhasil Dihapus', 'Data anggota keluarga telah dihapus.');
          queryClient.invalidateQueries({ queryKey: ['keluarga-pendeta', idPendeta] });
          setSelectedDetailItem(null);
        } else {
          toast.error('Gagal Menghapus', res.error || 'Terjadi kesalahan saat menghapus anggota keluarga.');
        }
      } catch (err: any) {
        toast.error('Gagal Menghapus', err.message || 'Terjadi kesalahan saat menghapus anggota keluarga.');
      }
    });
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
                onClick={() => setSelectedDetailItem(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedDetailItem(item);
                  }
                }}
                className="card-flat p-4 space-y-3 relative group border border-line-subtle hover:border-brand-500 hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  {/* Photo Avatar */}
                  <div
                    onClick={(e) => {
                      if (item.foto_url) {
                        handleOpenPhotoPreview(item.foto_url, item.nama_lengkap, e);
                      }
                    }}
                    className={`w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center font-semibold overflow-hidden shrink-0 border border-border-subtle ${
                      item.foto_url ? 'cursor-pointer hover:ring-2 hover:ring-brand-500 hover:scale-105 transition-all' : ''
                    }`}
                    title={item.foto_url ? 'Klik untuk melihat foto ukuran penuh' : undefined}
                  >
                    {item.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.foto_url} alt={item.nama_lengkap} className="w-full h-full object-cover" />
                    ) : (
                      <User size={22} />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
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
                    <h4 className="text-base font-bold text-ink-primary group-hover:text-brand-600 transition-colors truncate">
                      {item.nama_lengkap}
                    </h4>
                  </div>

                  <div className="p-1.5 rounded-lg text-ink-tertiary group-hover:text-brand-600 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/30 transition-colors shrink-0">
                    <ChevronRight size={18} />
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
                    <p className="truncate">
                      <strong className="text-ink-primary font-medium">Pekerjaan:</strong> {item.pekerjaan}
                    </p>
                  )}
                  {item.no_wa && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    >
                      <a
                        href={formatWhatsAppUrl(item.no_wa) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs hover:underline border border-emerald-500/20"
                        title="Hubungi via WhatsApp"
                      >
                        <Phone size={13} />
                        <span>{item.no_wa}</span>
                        <ExternalLink size={11} className="opacity-75" />
                      </a>
                    </div>
                  )}
                </div>

                {item.keterangan && (
                  <p className="text-xs text-ink-tertiary italic line-clamp-1">"{item.keterangan}"</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Anggota Keluarga */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface-elevated rounded-t-3xl sm:rounded-3xl p-6 space-y-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Header Detail Modal */}
            <div className="flex items-start justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => {
                    if (selectedDetailItem.foto_url) {
                      handleOpenPhotoPreview(selectedDetailItem.foto_url, selectedDetailItem.nama_lengkap);
                    }
                  }}
                  className={`w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold shrink-0 overflow-hidden border border-brand-primary/20 ${
                    selectedDetailItem.foto_url ? 'cursor-pointer hover:ring-2 hover:ring-brand-500 hover:scale-105 transition-all' : ''
                  }`}
                  title={selectedDetailItem.foto_url ? 'Klik untuk memperbesar foto' : undefined}
                >
                  {selectedDetailItem.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedDetailItem.foto_url} alt={selectedDetailItem.nama_lengkap} className="w-full h-full object-cover" />
                  ) : (
                    <User size={28} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
                      {selectedDetailItem.hubungan}
                    </span>
                    {selectedDetailItem.is_tanggungan && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1">
                        <UserCheck size={12} />
                        Tanggungan
                      </span>
                    )}
                    {selectedDetailItem.status_hidup === 'Meninggal' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                        Almarhum/ah
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-ink-primary mt-1">{selectedDetailItem.nama_lengkap}</h3>
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
                    <User size={14} className="text-brand-primary" />
                    <span>Jenis Kelamin</span>
                  </span>
                  <p className="font-semibold text-text-high">{selectedDetailItem.gender || '-'}</p>
                </div>

                <div className="p-3 bg-surface-sunken rounded-2xl border border-border-subtle space-y-1">
                  <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                    <Info size={14} className="text-brand-primary" />
                    <span>Status Hidup</span>
                  </span>
                  <p className="font-semibold text-text-high">{selectedDetailItem.status_hidup || 'Hidup'}</p>
                </div>
              </div>

              {selectedDetailItem.tgl_lahir && (
                <div className="p-3 bg-surface-sunken rounded-2xl border border-border-subtle space-y-1">
                  <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                    <Calendar size={14} className="text-brand-primary" />
                    <span>Tanggal Lahir & Usia</span>
                  </span>
                  <p className="font-semibold text-text-high">
                    {format(new Date(selectedDetailItem.tgl_lahir), 'd MMMM yyyy', { locale: localeId })}{' '}
                    <span className="text-text-muted font-normal">
                      ({differenceInYears(new Date(), new Date(selectedDetailItem.tgl_lahir))} tahun)
                    </span>
                  </p>
                </div>
              )}

              {selectedDetailItem.no_wa && (
                <div className="p-3 bg-surface-sunken rounded-2xl border border-border-subtle space-y-1">
                  <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                    <Phone size={14} className="text-emerald-600" />
                    <span>Nomor WhatsApp / Telepon</span>
                  </span>
                  <a
                    href={formatWhatsAppUrl(selectedDetailItem.no_wa) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5 pt-0.5"
                    title="Hubungi via WhatsApp"
                  >
                    <span>{selectedDetailItem.no_wa}</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedDetailItem.pendidikan && (
                  <div className="p-3 bg-surface-sunken rounded-2xl border border-border-subtle space-y-1">
                    <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-brand-primary" />
                      <span>Pendidikan</span>
                    </span>
                    <p className="font-semibold text-text-high">{selectedDetailItem.pendidikan}</p>
                  </div>
                )}

                {selectedDetailItem.pekerjaan && (
                  <div className="p-3 bg-surface-sunken rounded-2xl border border-border-subtle space-y-1">
                    <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                      <Briefcase size={14} className="text-brand-primary" />
                      <span>Pekerjaan</span>
                    </span>
                    <p className="font-semibold text-text-high">{selectedDetailItem.pekerjaan}</p>
                  </div>
                )}
              </div>

              {selectedDetailItem.keterangan && (
                <div className="p-3 bg-surface-sunken rounded-2xl border border-border-subtle space-y-1">
                  <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                    <FileText size={14} className="text-brand-primary" />
                    <span>Keterangan / Catatan</span>
                  </span>
                  <p className="text-xs text-text-high italic">"{selectedDetailItem.keterangan}"</p>
                </div>
              )}
            </div>

            {/* Action Header/Footer inside Details: Edit & Delete buttons */}
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
                <span>Edit Anggota</span>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(selectedDetailItem.id_keluarga)}
                className="min-h-[44px] px-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Trash2 size={15} />
                <span>Hapus</span>
              </button>
            </div>
          </div>
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
              {/* Photo Input / Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-ink-secondary">Foto Anggota Keluarga</label>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-surface-sunken border border-border-subtle">
                  <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 border border-border-subtle relative group">
                    {fotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={fotoUrl} alt="Preview Foto" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} />
                    )}
                    {fotoUrl && (
                      <button
                        type="button"
                        onClick={() => setFotoUrl('')}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hapus Foto"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={isCompressingFoto}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark active:scale-95 transition-all min-h-[40px] disabled:opacity-50"
                      >
                        {isCompressingFoto ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                        <span>Kamera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={isCompressingFoto}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-surface-elevated text-text-high border border-border-subtle hover:bg-surface-sunken text-xs font-bold active:scale-95 transition-all min-h-[40px] disabled:opacity-50"
                      >
                        <ImageIcon size={14} className="text-brand-primary" />
                        <span>Galeri</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-text-muted truncate">Kamera HP atau upload galeri (Maksimal 2 MB, Kompres HD)</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-text-muted">Atau Gunakan URL Foto:</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={fotoUrl}
                    onChange={(e) => setFotoUrl(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-line-subtle bg-surface-1 text-xs font-mono text-ink-primary"
                  />
                </div>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFotoFileSelect}
                  className="hidden"
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFotoFileSelect}
                  className="hidden"
                />
              </div>

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
                    onChange={(e) => setStatusHidup(e.target.value as 'Hidup' | 'Meninggal')}
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
                  disabled={isPending || isCompressingFoto}
                  className="flex-1 h-12 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-2xs hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {isCompressingFoto ? 'Memproses Foto...' : isPending ? <RefreshCw className="animate-spin" size={16} /> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal Preview Foto Ukuran Penuh */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div
            className="relative max-w-2xl w-full flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="w-full flex items-center justify-between text-white pb-1">
              <span className="text-sm font-bold truncate">{previewPhotoTitle || 'Foto Anggota Keluarga'}</span>
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                title="Tutup Preview"
              >
                <X size={20} />
              </button>
            </div>

            {/* Enlarged Image */}
            <div className="relative max-h-[80vh] w-full flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-black/40 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhotoUrl}
                alt={previewPhotoTitle}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-lg"
              />
            </div>

            <p className="text-xs text-white/70 italic text-center">Klik di luar gambar atau tombol X untuk menutup</p>
          </div>
        </div>
      )}
    </section>
  );
}


