'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  kerawananSchema,
  KerawananInput,
  KATEGORI_KERAWANAN_OPTIONS,
} from '@/lib/validations/wilayah.schema';
import { 
  useCreateKerawanan, 
  useUpdateKerawanan, 
  useDeleteLampiranKerawanan,
  useUpdateLampiranKerawananKeterangan,
  KerawananItem 
} from '@/hooks/use-wilayah';
import { Loader2, CheckCircle2, AlertCircle, Save, ShieldAlert } from 'lucide-react';
import { PosCascadingSelector, HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { CameraCapture } from '@/components/aset/CameraCapture';
import { createClient } from '@/lib/supabase/client';

interface KerawananFormProps {
  defaultPosId?: string;
  initialData?: KerawananItem | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FREKUENSI_OPTIONS = [
  { value: 'Rendah', label: 'Rendah', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  { value: 'Sedang', label: 'Sedang', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  { value: 'Tinggi', label: 'Tinggi', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800' },
  { value: 'Kritis', label: 'Kritis', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' },
] as const;

export function KerawananForm({ defaultPosId, initialData, onSuccess, onCancel }: KerawananFormProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isInitialJemaat = Boolean(
    initialData && (
      !initialData.id_pos ||
      initialData.pos?.nama_pos?.toLowerCase().startsWith('jemaat ') ||
      (initialData.pos?.jemaat_induk && initialData.pos?.nama_pos === initialData.pos?.jemaat_induk) ||
      initialData.pos?.nama_pos === 'Pelayanan Jemaat Direct' ||
      initialData.pos?.nama_pos === '-'
    )
  );

  const [targetScope, setTargetScope] = useState<'pos' | 'jemaat'>(isInitialJemaat ? 'jemaat' : 'pos');
  const [files, setFiles] = useState<File[]>([]);
  const [hierarchyMeta, setHierarchyMeta] = useState<HierarchyMetaInfo | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [existingLampiran, setExistingLampiran] = useState<any[]>(initialData?.lampiran || []);

  const createMutation = useCreateKerawanan();
  const updateMutation = useUpdateKerawanan();
  const deleteLampiranMutation = useDeleteLampiranKerawanan();
  const updateLampiranKeteranganMutation = useUpdateLampiranKerawananKeterangan();

  const supabase = createClient();

  useEffect(() => {
    if (initialData?.lampiran) {
      setExistingLampiran(initialData.lampiran);
    }
  }, [initialData]);

  const handleDeleteExistingAttachment = async (id_lampiran: string) => {
    try {
      await deleteLampiranMutation.mutateAsync(id_lampiran);
      setExistingLampiran((prev) => prev.filter((a) => a.id_lampiran !== id_lampiran));
    } catch (err: any) {
      console.error('Failed to delete attachment:', err);
    }
  };

  const handleUpdateExistingAttachmentCaption = (id_lampiran: string, keterangan: string) => {
    setExistingLampiran((prev) =>
      prev.map((a) => (a.id_lampiran === id_lampiran ? { ...a, keterangan } : a))
    );
  };

  const saveExistingLampiranCaptions = async () => {
    if (existingLampiran && existingLampiran.length > 0) {
      for (const att of existingLampiran) {
        await updateLampiranKeteranganMutation.mutateAsync({
          id_lampiran: att.id_lampiran,
          keterangan: att.keterangan || null,
        });
      }
    }
  };

  useEffect(() => {
    if (initialData) {
      const isJemaat =
        !initialData.id_pos ||
        initialData.pos?.nama_pos?.toLowerCase().startsWith('jemaat ') ||
        (initialData.pos?.jemaat_induk && initialData.pos?.nama_pos === initialData.pos?.jemaat_induk) ||
        initialData.pos?.nama_pos === 'Pelayanan Jemaat Direct' ||
        initialData.pos?.nama_pos === '-';
      setTargetScope(isJemaat ? 'jemaat' : 'pos');
    }
  }, [initialData]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userMeta = user.user_metadata || {};
        const { data: userRow } = await supabase
          .from('users')
          .select('email, no_telepon')
          .eq('id', user.id)
          .maybeSingle();

        const displayUser =
          userRow?.email ||
          user.email ||
          userMeta.full_name ||
          userMeta.name ||
          userRow?.no_telepon ||
          user.phone ||
          'Pengguna System';

        setCurrentUserEmail(displayUser);
      }
    };
    fetchCurrentUser();
  }, [supabase]);

  const form = useForm<KerawananInput>({
    resolver: zodResolver(kerawananSchema),
    defaultValues: {
      id_pos: initialData?.id_pos || defaultPosId || '',
      kategori: initialData?.kategori || KATEGORI_KERAWANAN_OPTIONS[0],
      jenis_risiko: initialData?.jenis_risiko || '',
      frekuensi: initialData?.frekuensi || 'Sedang',
      keterangan: initialData?.keterangan || '',
      latitude: initialData?.latitude || null,
      longitude: initialData?.longitude || null,
      updated_by: initialData?.updated_by || '',
    },
  });

  const selectedFrekuensi = form.watch('frekuensi');

  const onSubmit = async (data: KerawananInput) => {
    setSuccessMsg(null);
    setErrorMsg(null);

    if (targetScope === 'pos' && !data.id_pos) {
      setErrorMsg('Pos Pelkes wajib dipilih ketika memilih lingkup Pos Pelkes.');
      return;
    }

    if (targetScope === 'jemaat' && !hierarchyMeta?.id_induk && !data.id_pos) {
      setErrorMsg('Silakan pilih Jemaat Induk.');
      return;
    }

    try {
      let finalPosId = data.id_pos;

      if (targetScope === 'jemaat') {
        const jemaatId = hierarchyMeta?.id_induk;
        if (!jemaatId) {
          setErrorMsg('Silakan pilih Jemaat Induk.');
          return;
        }

        // 1. Check if a direct Pos Pelkes exists for this Jemaat Induk
        const { data: posRows } = await supabase
          .from('m_pos_pelkes')
          .select('id_pos')
          .eq('id_induk', jemaatId)
          .limit(1);

        if (posRows && posRows[0]) {
          finalPosId = posRows[0].id_pos;
        } else {
          // 2. Create one if not exists
          const jemaatNama = hierarchyMeta?.jemaatName || jemaatId;
          const createdPosId = `POS-${Math.floor(10000 + Math.random() * 90000)}`;
          const { error: insErr } = await supabase.from('m_pos_pelkes').insert({
            id_pos: createdPosId,
            id_induk: jemaatId,
            nama_pos: `Jemaat ${jemaatNama}`,
            kategori: 'Pos Pelkes',
          });

          if (!insErr) {
            finalPosId = createdPosId;
          } else {
            setErrorMsg('Gagal menyelaraskan wilayah Jemaat Induk.');
            return;
          }
        }
      }

      if (!finalPosId) {
        setErrorMsg('Pilihan wilayah lokasi tidak valid.');
        return;
      }

      const payload = {
        ...data,
        id_pos: finalPosId,
        updated_by: currentUserEmail || data.updated_by || 'Pengguna System',
      };

      if (initialData?.id_risiko) {
        await updateMutation.mutateAsync({
          id_risiko: initialData.id_risiko,
          data: payload,
          files,
        });
        await saveExistingLampiranCaptions();
        setSuccessMsg('Data Kerawanan Wilayah berhasil diperbarui!');
      } else {
        await createMutation.mutateAsync({
          data: payload,
          files,
        });
        setSuccessMsg('Data Kerawanan Wilayah berhasil disimpan!');
      }
      
      // Haptic Feedback saat sukses
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }

      setFiles([]);
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (err: unknown) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
      const message = err instanceof Error ? err.message : 'Gagal menyimpan data kerawanan.';
      setErrorMsg(message);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-subtle p-5 shadow-soft space-y-5">
      {/* Form Header */}
      <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-text-high text-base">
            {initialData ? 'Edit Data Kerawanan Wilayah' : 'Input Data Kerawanan Wilayah'}
          </h3>
          <p className="text-xs text-text-muted">Pendataan risiko bencana, sosial, & infrastruktur di Pos Pelkes & Jemaat Induk</p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-medium dark:bg-red-950/40 dark:text-red-300 dark:border-red-800">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Target Scope Switcher */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Target Lingkup Kerawanan *</label>
          <div className="grid grid-cols-2 gap-2 bg-surface-sunken p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setTargetScope('jemaat');
                form.setValue('id_pos', '');
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

        {/* Pilih Pos Pelkes / Jemaat Induk */}
        <div className="space-y-1.5 w-full">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-text-high">Pilih Wilayah Lokasi Kerawanan *</label>
            <span className="text-[11px] font-semibold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
              {targetScope === 'jemaat'
                ? 'Pos Pelkes Opsional (Level Jemaat)'
                : 'Pos Pelkes Wajib Dipilih (Compulsory)'}
            </span>
          </div>
          <Controller
            name="id_pos"
            control={form.control}
            render={({ field }) => (
              <PosCascadingSelector
                value={field.value}
                onChange={field.onChange}
                onMetaChange={setHierarchyMeta}
                onJemaatChange={() => field.onChange('')}
                error={form.formState.errors.id_pos?.message}
                defaultPosId={initialData?.id_pos || defaultPosId}
                disabled={isSubmitting}
                required={targetScope === 'pos'}
                hidePos={targetScope === 'jemaat'}
              />
            )}
          />
        </div>

        {/* Kategori & Jenis Risiko */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Kategori Risiko *</label>
            <select
              {...form.register('kategori')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {KATEGORI_KERAWANAN_OPTIONS.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
            {form.formState.errors.kategori && (
              <p className="text-xs text-error font-medium">{form.formState.errors.kategori.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Jenis Risiko / Ancaman *</label>
            <input
              type="text"
              placeholder="Contoh: Banjir Bandang, Tanah Longsor, Konflik Lahan"
              {...form.register('jenis_risiko')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            {form.formState.errors.jenis_risiko && (
              <p className="text-xs text-error font-medium">{form.formState.errors.jenis_risiko.message}</p>
            )}
          </div>
        </div>

        {/* Frekuensi Kerawanan (Radio Badges dengan Warna Semantik) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-high">Tingkat Frekuensi Kerawanan *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FREKUENSI_OPTIONS.map((opt) => {
              const isSelected = selectedFrekuensi === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`min-h-[44px] p-2.5 rounded-xl border cursor-pointer flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    opt.color
                  } ${
                    isSelected
                      ? 'ring-2 ring-brand-primary scale-[1.02] shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...form.register('frekuensi')}
                    className="sr-only"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
          {form.formState.errors.frekuensi && (
            <p className="text-xs text-error font-medium">{form.formState.errors.frekuensi.message}</p>
          )}
        </div>

        {/* Foto Dokumentasi Bencana & Watermark Geotagging */}
        <CameraCapture
          files={files}
          onFilesChange={setFiles}
          existingAttachments={existingLampiran}
          onDeleteExistingAttachment={handleDeleteExistingAttachment}
          onUpdateExistingAttachmentCaption={handleUpdateExistingAttachmentCaption}
          lat={form.watch('latitude')}
          lng={form.watch('longitude')}
          onLatChange={(lat) => form.setValue('latitude', lat)}
          onLngChange={(lng) => form.setValue('longitude', lng)}
          hierarchyMeta={hierarchyMeta}
          label="Foto Dokumentasi Risiko Bencana / Ancaman Wilayah"
        />

        {/* Keterangan Tambahan */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Keterangan & Mitigasi (Opsional)</label>
          <textarea
            rows={3}
            placeholder="Catatan historis kejadian, langkah mitigasi yang diperlukan..."
            {...form.register('keterangan')}
            className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {form.formState.errors.keterangan && (
            <p className="text-xs text-error font-medium">{form.formState.errors.keterangan.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 min-h-[44px] px-4 rounded-xl border border-border-subtle text-text-muted hover:text-text-high text-xs font-semibold transition-colors"
            >
              Batal
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 min-h-[48px] bg-brand-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-soft"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{initialData ? 'Update Kerawanan' : 'Simpan Data Kerawanan'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
