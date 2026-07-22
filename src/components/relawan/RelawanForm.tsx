'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { relawanSchema, RelawanInput, KATEGORI_RELAWAN } from '@/lib/validations/relawan.schema';
import { useCreateRelawan, useUpdateRelawan, RelawanItem } from '@/hooks/use-relawan';
import { Loader2, Save, AlertCircle, Phone, Award, Camera, Upload, Calendar } from 'lucide-react';
import { PosCascadingSelector, HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { createClient } from '@/lib/supabase/client';

interface RelawanFormProps {
  id_pos?: string;
  initialData?: RelawanItem | null;
  onSuccess: () => void;
}

export function RelawanForm({ id_pos = 'POS-001', initialData, onSuccess }: RelawanFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [targetScope, setTargetScope] = useState<'pos' | 'jemaat'>(
    initialData?.id_pos && initialData.id_pos !== 'POS-001' ? 'pos' : (id_pos && id_pos !== 'POS-001' ? 'pos' : 'jemaat')
  );
  const [hierarchyMeta, setHierarchyMeta] = useState<HierarchyMetaInfo | null>(null);
  const [currentPosId, setCurrentPosId] = useState<string>(
    initialData?.id_pos || (id_pos === 'POS-001' ? '' : id_pos)
  );

  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.foto_url || null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const createMutation = useCreateRelawan();
  const updateMutation = useUpdateRelawan();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RelawanInput>({
    resolver: zodResolver(relawanSchema),
    defaultValues: {
      id_pos: currentPosId || undefined,
      nama: initialData?.nama || '',
      no_wa: initialData?.no_wa || '+628',
      gender: initialData?.gender || 'Laki-laki',
      kategori: initialData?.kategori || KATEGORI_RELAWAN[0],
      tgl_lahir: initialData?.tgl_lahir || '',
      pelatihan: initialData?.pelatihan || '',
      keterangan: initialData?.keterangan || '',
      foto_url: initialData?.foto_url || null,
    },
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    setPhotoUploading(true);

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `relawan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${fileExt}`;
      const filePath = `relawan/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('pos-pelkes-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadErr) {
        // Fallback: use base64 data url if bucket fails
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Url = reader.result as string;
          setPhotoPreview(base64Url);
          setValue('foto_url', base64Url);
          setPhotoUploading(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('pos-pelkes-assets')
        .getPublicUrl(filePath);

      const finalUrl = publicUrlData?.publicUrl || filePath;
      setPhotoPreview(finalUrl);
      setValue('foto_url', finalUrl);
    } catch {
      // Fallback data url
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        setPhotoPreview(base64Url);
        setValue('foto_url', base64Url);
      };
      reader.readAsDataURL(file);
    } finally {
      setPhotoUploading(false);
    }
  };

  // Sync currentPosId with react-hook-form value
  useEffect(() => {
    setValue('id_pos', currentPosId);
  }, [currentPosId, setValue]);

  const onSubmit = async (data: RelawanInput) => {
    setErrorMsg(null);
    try {
      const supabase = createClient();
      let finalPosId = currentPosId;

      if (targetScope === 'pos') {
        if (!finalPosId || finalPosId === 'POS-001' || finalPosId.trim() === '') {
          setErrorMsg('Pos Pelkes wajib dipilih.');
          return;
        }
      } else {
        // Target scope: Jemaat Induk
        const jemaatId = hierarchyMeta?.id_induk;
        if (!jemaatId) {
          setErrorMsg('Jemaat Induk wajib dipilih.');
          return;
        }

        // Find or create dummy Pos for the Jemaat Induk
        const { data: posRows } = await supabase
          .from('m_pos_pelkes')
          .select('id_pos')
          .eq('id_induk', jemaatId)
          .limit(1);

        if (posRows && posRows[0]) {
          finalPosId = posRows[0].id_pos;
        } else {
          const jemaatNama = hierarchyMeta?.jemaatName || jemaatId;
          const createdPosId = `POS-${Math.floor(10000 + Math.random() * 90000)}`;
          const { error: insErr } = await supabase.from('m_pos_pelkes').insert({
            id_pos: createdPosId,
            id_induk: jemaatId,
            nama_pos: `Jemaat ${jemaatNama}`,
            kategori: 'Pos Pelkes',
          });
          if (insErr) {
            throw new Error(insErr.message);
          }
          finalPosId = createdPosId;
        }
      }

      const payload = {
        ...data,
        id_pos: finalPosId,
      };

      if (initialData) {
        await updateMutation.mutateAsync({ id_relawan: initialData.id_relawan, input: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }

      onSuccess();
    } catch (err: any) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
      setErrorMsg(err.message || 'Gagal menyimpan data relawan.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-medium border border-red-200 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Target Scope Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high">Target Lingkup Relawan *</label>
        <div className="grid grid-cols-2 gap-2 bg-surface-sunken p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setTargetScope('jemaat');
              setCurrentPosId('');
            }}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              targetScope === 'jemaat'
                ? 'bg-surface-elevated text-brand-primary shadow-soft'
                : 'text-text-muted hover:text-text-high'
            }`}
          >
            <span>⛪ Jemaat Induk</span>
          </button>
          <button
            type="button"
            onClick={() => setTargetScope('pos')}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              targetScope === 'pos'
                ? 'bg-surface-elevated text-brand-primary shadow-soft'
                : 'text-text-muted hover:text-text-high'
            }`}
          >
            <span>📍 Pos Pelkes / Bajem</span>
          </button>
        </div>
      </div>

      {/* ID Pos Input */}
      <div className="space-y-1.5 w-full">
        <PosCascadingSelector
          value={currentPosId}
          onChange={setCurrentPosId}
          onMetaChange={setHierarchyMeta}
          onJemaatChange={() => setCurrentPosId('')}
          defaultPosId={initialData?.id_pos || id_pos}
          required={targetScope === 'pos'}
          hidePos={targetScope === 'jemaat'}
        />
      </div>

      {/* Nama & No WA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Nama Lengkap Relawan *</label>
          <input
            type="text"
            placeholder="Nama relawan..."
            {...register('nama')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.nama && <p className="text-xs text-error">{errors.nama.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
            <Phone size={14} className="text-emerald-600" />
            <span>Nomor WhatsApp (+62...) *</span>
          </label>
          <input
            type="text"
            placeholder="+6281234567890"
            {...register('no_wa')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-mono text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.no_wa && <p className="text-xs text-error">{errors.no_wa.message}</p>}
        </div>
      </div>

      {/* Kategori & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Kategori Relawan *</label>
          <select
            {...register('kategori')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {KATEGORI_RELAWAN.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
          {errors.kategori && <p className="text-xs text-error">{errors.kategori.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Jenis Kelamin *</label>
          <select
            {...register('gender')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
          {errors.gender && <p className="text-xs text-error">{errors.gender.message}</p>}
        </div>
      </div>

      {/* Tanggal Lahir & Pelatihan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
            <Calendar size={14} className="text-brand-primary" />
            <span>Tanggal Lahir (Opsional)</span>
          </label>
          <input
            type="date"
            {...register('tgl_lahir')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
            <Award size={14} className="text-amber-500" />
            <span>Pelatihan Diikuti (Opsional)</span>
          </label>
          <input
            type="text"
            placeholder="Misal: Pelatihan Tanggap Bencana, Pertolongan Pertama"
            {...register('pelatihan')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Keterangan */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high">Keterangan Tambahan</label>
        <textarea
          rows={2}
          placeholder="Catatan keahlian khusus, domisili..."
          {...register('keterangan')}
          className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-base text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {/* Foto Profil (Kamera / File Upload) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high flex items-center justify-between">
          <span>Foto Profil Relawan (Opsional)</span>
          {photoUploading && <span className="text-[10px] text-brand-primary animate-pulse">Mengunggah foto...</span>}
        </label>

        {photoPreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-border-subtle group bg-surface-sunken p-2 flex items-center gap-3">
            <img src={photoPreview} alt="Preview Foto" className="w-16 h-16 object-cover rounded-xl shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-text-high">Foto Profil Terpasang</p>
              <p className="text-[10px] text-text-muted">Siap disimpan bersama data relawan</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPhotoPreview(null);
                setValue('foto_url', null);
              }}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors"
            >
              Hapus
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-border-strong bg-surface-sunken/50 hover:bg-surface-sunken transition-colors cursor-pointer text-center min-h-[64px]">
              <Camera size={18} className="text-brand-primary mb-1" />
              <span className="text-[11px] font-bold text-text-high">Potret Kamera</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                disabled={photoUploading}
                className="hidden"
              />
            </label>

            <label className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-border-strong bg-surface-sunken/50 hover:bg-surface-sunken transition-colors cursor-pointer text-center min-h-[64px]">
              <Upload size={18} className="text-brand-primary mb-1" />
              <span className="text-[11px] font-bold text-text-high">Unggah File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={photoUploading}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[48px] bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Menyimpan Relawan...</span>
          </>
        ) : (
          <>
            <Save size={18} />
            <span>{initialData ? 'Perbarui Data Relawan' : 'Simpan Relawan Baru'}</span>
          </>
        )}
      </button>
    </form>
  );
}
