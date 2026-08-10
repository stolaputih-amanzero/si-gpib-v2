'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Clock, Users, Church, MapPin, X } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { QuickSelectChips } from '@/components/forms/QuickSelectChips';
import { CameraCaptureField } from '@/components/forms/CameraCaptureField';
import { VoiceInputField } from '@/components/forms/VoiceInputField';
import { DraftIndicator } from '@/components/forms/DraftIndicator';
import { SubmitFab } from '@/components/forms/SubmitFab';
import { Skeleton } from '@/components/ui/skeleton';

import { logPastoralSchema, LogPastoralInput } from '@/lib/validations/log-pastoral.schema';
import { createClient } from '@/lib/supabase/client';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { PosCascadingSelector, HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { useUserMupelAuth } from '@/hooks/use-hierarki-selector';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { useFormDraft } from '@/hooks/use-form-draft';
import { usePendingSubmissions } from '@/hooks/use-pending-submissions';
import { formatPastoralKegiatanText } from '@/lib/formatters/pastoral-text';
import { createLogPastoralAction } from '@/app/(dashboard)/dashboard/pastoral/actions';
import { generateTimestampId } from '@/lib/constants/id-formats';

export interface PastoralFormClientProps {
  autoLockedPosId?: string | null;
  onClose?: () => void;
  isSheetMode?: boolean;
}

export function PastoralFormClient({ autoLockedPosId, onClose, isSheetMode }: PastoralFormClientProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryPosId = searchParams.get('id_pos');

  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();
  const { data: userAuth } = useUserMupelAuth();

  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [, setHierarchyMeta] = useState<HierarchyMetaInfo | null>(null);
  const [targetScope, setTargetScope] = useState<'pos' | 'jemaat'>('jemaat');
  const [hasSubmitError, setHasSubmitError] = useState(false);

  const { pendingCount, addPendingSubmission } = usePendingSubmissions();

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getNowTimeString = () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const initialFormValues: LogPastoralInput = {
    id_induk: 'JMT-MOCK-001',
    id_pos: undefined,
    tgl: getTodayDateString(),
    jam: getNowTimeString(),
    zona_waktu: 'WIB',
    kegiatan: 'Kunjungan Jemaat',
    jml_jiwa: undefined,
    catatan: '',
    id_pendeta: 'PDT-41915346',
  };

  const { draft, saveDraft, clearDraft, status: draftStatus, hasRestoredDraft, isLoading } = useFormDraft(
    'draft:log-pastoral',
    initialFormValues
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LogPastoralInput>({
    resolver: zodResolver(logPastoralSchema),
    defaultValues: draft || initialFormValues,
  });

  // Restore draft into form values when loaded from Dexie
  useEffect(() => {
    if (!isLoading && hasRestoredDraft && draft) {
      reset(draft);
    }
  }, [isLoading, hasRestoredDraft, reset, draft]);

  // Watch form fields & auto-save to draft with Debounce (suppressed during submit)
  useEffect(() => {
    const subscription = watch((value) => {
      if (!isSubmitting && !isLoading && (value.kegiatan || value.catatan || value.jml_jiwa)) {
        const timeout = setTimeout(() => {
          saveDraft(value as any);
        }, 5000);
        return () => clearTimeout(timeout);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, saveDraft, isSubmitting, isLoading]);

  // Set default values on mount if not already present
  useEffect(() => {
    const initDefaults = async () => {
      const supabase = createClient();
      if (!watch('tgl')) setValue('tgl', getTodayDateString());
      if (!watch('jam')) setValue('jam', getNowTimeString());
      if (!watch('id_induk')) setValue('id_induk', 'JMT-MOCK-001');

      if (userAuth) {
        if (userAuth.id_induk) setValue('id_induk', userAuth.id_induk, { shouldValidate: true });
        
        if (autoLockedPosId) {
          setValue('id_pos', autoLockedPosId);
          setTargetScope('pos');
        } else if (userAuth.id_pos) {
          setValue('id_pos', userAuth.id_pos);
          setTargetScope('pos');
        } else if (queryPosId) {
          setValue('id_pos', queryPosId);
          setTargetScope('pos');
        }
        
        if (userAuth.id_pendeta) {
          setValue('id_pendeta', userAuth.id_pendeta);
        } else {
          const { data: pData } = await supabase.from('m_pendeta').select('id_pendeta').limit(1);
          if (pData && pData[0]) setValue('id_pendeta', pData[0].id_pendeta);
        }
      } else if (autoLockedPosId) {
        setValue('id_pos', autoLockedPosId);
        setTargetScope('pos');
      }
    };
    initDefaults();
  }, [userAuth, queryPosId, setValue, watch, autoLockedPosId]);

  const onSubmit = async (data: LogPastoralInput) => {
    setHasSubmitError(false);

    let pendetaId = data.id_pendeta || userAuth?.id_pendeta || 'PDT-00000001';
    let finalPosId = autoLockedPosId || (data.id_pos && data.id_pos.trim() !== '' ? data.id_pos : null);

    if (targetScope === 'pos' && !finalPosId) {
      toast.error('Wilayah Belum Lengkap', 'Silakan pilih Wilayah Pos Pelkes / Bajem terlebih dahulu.');
      return;
    }

    const idLog = generateTimestampId('LOG');
    const tglStr = typeof data.tgl === 'string' ? data.tgl : getTodayDateString();
    const jamStr = data.jam || getNowTimeString();
    const zonaStr = data.zona_waktu || 'WIB';

    let rawCatatan = data.catatan ? formatPastoralKegiatanText(data.catatan) : '';
    const timeTag = `[⏰ Jam Pelayanan: ${jamStr} ${zonaStr}]`;
    let finalCatatan = rawCatatan ? `${timeTag}\n${rawCatatan}` : timeTag;

    if (photoBase64) {
      finalCatatan += `\n[📷 FOTO_BASE64:${photoBase64}]`;
    }

    const formattedKegiatan = formatPastoralKegiatanText(data.kegiatan);

    const payload = {
      id_log: idLog,
      id_pos: finalPosId,
      id_pendeta: pendetaId,
      tgl: tglStr,
      kegiatan: formattedKegiatan,
      jml_jiwa: data.jml_jiwa ? Number(data.jml_jiwa) : null,
      catatan: finalCatatan,
    };

    const isCurrentlyOffline = !isOnline || (typeof navigator !== 'undefined' && !navigator.onLine);

    if (isCurrentlyOffline) {
      // Queue submission offline immediately without waiting for network timeouts or router push errors
      addPendingSubmission('insert', 'create_log_pastoral', payload as Record<string, unknown>);
      clearDraft();
      reset();
      toast.info('Tersimpan di Antrean Offline', 'Koneksi internet tidak tersedia. Data tersimpan di antrean offline.');
      if (onClose) onClose();
      else router.push('/aid-requests'); // Adjust route if needed
      return;
    }

    try {
      await createLogPastoralAction(payload);
      clearDraft();
      toast.success('Log Pastoral Disimpan', 'Catatan kunjungan pastoral berhasil disimpan.');
      if (onClose) onClose();
      else router.push('/laporan/pastoral');
    } catch (err: any) {
      console.warn('Online sync failed, queuing to offline pending submissions:', err);
      addPendingSubmission('insert', 'create_log_pastoral', payload as Record<string, unknown>);
      clearDraft();
      toast.info('Tersimpan di Antrean Offline', 'Koneksi internet terputus. Data tersimpan di antrean offline.');
      if (onClose) onClose();
      else router.push('/laporan/pastoral');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-base p-6 space-y-6">
        <Skeleton className="w-full h-12 rounded-xl" />
        <Skeleton className="w-full h-32 rounded-xl" />
        <Skeleton className="w-full h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className={cn("bg-surface-base select-none", isSheetMode ? "" : "min-h-screen pb-32")}>
      {/* Sticky Header with DraftIndicator */}
      {!isSheetMode && (
        <div className="sticky top-0 z-40 bg-surface-1/85 backdrop-blur-md border-b border-border-subtle pt-safe">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="p-2 rounded-xl text-text-high hover:bg-surface-sunken transition-all border border-border-subtle/50 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Tutup"
              >
                <X size={20} className="text-text-muted" />
              </button>
              <div>
                <h1 className="text-lg font-display font-semibold text-text-high leading-tight">
                  Catat Kunjungan Pastoral
                </h1>
                <DraftIndicator status={draftStatus} pendingCount={pendingCount} className="mt-0.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Fields Stack */}
      <form onSubmit={handleSubmit(onSubmit)} className={cn("mx-auto space-y-6", isSheetMode ? "pb-24" : "max-w-4xl px-4 py-6")}>
        {/* Context Info (Read-only Header) */}
        <div className="p-4 rounded-2xl bg-surface-sunken/60 border border-border-subtle text-xs space-y-1">
          <div className="flex items-center justify-between text-text-muted font-medium">
            <span>Role: <strong className="text-text-high">{userAuth?.role || 'Pelayan Field'}</strong></span>
            <span>{getTodayDateString()}</span>
          </div>
        </div>

        {/* 1. Target Scope Selector (Hidden if Auto-Locked) */}
        {!autoLockedPosId && (
          <FormField label="Lingkup Pelayanan" required>
            <div className="grid grid-cols-2 gap-2 bg-surface-sunken p-1 rounded-2xl border border-border-subtle">
              <button
                type="button"
                data-testid="target-scope-jemaat"
                onClick={() => {
                  setTargetScope('jemaat');
                  setValue('id_pos', undefined);
                }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
                  targetScope === 'jemaat'
                    ? 'bg-surface-1 text-brand-primary shadow-2xs'
                    : 'text-text-muted hover:text-text-high'
                }`}
              >
                <Church size={15} />
                <span>Jemaat Induk</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('pos')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
                  targetScope === 'pos'
                    ? 'bg-surface-1 text-brand-primary shadow-2xs'
                    : 'text-text-muted hover:text-text-high'
                }`}
              >
                <MapPin size={15} />
                <span>Pos Pelkes / Bajem</span>
              </button>
            </div>
          </FormField>
        )}

        {/* 2. Cascading Selector (Hidden if Auto-Locked) */}
        {!autoLockedPosId && (
          <Controller
            name="id_pos"
            control={control}
            render={({ field }) => (
              <PosCascadingSelector
                value={field.value}
                onChange={field.onChange}
                onJemaatChange={(jemaatId) => setValue('id_induk', jemaatId || 'JMT-MOCK-001', { shouldValidate: true })}
                onMetaChange={(meta) => setHierarchyMeta(meta)}
                error={errors.id_pos?.message}
                jemaatError={errors.id_induk?.message}
                disabled={isSubmitting}
                required={targetScope === 'pos'}
                hidePos={targetScope === 'jemaat'}
              />
            )}
          />
        )}

        {/* 3. Jenis Kegiatan (QuickSelectChips) */}
        <FormField label="Jenis Kegiatan Pastoral" required error={errors.kegiatan?.message}>
          <Controller
            name="kegiatan"
            control={control}
            render={({ field }) => (
              <QuickSelectChips
                value={field.value}
                onChange={(val) => setValue('kegiatan', val, { shouldValidate: true })}
              />
            )}
          />
        </FormField>

        {/* 4. Date & Time Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Tanggal Pelayanan" required icon={<Calendar size={16} />} error={errors.tgl?.message}>
            <input
              type="date"
              {...register('tgl')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </FormField>

          <FormField label="Waktu & Timezone" required icon={<Clock size={16} />} error={errors.jam?.message}>
            <div className="flex gap-2">
              <input
                type="time"
                {...register('jam')}
                className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <select
                {...register('zona_waktu')}
                className="min-h-[44px] px-3 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer shrink-0"
              >
                <option value="WIB">WIB</option>
                <option value="WITA">WITA</option>
                <option value="WIT">WIT</option>
              </select>
            </div>
          </FormField>
        </div>

        {/* 5. Jumlah Jiwa Dilayani */}
        <FormField label="Jumlah Jiwa Dilayani" icon={<Users size={16} />} error={errors.jml_jiwa?.message}>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            data-testid="input-jml-jiwa"
            {...register('jml_jiwa', {
              setValueAs: (val) => (val === '' || val === null || (typeof val === 'number' && isNaN(val)) ? undefined : Number(val)),
            })}
            placeholder="0"
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </FormField>

        {/* 6. Catatan Kegiatan dengan Voice Input */}
        <FormField
          label="Catatan Pastoral & Hasil Kunjungan"
          hint="Gunakan tombol mic untuk dikte suara Bahasa Indonesia"
          error={errors.catatan?.message}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted font-medium">Suara & Catatan Teks</span>
              <VoiceInputField
                onTranscribe={(text) => {
                  const currentText = watch('catatan') || '';
                  setValue('catatan', currentText ? `${currentText} ${text}` : text, { shouldValidate: true });
                }}
              />
            </div>
            <textarea
              {...register('catatan')}
              data-testid="input-catatan"
              rows={4}
              placeholder="Deskripsikan hasil kunjungan, kebutuhan pendoaan, atau catatan pastoral..."
              className="w-full min-h-[120px] px-3.5 py-3 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>
        </FormField>

        {/* 7. Foto Kegiatan (CameraCaptureField dengan fallback) */}
        <FormField label="Dokumentasi Foto Kegiatan (Opsional)">
          <CameraCaptureField
            value={photoBase64}
            onChange={(base64) => setPhotoBase64(base64)}
          />
        </FormField>

        {/* Sticky Submit FAB with 3 States */}
        <SubmitFab
          label="Catat Kunjungan Pastoral"
          onSubmit={handleSubmit(onSubmit, (errs) => console.error('[PASTORAL VALIDATION FAILED]', JSON.stringify(errs)))}
          isSubmitting={isSubmitting}
          isOffline={!isOnline}
          hasError={hasSubmitError}
        />
      </form>
    </div>
  );
}

export default PastoralFormClient;
