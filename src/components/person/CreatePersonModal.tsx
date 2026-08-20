'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, UserPlus, Church, Phone, Award, MapPin, Loader2, Camera, Image as ImageIcon, Trash2, User, Sparkles, Heart, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { createPersonAction, CreatePersonInput } from '@/app/(dashboard)/people/actions';
import { createClient } from '@/lib/supabase/client';
import { compressAvatarImage } from '@/lib/camera/compress';
import { formatSplitName, calculateAge, STANDARD_PREFIX_TITLES } from '@/lib/utils/name-parser';

interface CreatePersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMupelId?: string | null;
  defaultIndukId?: string | null;
}

export function CreatePersonModal({
  isOpen,
  onClose,
  defaultMupelId,
  defaultIndukId,
}: CreatePersonModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showNik, setShowNik] = useState(false);
  const [mupelList, setMupelList] = useState<{ id_mupel: string; nama_mupel: string }[]>([]);
  const [jemaatList, setJemaatList] = useState<{ id_induk: string; nama_induk: string; id_mupel: string }[]>([]);

  // Split Name States
  const [gelarDepan, setGelarDepan] = useState<string>('Pdt.');
  const [namaDepan, setNamaDepan] = useState<string>('');
  const [namaTengah, setNamaTengah] = useState<string>('');
  const [namaBelakang, setNamaBelakang] = useState<string>('');
  const [namaPanggilan, setNamaPanggilan] = useState<string>('');
  const [gelarBelakang, setGelarBelakang] = useState<string>('');

  const [formData, setFormData] = useState<CreatePersonInput>({
    nama_lengkap: '',
    jenis_pendeta: 'Organik',
    jabatan: 'Pendeta Jemaat',
    is_kmj: false,
    is_pj: false,
    id_mupel: defaultMupelId || '',
    id_induk: defaultIndukId || '',
    no_wa: '',
    email: '',
    gender: 'Laki-laki',
    tempat_lahir: '',
    nik: '',
    status: 'Aktif',
    tgl_lahir: '',
    tgl_tahbis: '',
    foto_url: '',
  });

  const calculatedAge = calculateAge(formData.tgl_lahir);

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

  // Fetch Mupel & Jemaat options
  useEffect(() => {
    if (!isOpen) return;

    const supabase = createClient();
    async function loadOptions() {
      try {
        const [{ data: mupels }, { data: jemaats }] = await Promise.all([
          supabase.from('m_mupel').select('id_mupel, nama_mupel').order('nama_mupel'),
          supabase.from('m_jemaat_induk').select('id_induk, nama_induk, id_mupel').order('nama_induk'),
        ]);

        if (mupels) setMupelList(mupels);
        if (jemaats) setJemaatList(jemaats);
      } catch (e) {
        console.error('Error loading wilayah options:', e);
      }
    }

    loadOptions();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredJemaatList = formData.id_mupel
    ? jemaatList.filter((j) => j.id_mupel === formData.id_mupel)
    : jemaatList;

  const handleJabatanChange = (val: string) => {
    const isKmj = val === 'Ketua Majelis Jemaat' || val.toLowerCase().includes('kmj');
    const isPj = val.includes('Pos') || val.toLowerCase().includes('pj');
    setFormData((prev) => ({
      ...prev,
      jabatan: val,
      is_kmj: isKmj,
      is_pj: isPj,
    }));
  };

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
          toast.success('Foto Dipilih', 'Foto profil berhasil diproses.');
        }
        setIsCompressing(false);
      };
      reader.onerror = () => {
        toast.error('Gagal Membaca File', 'Terjadi kesalahan saat membaca file.');
        setIsCompressing(false);
      };
      reader.readAsDataURL(compressed);
    } catch (err: any) {
      console.error('Error compressing image:', err);
      toast.error('Gagal Kompresi', err?.message || 'Tidak dapat memproses gambar foto.');
      setIsCompressing(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, foto_url: '' }));
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_lengkap.trim()) {
      toast.error('Nama Lengkap Wajib Diisi', 'Silakan masukkan nama personil.');
      return;
    }

    if (formData.nik && formData.nik.length !== 16) {
      toast.error('Format NIK Tidak Valid', 'Nomor KTP (NIK) harus berjumlah tepat 16 digit angka.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createPersonAction({
        ...formData,
        nama_depan: namaDepan,
        nama_tengah: namaTengah,
        nama_belakang: namaBelakang,
        nama_panggilan: namaPanggilan,
        gelar_depan: gelarDepan,
        gelar_belakang: gelarBelakang,
      });
      if (res.success) {
        toast.success('SDM Berhasil Ditambahkan', `${formData.nama_lengkap} telah tersimpan.`);
        onClose();
        router.refresh();
      } else {
        toast.error('Gagal Menambahkan SDM', res.error || 'Terjadi kesalahan pada basis data.');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      toast.error('Kesalahan Sistem', err?.message || 'Gagal menghubungi server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-surface-elevated w-full max-w-2xl rounded-3xl border border-border-subtle shadow-2xl overflow-hidden animate-scale-in my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-subtle bg-surface-1 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <UserPlus className="size-4" />
            </div>
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-ink-primary">
                Tambah Personil / Pelayan Baru
              </h2>
              <p className="text-xs text-ink-secondary">
                Registrasi data SDM ke basis data resmi GPIB
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

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-surface-base">
          
          {/* Foto Profil & Upload/Camera */}
          <div className="p-4 rounded-2xl bg-surface-1 border border-border-subtle space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary">
              Foto Profil
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
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
                    title="Hapus foto"
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>

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
                  placeholder="cth: Yohanes"
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
                  placeholder="cth: Marthen"
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
                  placeholder="cth: Manuputty"
                  value={namaBelakang}
                  onChange={(e) => {
                    setNamaBelakang(e.target.value);
                    handleNamePartsChange(gelarDepan, namaDepan, namaTengah, e.target.value, gelarBelakang);
                  }}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-semibold"
                />
              </div>

              {/* Nama Panggilan */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Nama Panggilan / Sapaan
                </label>
                <input
                  type="text"
                  placeholder="cth: Jo"
                  value={namaPanggilan}
                  onChange={(e) => setNamaPanggilan(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Gelar Belakang */}
              <div className="sm:col-span-12">
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Gelar Akademis Belakang
                </label>
                <input
                  type="text"
                  placeholder="cth: S.Th., M.Th., M.Min."
                  value={gelarBelakang}
                  onChange={(e) => {
                    setGelarBelakang(e.target.value);
                    handleNamePartsChange(gelarDepan, namaDepan, namaTengah, namaBelakang, e.target.value);
                  }}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
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

          {/* 2. KATEGORI & JABATAN */}
          <div className="space-y-3 p-4 rounded-2xl bg-surface-1 border border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5">
              <Church className="size-3.5 text-blue-600 dark:text-blue-400" />
              2. Kategori & Jabatan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">Kategori SDM</label>
                <select
                  value={formData.jenis_pendeta || 'Organik'}
                  onChange={(e) => setFormData({ ...formData, jenis_pendeta: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-semibold"
                >
                  <option value="Organik">Pendeta Organik GPIB</option>
                  <option value="Non-Organik">Pendeta Non-Organik / Kontrak</option>
                  <option value="Emeritus">Pendeta Emeritus</option>
                  <option value="Pelayan">Pelayan Pos Pelkes / Vikaris</option>
                  <option value="Presbiter">Presbiter (Penatua / Diaken)</option>
                  <option value="Relawan">Relawan Pos Pelkes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">Jabatan Pelayanan</label>
                <select
                  value={formData.jabatan || 'Pendeta Jemaat'}
                  onChange={(e) => handleJabatanChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-semibold"
                >
                  <option value="Ketua Majelis Jemaat">Ketua Majelis Jemaat (KMJ)</option>
                  <option value="Pendeta Jemaat (Pos Pelkes)">Pendeta Jemaat (PJ Pos Pelkes)</option>
                  <option value="Pendeta Jemaat">Pendeta Jemaat</option>
                  <option value="Pendeta Tugas Khusus">Pendeta Tugas Khusus</option>
                  <option value="Pelayan Pos Pelkes">Pelayan Pos Pelkes</option>
                  <option value="Presbiter (Penatua/Diaken)">Presbiter (Penatua/Diaken)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. PENEMPATAN WILAYAH */}
          <div className="space-y-3 p-4 rounded-2xl bg-surface-1 border border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5">
              <MapPin className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              3. Penempatan Wilayah
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">Mupel</label>
                <select
                  value={formData.id_mupel || ''}
                  onChange={(e) => setFormData({ ...formData, id_mupel: e.target.value, id_induk: '' })}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="">-- Pilih Wilayah Mupel --</option>
                  {mupelList.map((m) => (
                    <option key={m.id_mupel} value={m.id_mupel}>
                      {m.nama_mupel} ({m.id_mupel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">Jemaat Induk</label>
                <select
                  value={formData.id_induk || ''}
                  onChange={(e) => {
                    const jmt = jemaatList.find((j) => j.id_induk === e.target.value);
                    setFormData({
                      ...formData,
                      id_induk: e.target.value,
                      id_mupel: jmt ? jmt.id_mupel : formData.id_mupel,
                    });
                  }}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="">-- Pilih Jemaat Induk --</option>
                  {filteredJemaatList.map((j) => (
                    <option key={j.id_induk} value={j.id_induk}>
                      {j.nama_induk}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 4. DATA PRIBADI */}
          <div className="space-y-3 p-4 rounded-2xl bg-surface-1 border border-border-subtle">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5">
                <Heart className="size-3.5 text-rose-600 dark:text-rose-400" />
                4. Data Pribadi
              </h3>
              {calculatedAge !== null && (
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  🎂 Umur: {calculatedAge} Tahun
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  placeholder="cth: Ambon / Jakarta"
                  value={formData.tempat_lahir || ''}
                  onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={formData.tgl_lahir || ''}
                  onChange={(e) => setFormData({ ...formData, tgl_lahir: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono"
                />
              </div>

              {/* No. KTP / NIK */}
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
                  Privat & terproteksi.
                </span>
              </div>
            </div>
          </div>

          {/* 5. KONTAK & STATUS */}
          <div className="space-y-3 p-4 rounded-2xl bg-surface-1 border border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5">
              <Phone className="size-3.5 text-purple-600 dark:text-purple-400" />
              5. Kontak & Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">Nomor WhatsApp / HP</label>
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
                  placeholder="pelayan@gpib.or.id"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">Tanggal Penahbisan / SK</label>
                <input
                  type="date"
                  value={formData.tgl_tahbis || ''}
                  onChange={(e) => setFormData({ ...formData, tgl_tahbis: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-strong rounded-xl text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">Status Keaktifan</label>
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
                  <UserPlus className="size-4" />
                  <span>Simpan Personil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
