'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Edit3, Church, Phone, Award, Loader2, Camera, Image as ImageIcon, Trash2, User, Sparkles, Heart, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { updatePersonAction, UpdatePersonInput } from '@/app/(dashboard)/people/actions';
import { compressAvatarImage } from '@/lib/camera/compress';
import { parsePersonName, formatSplitName, calculateAge, STANDARD_PREFIX_TITLES } from '@/lib/utils/name-parser';
import { UnifiedPersonData } from '@/types/person.types';

interface EditPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: UnifiedPersonData;
  isSelf?: boolean;
}

export function EditPersonModal({
  isOpen,
  onClose,
  person,
}: EditPersonModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showNik, setShowNik] = useState(false);

  // Split Name States
  const [gelarDepan, setGelarDepan] = useState<string>('Pdt.');
  const [namaDepan, setNamaDepan] = useState<string>('');
  const [namaTengah, setNamaTengah] = useState<string>('');
  const [namaBelakang, setNamaBelakang] = useState<string>('');
  const [namaPanggilan, setNamaPanggilan] = useState<string>('');
  const [gelarBelakang, setGelarBelakang] = useState<string>('');

  const [formData, setFormData] = useState<UpdatePersonInput>({
    nama_lengkap: person.identity?.nama_lengkap || '',
    no_wa: person.profile?.data?.no_hp || '',
    email: person.profile?.data?.email || '',
    gender: (person.profile?.data as any)?.gender || 'Laki-laki',
    tempat_lahir: person.profile?.data?.tempat_lahir || '',
    tgl_lahir: person.profile?.data?.tanggal_lahir || '',
    nik: (person as any)?.nik || (person.profile?.data as any)?.nik || '',
    nip: (person as any)?.nip || (person.profile?.data as any)?.nip || (person as any)?.id_pendeta || '',
    status: person.overview?.is_active ? 'Aktif' : 'Nonaktif',
    foto_url: person.identity?.foto_url || '',
  });

  useEffect(() => {
    if (!isOpen) return;

    const rawFullName = person.identity?.nama_lengkap || '';
    const parsed = parsePersonName(rawFullName);

    setGelarDepan(parsed.gelarDepan || 'Pdt.');
    setNamaDepan(parsed.namaDepan || '');
    setNamaTengah(parsed.namaTengah || '');
    setNamaBelakang(parsed.namaBelakang || '');
    setNamaPanggilan(parsed.namaPanggilan || parsed.namaDepan || '');
    setGelarBelakang(parsed.gelarBelakang || '');

    setFormData({
      nama_lengkap: parsed.canonicalFullName || rawFullName,
      no_wa: person.profile?.data?.no_hp || '',
      email: person.profile?.data?.email || '',
      gender: (person.profile?.data as any)?.gender || 'Laki-laki',
      tempat_lahir: person.profile?.data?.tempat_lahir || '',
      tgl_lahir: person.profile?.data?.tanggal_lahir || '',
      nik: (person as any)?.nik || (person.profile?.data as any)?.nik || '',
      nip: (person as any)?.nip || (person.profile?.data as any)?.nip || (person as any)?.id_pendeta || '',
      status: person.overview?.is_active ? 'Aktif' : 'Nonaktif',
      foto_url: person.identity?.foto_url || '',
    });
  }, [isOpen, person]);

  // Realtime calculated age
  const calculatedAge = calculateAge(formData.tgl_lahir);

  // Sync canonical name on changes
  const handleNamePartsChange = (
    prefix: string,
    first: string,
    middle: string,
    family: string,
    suffix: string
  ) => {
    setGelarDepan(prefix);
    setNamaDepan(first);
    setNamaTengah(middle);
    setNamaBelakang(family);
    setGelarBelakang(suffix);

    const canonical = formatSplitName(prefix, first, middle, family, suffix);
    setFormData((prev) => ({ ...prev, nama_lengkap: canonical }));
  };

  if (!isOpen) return null;

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const rawFile = files[0];

    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
    if (rawFile.size > MAX_SIZE_BYTES) {
      toast.error('Ukuran Terlalu Besar', 'Maksimal ukuran foto adalah 5 MB.');
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      return;
    }

    setIsCompressing(true);
    try {
      const compressed = await compressAvatarImage(rawFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setFormData((prev) => ({ ...prev, foto_url: base64 }));
          toast.success('Foto Siap Disimpan', 'Foto profil berhasil diproses.');
        }
        setIsCompressing(false);
      };
      reader.onerror = () => {
        toast.error('Gagal Membaca File', 'Terjadi kesalahan saat memproses foto.');
        setIsCompressing(false);
      };
      reader.readAsDataURL(compressed);
    } catch (err: any) {
      console.error('Error compressing image:', err);
      toast.error('Gagal Kompresi', err?.message || 'Tidak dapat memproses foto.');
      setIsCompressing(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, foto_url: null }));
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    toast.success('Foto Dihapus', 'Foto profil akan dihapus saat disimpan.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_lengkap?.trim()) {
      toast.error('Nama Wajib Diisi', 'Silakan masukkan nama personil.');
      return;
    }

    if (formData.nik && formData.nik.length !== 16) {
      toast.error('Format NIK Tidak Valid', 'Nomor KTP (NIK) harus berjumlah tepat 16 digit angka.');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetId = person.id_person;
      const res = await updatePersonAction(targetId, {
        ...formData,
        nama_depan: namaDepan,
        nama_tengah: namaTengah,
        nama_belakang: namaBelakang,
        nama_panggilan: namaPanggilan,
        gelar_depan: gelarDepan,
        gelar_belakang: gelarBelakang,
      });

      if (res.success) {
        toast.success('Profil Diperbarui', 'Perubahan data personil berhasil disimpan.');
        onClose();
        router.refresh();
      } else {
        toast.error('Gagal Memperbarui', res.error || 'Terjadi kesalahan.');
      }
    } catch (err: any) {
      toast.error('Kesalahan Sistem', err?.message || 'Gagal menghubungi server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-surface-elevated w-full max-w-xl rounded-3xl border border-border-subtle shadow-2xl overflow-hidden animate-scale-in my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-subtle bg-surface-1 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Edit3 className="size-4" />
            </div>
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-ink-primary">
                Edit Profil Personil
              </h2>
              <p className="text-xs text-ink-secondary">
                Perbarui data identitas & kepegawaian resmi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-ink-tertiary hover:text-ink-primary hover:bg-surface-sunken transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Tutup Modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-surface-base">
          
          {/* Foto Profil & Kamera */}
          <div className="p-4 rounded-2xl bg-surface-1 border border-border-subtle space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary">
              Foto Profil
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview Avatar */}
              <div className="relative size-20 sm:size-24 rounded-2xl overflow-hidden bg-surface-sunken border-2 border-border-strong flex items-center justify-center shrink-0 shadow-inner group">
                {formData.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.foto_url}
                    alt="Foto Profil"
                    className="size-full object-cover"
                  />
                ) : (
                  <User className="size-8 sm:size-10 text-ink-muted" />
                )}

                {formData.foto_url && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    title="Hapus foto profil"
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Upload & Camera Buttons */}
              <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    disabled={isCompressing || isSubmitting}
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 active:scale-95 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Camera className="size-3.5" />
                    <span>Kamera</span>
                  </button>

                  <button
                    type="button"
                    disabled={isCompressing || isSubmitting}
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface-sunken active:scale-95 border border-border-strong text-ink-primary font-semibold text-xs transition-all cursor-pointer"
                  >
                    <ImageIcon className="size-3.5 text-ink-secondary" />
                    <span>Upload Foto</span>
                  </button>
                </div>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Format JPG/PNG/WebP maks 5 MB. Kompresi otomatis resolusi tinggi.
                </p>
              </div>
            </div>

            {/* Hidden native inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />
          </div>

          {/* 1. IDENTITAS */}
          <div className="space-y-3 p-4 rounded-2xl bg-surface-1 border border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5">
              <Award className="size-3.5 text-amber-600 dark:text-amber-400" />
              1. Identitas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Gelar Depan (Prefix) */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Gelar / Panggilan
                </label>
                <select
                  value={gelarDepan}
                  onChange={(e) => handleNamePartsChange(e.target.value, namaDepan, namaTengah, namaBelakang, gelarBelakang)}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-semibold"
                >
                  {STANDARD_PREFIX_TITLES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama Depan (First Name) */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Nama Depan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: Ben"
                  value={namaDepan}
                  onChange={(e) => {
                    setNamaDepan(e.target.value);
                    if (!namaPanggilan) setNamaPanggilan(e.target.value);
                    handleNamePartsChange(gelarDepan, e.target.value, namaTengah, namaBelakang, gelarBelakang);
                  }}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-semibold"
                />
              </div>

              {/* Nama Tengah (Middle Name) */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Nama Tengah
                </label>
                <input
                  type="text"
                  placeholder="cth: Bianco"
                  value={namaTengah}
                  onChange={(e) => {
                    setNamaTengah(e.target.value);
                    handleNamePartsChange(gelarDepan, namaDepan, e.target.value, namaBelakang, gelarBelakang);
                  }}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Nama Belakang / Marga */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Nama Keluarga / Marga
                </label>
                <input
                  type="text"
                  placeholder="cth: Patinama"
                  value={namaBelakang}
                  onChange={(e) => {
                    setNamaBelakang(e.target.value);
                    handleNamePartsChange(gelarDepan, namaDepan, namaTengah, e.target.value, gelarBelakang);
                  }}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-semibold"
                />
              </div>

              {/* Nama Panggilan / Sapaan Akrab */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Nama Panggilan / Sapaan Akrab
                </label>
                <input
                  type="text"
                  placeholder="cth: Ben"
                  value={namaPanggilan}
                  onChange={(e) => setNamaPanggilan(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Gelar Belakang / Akademis (Suffix) */}
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Gelar Akademis Belakang
                </label>
                <input
                  type="text"
                  placeholder="cth: S.Si-Teol., M.Th., M.Min."
                  value={gelarBelakang}
                  onChange={(e) => {
                    setGelarBelakang(e.target.value);
                    handleNamePartsChange(gelarDepan, namaDepan, namaTengah, namaBelakang, e.target.value);
                  }}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* NIP / No. Registrasi Pelayanan */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  NIP / No. Registrasi Pelayanan
                </label>
                <input
                  type="text"
                  placeholder="cth: PDT-43300681"
                  value={formData.nip || ''}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono font-semibold"
                />
              </div>
            </div>

            {/* Clean Live Preview */}
            <div className="mt-2 p-3 rounded-xl bg-surface-sunken border border-border-subtle flex items-start gap-2.5">
              <Sparkles className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-tertiary block">
                  Preview Nama Lengkap:
                </span>
                <span className="text-xs sm:text-sm font-bold text-ink-primary font-editorial truncate block">
                  {formData.nama_lengkap || '(Nama belum diisi)'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. DATA PRIBADI */}
          <div className="space-y-3 p-4 rounded-2xl bg-surface-1 border border-border-subtle">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5">
                <Heart className="size-3.5 text-rose-600 dark:text-rose-400" />
                2. Data Pribadi
              </h3>
              {calculatedAge !== null && (
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  🎂 Umur: {calculatedAge} Tahun
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Jenis Kelamin */}
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={formData.gender || 'Laki-laki'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-semibold"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  placeholder="cth: Jakarta / Ambon"
                  value={formData.tempat_lahir || ''}
                  onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={formData.tgl_lahir ? formData.tgl_lahir.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, tgl_lahir: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono"
                />
              </div>

              {/* No. KTP / NIK (Protected Field) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-ink-primary flex items-center gap-1">
                    <ShieldCheck className="size-3 text-emerald-600" />
                    No. KTP (NIK)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNik(!showNik)}
                    className="text-[10px] text-ink-tertiary hover:text-ink-primary flex items-center gap-1"
                  >
                    {showNik ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    <span>{showNik ? 'Sembunyikan' : 'Lihat'}</span>
                  </button>
                </div>
                <input
                  type={showNik ? 'text' : 'password'}
                  maxLength={16}
                  placeholder="16 Digit NIK KTP"
                  value={formData.nik || ''}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono tracking-wider"
                />
                <span className="text-[10px] text-ink-muted block mt-0.5">
                  Privat & terproteksi. Tidak ditampilkan di ID Card publik.
                </span>
              </div>
            </div>
          </div>

          {/* 3. KONTAK */}
          <div className="space-y-3 p-4 rounded-2xl bg-surface-1 border border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5">
              <Phone className="size-3.5 text-purple-600 dark:text-purple-400" />
              3. Kontak
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">No. WhatsApp / HP</label>
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={formData.no_wa || ''}
                  onChange={(e) => setFormData({ ...formData, no_wa: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">Email</label>
                <input
                  type="email"
                  placeholder="email@gpib.or.id"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>
          </div>

          {/* 4. STATUS */}
          <div className="space-y-3 p-4 rounded-2xl bg-surface-1 border border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5">
              <Church className="size-3.5 text-blue-600 dark:text-blue-400" />
              4. Status Keaktifan
            </h3>

            <div>
              <select
                value={formData.status || 'Aktif'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-semibold"
              >
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Mutasi">Mutasi</option>
                <option value="Emeritus">Emeritus</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isCompressing}
              className="px-4 py-2.5 rounded-xl border border-border-strong text-ink-primary font-semibold text-xs sm:text-sm hover:bg-surface-sunken min-h-[44px] active:scale-95 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all min-h-[44px] flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Edit3 className="size-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
