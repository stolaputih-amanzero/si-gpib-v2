'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  asetTanahSchema, 
  asetBangunanSchema, 
  asetBergerakSchema,
  AsetTanahInput,
  AsetBangunanInput,
  AsetBergerakInput
} from '@/lib/validations/aset.schema';
import { 
  KATEGORI_ASET, 
  KategoriAsetKode, 
  KONDISI_ASET_OPTIONS, 
  STATUS_HUKUM_TANAH_OPTIONS 
} from '@/lib/constants/aset';
import { 
  useCreateAsetTanah, 
  useUpdateAsetTanah,
  useCreateAsetBangunan, 
  useUpdateAsetBangunan,
  useCreateAsetBergerak,
  useUpdateAsetBergerak,
  useDeleteLampiranAset,
  useUpdateLampiranKeterangan
} from '@/hooks/use-aset';
import { useFormDraft } from '@/hooks/use-form-draft';
import { CameraCapture } from './CameraCapture';
import { PosCascadingSelector, HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { Loader2, CheckCircle2, AlertCircle, Save, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AsetFormProps {
  id_pos?: string;
  defaultKategori?: KategoriAsetKode;
  initialData?: any;
  onSuccess?: () => void;
  showHierarchySelector?: boolean;
}

export function AsetForm({
  id_pos: initialPosId = '',
  defaultKategori = 'TANAH',
  initialData,
  onSuccess,
  showHierarchySelector = true,
}: AsetFormProps) {
  const router = useRouter();
  const [currentPosId, setCurrentPosId] = useState<string>(
    initialData?.id_pos || initialPosId
  );
  const [targetScope, setTargetScope] = useState<'jemaat' | 'pos'>(
    initialData?.pos?.nama_pos?.startsWith('Jemaat ') ? 'jemaat' : 'pos'
  );
  const [hierarchyMeta, setHierarchyMeta] = useState<HierarchyMetaInfo | null>(null);
  const [existingLampiran, setExistingLampiran] = useState<any[]>(initialData?.lampiran || []);

  useEffect(() => {
    if (initialData?.lampiran) {
      setExistingLampiran(initialData.lampiran);
    }
  }, [initialData]);

  const deleteLampiranMutation = useDeleteLampiranAset();
  const updateLampiranKeteranganMutation = useUpdateLampiranKeterangan();

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

  const [kategori, setKategori] = useState<KategoriAsetKode>(
    initialData?.kategori || defaultKategori
  );
  const [files, setFiles] = useState<File[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Unique Draft Storage Key as requested in note #2
  const draftKey = `draft:aset:${currentPosId || 'unknown'}:${kategori.toLowerCase()}:${initialData?.id_tanah || initialData?.id_bangunan || initialData?.id_aset_b || 'new'}`;
  const { draft, saveDraft, clearDraft, hasRestoredDraft, relativeSavedTime } = useFormDraft(
    draftKey,
    initialData || {}
  );

  // Mutations
  const createTanahMutation = useCreateAsetTanah();
  const updateTanahMutation = useUpdateAsetTanah();
  const createBangunanMutation = useCreateAsetBangunan();
  const updateBangunanMutation = useUpdateAsetBangunan();
  const createBergerakMutation = useCreateAsetBergerak();
  const updateBergerakMutation = useUpdateAsetBergerak();

  // --- FORM TANAH ---
  const formTanah = useForm<AsetTanahInput>({
    resolver: zodResolver(asetTanahSchema),
    defaultValues: {
      id_pos: currentPosId,
      luas_m2: draft?.luas_m2 || initialData?.luas_m2 || 100,
      thn_perolehan: draft?.thn_perolehan || initialData?.thn_perolehan || new Date().getFullYear(),
      status_hukum: draft?.status_hukum || initialData?.status_hukum || STATUS_HUKUM_TANAH_OPTIONS[0].value,
      kondisi: draft?.kondisi || initialData?.kondisi || KONDISI_ASET_OPTIONS[1].value,
      potensi_sda: draft?.potensi_sda || initialData?.potensi_sda || '',
      keterangan: draft?.keterangan || initialData?.keterangan || '',
      latitude: draft?.latitude || initialData?.latitude || null,
      longitude: draft?.longitude || initialData?.longitude || null,
    },
  });

  // --- FORM BANGUNAN ---
  const formBangunan = useForm<AsetBangunanInput>({
    resolver: zodResolver(asetBangunanSchema),
    defaultValues: {
      id_pos: currentPosId,
      nama_bangunan: draft?.nama_bangunan || initialData?.nama_bangunan || '',
      fungsi: draft?.fungsi || initialData?.fungsi || 'Gereja Utama',
      kondisi: draft?.kondisi || initialData?.kondisi || KONDISI_ASET_OPTIONS[1].value,
      thn_berdiri: draft?.thn_berdiri || initialData?.thn_berdiri || new Date().getFullYear(),
      keterangan: draft?.keterangan || initialData?.keterangan || '',
      latitude: draft?.latitude || initialData?.latitude || null,
      longitude: draft?.longitude || initialData?.longitude || null,
    },
  });

  // --- FORM BERGERAK ---
  const formBergerak = useForm<AsetBergerakInput>({
    resolver: zodResolver(asetBergerakSchema),
    defaultValues: {
      id_pos: currentPosId,
      jenis: draft?.jenis || initialData?.jenis || 'Sepeda Motor Dinas',
      merk_tipe: draft?.merk_tipe || initialData?.merk_tipe || '',
      kondisi: draft?.kondisi || initialData?.kondisi || KONDISI_ASET_OPTIONS[1].value,
      thn_perolehan: draft?.thn_perolehan || initialData?.thn_perolehan || new Date().getFullYear(),
      no_polisi: draft?.no_polisi || initialData?.no_polisi || '',
      tgl_pajak: draft?.tgl_pajak || initialData?.tgl_pajak || '',
      keterangan: draft?.keterangan || initialData?.keterangan || '',
      latitude: draft?.latitude || initialData?.latitude || null,
      longitude: draft?.longitude || initialData?.longitude || null,
    },
  });

  // Keep id_pos in sync when currentPosId changes
  useEffect(() => {
    if (currentPosId) {
      formTanah.setValue('id_pos', currentPosId);
      formBangunan.setValue('id_pos', currentPosId);
      formBergerak.setValue('id_pos', currentPosId);
    }
  }, [currentPosId, formTanah, formBangunan, formBergerak]);

  // Sync initialData when passed for editing
  useEffect(() => {
    if (initialData) {
      if (initialData.id_pos) setCurrentPosId(initialData.id_pos);
      if (initialData.luas_m2) formTanah.reset({ ...initialData, id_pos: initialData.id_pos });
      if (initialData.fungsi) formBangunan.reset({ ...initialData, id_pos: initialData.id_pos });
      if (initialData.merk_tipe) formBergerak.reset({ ...initialData, id_pos: initialData.id_pos });
    }
  }, [initialData, formTanah, formBangunan, formBergerak]);

  // Auto-save form draft on change
  useEffect(() => {
    let subscription: any;
    if (kategori === 'TANAH') {
      subscription = formTanah.watch((values) => saveDraft(values));
    } else if (kategori === 'BANGUNAN') {
      subscription = formBangunan.watch((values) => saveDraft(values));
    } else {
      subscription = formBergerak.watch((values) => saveDraft(values));
    }
    return () => subscription?.unsubscribe();
  }, [kategori, formTanah, formBangunan, formBergerak, saveDraft]);

  const isSubmitting = 
    createTanahMutation.isPending || 
    updateTanahMutation.isPending || 
    createBangunanMutation.isPending || 
    updateBangunanMutation.isPending || 
    createBergerakMutation.isPending ||
    updateBergerakMutation.isPending;

  // Submit Handler Tanah
  const onSubmitTanah = async (data: AsetTanahInput) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const finalPosId = currentPosId || initialPosId;
      if (!finalPosId) throw new Error('Wilayah lokasi aset (Pos Pelkes/Jemaat) wajib dipilih.');
      const payload = { ...data, id_pos: finalPosId };

      if (initialData?.id_tanah) {
        await updateTanahMutation.mutateAsync({ id_tanah: initialData.id_tanah, data: payload, files });
        await saveExistingLampiranCaptions();
        setSuccessMsg('Aset Tanah berhasil diperbarui!');
      } else {
        await createTanahMutation.mutateAsync({ data: payload, files });
        clearDraft();
        setSuccessMsg('Aset Tanah berhasil disimpan!');
      }

      if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([10, 50, 10]);
      if (onSuccess) onSuccess();
      else router.push(`/dashboard/pos-pelkes/${finalPosId}?tab=aset`);
    } catch (err: any) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([50, 100, 50]);
      setErrorMsg(err.message || 'Gagal menyimpan aset tanah.');
    }
  };

  // Submit Handler Bangunan
  const onSubmitBangunan = async (data: AsetBangunanInput) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const finalPosId = currentPosId || initialPosId;
      if (!finalPosId) throw new Error('Wilayah lokasi aset (Pos Pelkes/Jemaat) wajib dipilih.');
      const payload = { ...data, id_pos: finalPosId };

      if (initialData?.id_bangunan) {
        await updateBangunanMutation.mutateAsync({ id_bangunan: initialData.id_bangunan, data: payload, files });
        await saveExistingLampiranCaptions();
        setSuccessMsg('Aset Bangunan berhasil diperbarui!');
      } else {
        await createBangunanMutation.mutateAsync({ data: payload, files });
        clearDraft();
        setSuccessMsg('Aset Bangunan berhasil disimpan!');
      }

      if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([10, 50, 10]);
      if (onSuccess) onSuccess();
      else router.push(`/dashboard/pos-pelkes/${finalPosId}?tab=aset`);
    } catch (err: any) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([50, 100, 50]);
      setErrorMsg(err.message || 'Gagal menyimpan aset bangunan.');
    }
  };

  // Submit Handler Bergerak
  const onSubmitBergerak = async (data: AsetBergerakInput) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const finalPosId = currentPosId || initialPosId;
      if (!finalPosId) throw new Error('Wilayah lokasi aset (Pos Pelkes/Jemaat) wajib dipilih.');
      const payload = { ...data, id_pos: finalPosId };

      if (initialData?.id_aset_b) {
        await updateBergerakMutation.mutateAsync({ id_aset_b: initialData.id_aset_b, data: payload, files });
        await saveExistingLampiranCaptions();
        setSuccessMsg('Aset Bergerak berhasil diperbarui!');
      } else {
        await createBergerakMutation.mutateAsync({ data: payload, files });
        clearDraft();
        setSuccessMsg('Aset Bergerak berhasil disimpan!');
      }

      if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([10, 50, 10]);
      if (onSuccess) onSuccess();
      else router.push(`/dashboard/pos-pelkes/${finalPosId}?tab=aset`);
    } catch (err: any) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([50, 100, 50]);
      setErrorMsg(err.message || 'Gagal menyimpan aset bergerak.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Target Scope & Cascading Hierarchy Selector */}
      {showHierarchySelector && (
        <div className="bg-surface-elevated p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-soft space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Target Lingkup Aset *</label>
            <div className="grid grid-cols-2 gap-2 bg-surface-sunken p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTargetScope('jemaat')}
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

          <div className="space-y-1.5">
            <PosCascadingSelector
              value={currentPosId}
              onChange={setCurrentPosId}
              onMetaChange={setHierarchyMeta}
              onJemaatChange={() => setCurrentPosId('')}
              defaultPosId={initialData?.id_pos || initialPosId}
              required={targetScope === 'pos'}
              hidePos={targetScope === 'jemaat'}
            />
          </div>
        </div>
      )}

      {/* Category Selector Tabs */}
      <div className="flex items-center gap-2 p-1 bg-surface-sunken rounded-xl border border-border-subtle">
        {KATEGORI_ASET.map((k) => {
          const isActive = kategori === k.kode;

          return (
            <button
              key={k.kode}
              type="button"
              onClick={() => setKategori(k.kode as KategoriAsetKode)}
              className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-surface-elevated text-brand-primary shadow-sm font-bold border border-border-subtle'
                  : 'text-text-muted hover:text-text-high'
              }`}
            >
              <span>{k.icon}</span>
              <span>{k.nama}</span>
            </button>
          );
        })}
      </div>

      {/* Offline Draft Indicator */}
      {relativeSavedTime && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="shrink-0 text-blue-500" />
            <span>
              {hasRestoredDraft ? 'Draf lama dipulihkan' : 'Draf tersimpan otomatis'} ({relativeSavedTime})
            </span>
          </div>
          <button
            type="button"
            onClick={clearDraft}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Hapus Draf
          </button>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-medium">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* --- FORM ASET TANAH --- */}
      {kategori === 'TANAH' && (
        <form onSubmit={formTanah.handleSubmit(onSubmitTanah)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-high">Luas Tanah (m²) *</label>
              <input
                type="number"
                step="any"
                {...formTanah.register('luas_m2', { valueAsNumber: true })}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-base font-bold text-text-high tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {formTanah.formState.errors.luas_m2 && (
                <p className="text-xs text-error">{formTanah.formState.errors.luas_m2.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-high">Tahun Perolehan *</label>
              <input
                type="number"
                {...formTanah.register('thn_perolehan', { valueAsNumber: true })}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-base font-medium text-text-high tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {formTanah.formState.errors.thn_perolehan && (
                <p className="text-xs text-error">{formTanah.formState.errors.thn_perolehan.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-high">Status Hukum Tanah *</label>
              <select
                {...formTanah.register('status_hukum')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {STATUS_HUKUM_TANAH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-high">Kondisi Lahan *</label>
              <select
                {...formTanah.register('kondisi')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {KONDISI_ASET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Potensi Sumber Daya Alam (SDA)</label>
            <input
              type="text"
              placeholder="Misal: Perkebunan Sawit, Sumber Air Bersih, Tambang"
              {...formTanah.register('potensi_sda')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Camera Capture + GPS Auto-Fill + Manual Override Inputs */}
          <CameraCapture
            files={files}
            onFilesChange={setFiles}
            existingAttachments={existingLampiran}
            onDeleteExistingAttachment={handleDeleteExistingAttachment}
            onUpdateExistingAttachmentCaption={handleUpdateExistingAttachmentCaption}
            lat={formTanah.watch('latitude')}
            lng={formTanah.watch('longitude')}
            onLatChange={(val) => formTanah.setValue('latitude', val)}
            onLngChange={(val) => formTanah.setValue('longitude', val)}
            hierarchyMeta={hierarchyMeta}
            label="Foto Lahan Tanah & Sertifikat"
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Keterangan / Batas Tanah</label>
            <textarea
              rows={2}
              placeholder="Batas utara/selatan, nomor sertifikat, dll..."
              {...formTanah.register('keterangan')}
              className="w-full p-3 rounded-xl border border-border-subtle bg-surface-elevated text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menyimpan Aset Tanah...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Simpan Aset Tanah</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* --- FORM ASET BANGUNAN --- */}
      {kategori === 'BANGUNAN' && (
        <form onSubmit={formBangunan.handleSubmit(onSubmitBangunan)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Nama Bangunan / Gedung *</label>
            <input
              type="text"
              placeholder="Misal: Gedung Gereja Immanuel, Rumah Pastori 1, Gedung Serba Guna"
              {...formBangunan.register('nama_bangunan')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            {formBangunan.formState.errors.nama_bangunan && (
              <p className="text-xs text-error">{formBangunan.formState.errors.nama_bangunan.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-high">Fungsi Utama Bangunan *</label>
              <input
                type="text"
                placeholder="Misal: Ibadah Utama, Pastori, Sekolah Minggu, Kantor Jemaat"
                {...formBangunan.register('fungsi')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {formBangunan.formState.errors.fungsi && (
                <p className="text-xs text-error">{formBangunan.formState.errors.fungsi.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-high">Tahun Berdiri *</label>
              <input
                type="number"
                {...formBangunan.register('thn_berdiri', { valueAsNumber: true })}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-base font-medium text-text-high tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Kondisi Bangunan *</label>
            <select
              {...formBangunan.register('kondisi')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {KONDISI_ASET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Camera Capture + GPS Auto-Fill + Manual Override Inputs */}
          <CameraCapture
            files={files}
            onFilesChange={setFiles}
            existingAttachments={existingLampiran}
            onDeleteExistingAttachment={handleDeleteExistingAttachment}
            onUpdateExistingAttachmentCaption={handleUpdateExistingAttachmentCaption}
            lat={formBangunan.watch('latitude')}
            lng={formBangunan.watch('longitude')}
            onLatChange={(val) => formBangunan.setValue('latitude', val)}
            onLngChange={(val) => formBangunan.setValue('longitude', val)}
            hierarchyMeta={hierarchyMeta}
            label="Foto Bangunan & IMB"
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Keterangan / Spesifikasi</label>
            <textarea
              rows={2}
              placeholder="Kapasitas jemaat, bahan konstruksi, perbaikan yang dibutuhkan..."
              {...formBangunan.register('keterangan')}
              className="w-full p-3 rounded-xl border border-border-subtle bg-surface-elevated text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menyimpan Aset Bangunan...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Simpan Aset Bangunan</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* --- FORM ASET BERGERAK --- */}
      {kategori === 'BERGERAK' && (
        <form onSubmit={formBergerak.handleSubmit(onSubmitBergerak)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-high">Jenis Aset *</label>
              <input
                type="text"
                placeholder="Misal: Sepeda Motor Dinas, Mobil Ambulans, Sound System"
                {...formBergerak.register('jenis')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {formBergerak.formState.errors.jenis && (
                <p className="text-xs text-error">{formBergerak.formState.errors.jenis.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-high">Merk / Tipe *</label>
              <input
                type="text"
                placeholder="Misal: Honda KLX 150, Toyota Hilux, Yamaha MG16XU"
                {...formBergerak.register('merk_tipe')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {formBergerak.formState.errors.merk_tipe && (
                <p className="text-xs text-error">{formBergerak.formState.errors.merk_tipe.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-high">Kondisi Aset *</label>
              <select
                {...formBergerak.register('kondisi')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {KONDISI_ASET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-high">Tahun Perolehan *</label>
              <input
                type="number"
                {...formBergerak.register('thn_perolehan', { valueAsNumber: true })}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-base font-medium text-text-high tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-high">Nomor Polisi (Jika Kendaraan)</label>
              <input
                type="text"
                placeholder="KT 1234 ABC"
                {...formBergerak.register('no_polisi')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm font-mono text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-high">Tanggal Jatuh Tempo Pajak</label>
              <input
                type="date"
                {...formBergerak.register('tgl_pajak')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Camera Capture + Photo/STNK Upload */}
          <CameraCapture
            files={files}
            onFilesChange={setFiles}
            existingAttachments={existingLampiran}
            onDeleteExistingAttachment={handleDeleteExistingAttachment}
            onUpdateExistingAttachmentCaption={handleUpdateExistingAttachmentCaption}
            lat={formBergerak.watch('latitude')}
            lng={formBergerak.watch('longitude')}
            onLatChange={(val) => formBergerak.setValue('latitude', val)}
            onLngChange={(val) => formBergerak.setValue('longitude', val)}
            hierarchyMeta={hierarchyMeta}
            label="Foto Unit Kendaraan & STNK/BPKB"
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Keterangan / Kondisi</label>
            <textarea
              rows={2}
              placeholder="Kondisi mesin, lokasi penyimpanan, nama penanggung jawab..."
              {...formBergerak.register('keterangan')}
              className="w-full p-3 rounded-xl border border-border-subtle bg-surface-elevated text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menyimpan Aset Bergerak...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Simpan Aset Bergerak</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
