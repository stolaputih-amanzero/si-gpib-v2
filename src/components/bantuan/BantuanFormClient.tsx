'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { DollarSign, FileText, X } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { FileUploadField, FileUploadItem } from '@/components/forms/FileUploadField';
import { WorkflowStatusIndicator } from '@/components/forms/WorkflowStatusIndicator';
import { AssetLinkSelector } from '@/components/forms/AssetLinkSelector';
import { DraftIndicator } from '@/components/forms/DraftIndicator';
import { SubmitFab } from '@/components/forms/SubmitFab';

import { PosCascadingSelector, HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { useUserMupelAuth } from '@/hooks/use-hierarki-selector';
import { useToast } from '@/components/ui/toast';
import { useFormDraft } from '@/hooks/use-form-draft';
import { usePendingSubmissions } from '@/hooks/use-pending-submissions';
import { useNetworkStatus } from '@/hooks/use-network-status';

import { createPengajuanBantuanAction } from '@/app/actions/bantuan';
import { shareBantuanWA } from '@/lib/share/share-bantuan-wa';
import { cn } from '@/lib/utils';

export function BantuanFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryPosId = searchParams.get('id_pos');

  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();
  const { data: userAuth } = useUserMupelAuth();

  const [hasAssetLink, setHasAssetLink] = useState<'Tidak' | 'Ya'>('Tidak');
  const [assetLinkValue, setAssetLinkValue] = useState<{ id_tanah?: string | null; id_bangunan?: string | null; id_aset_b?: string | null }>({});
  const [proposalFiles, setProposalFiles] = useState<FileUploadItem[]>([]);
  const [hierarchyMeta, setHierarchyMeta] = useState<HierarchyMetaInfo | null>(null);
  const [targetScope, setTargetScope] = useState<'pos' | 'jemaat'>('jemaat');
  const [hasSubmitError, setHasSubmitError] = useState(false);

  const [biayaDisplay, setBiayaDisplay] = useState<string>('5.000.000');
  const [biayaNumeric, setBiayaNumeric] = useState<number>(5000000);

  const { pendingCount, addPendingSubmission } = usePendingSubmissions();

  const initialValues = {
    id_pos: '',
    jenis_bantuan: '',
    biaya: 5000000,
    urgensi: 'Sedang' as const,
    keterangan: '',
  };

  const { draft, saveDraft, clearDraft, status: draftStatus } = useFormDraft(
    'draft:form-bantuan',
    initialValues
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: draft || initialValues,
  });

  // Watch form fields & auto-save to draft
  useEffect(() => {
    const subscription = watch((value) => {
      saveDraft(value as any);
    });
    return () => subscription.unsubscribe();
  }, [watch, saveDraft]);

  // Set default values on mount
  useEffect(() => {
    if (userAuth) {
      if (userAuth.id_pos) {
        setValue('id_pos', userAuth.id_pos);
        setTargetScope('pos');
      } else if (queryPosId) {
        setValue('id_pos', queryPosId);
        setTargetScope('pos');
      }
    }
  }, [userAuth, queryPosId, setValue]);

  const handleBiayaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    const num = parseInt(rawDigits, 10) || 0;
    setBiayaNumeric(num);
    setBiayaDisplay(num.toLocaleString('id-ID'));
    setValue('biaya', num);
  };

  const onSubmit = async (formValues: any) => {
    setHasSubmitError(false);

    const posId = formValues.id_pos || hierarchyMeta?.id_pos || 'POS-MOCK-001';

    try {
      const proposalPayload = proposalFiles.map((f) => ({
        name: f.name,
        size: f.size,
      }));

      const payload = {
        id_pos: posId,
        jenis_bantuan: formValues.jenis_bantuan,
        biaya: biayaNumeric,
        urgensi: formValues.urgensi || 'Sedang',
        id_tanah: hasAssetLink === 'Ya' ? assetLinkValue.id_tanah : null,
        id_bangunan: hasAssetLink === 'Ya' ? assetLinkValue.id_bangunan : null,
        id_aset_b: hasAssetLink === 'Ya' ? assetLinkValue.id_aset_b : null,
        keterangan: formValues.keterangan || null,
        proposal_files: proposalPayload,
      };

      if (!isOnline) {
        addPendingSubmission('bantuan', payload);
        clearDraft();
        toast.info('Tersimpan di Antrean Offline', 'Koneksi internet tidak tersedia. Data akan dikirim otomatis saat online.');
        router.push('/bantuan');
        return;
      }

      const created = await createPengajuanBantuanAction(payload);

      clearDraft();
      toast.success('Pengajuan Bantuan Dikirim', 'Status pengajuan: Pending Review KMJ.');
      
      // Trigger WhatsApp Notification
      try {
        await shareBantuanWA({
          id_ajuan: created?.id_ajuan || 'AJU-NEW',
          jenis_bantuan: formValues.jenis_bantuan,
          id_pos: posId,
          nama_pos: hierarchyMeta?.posName,
          nama_induk: hierarchyMeta?.jemaatName,
          biaya: biayaNumeric,
          urgensi: formValues.urgensi || 'Sedang',
          status: 'Pending_KMJ',
          keterangan: formValues.keterangan || null,
        });
      } catch (err) {
        console.warn('Share WA error:', err);
      }

      router.push(`/bantuan/${created?.id_ajuan || ''}`);
    } catch (err: any) {
      console.error('Failed to create assistance request:', err);
      setHasSubmitError(true);
      toast.error('Gagal Mengajukan Bantuan', err?.message || 'Terjadi kesalahan sistem.');
    }
  };

  const selectedUrgensi = watch('urgensi');

  return (
    <div className="min-h-screen bg-surface-base pb-32 select-none">
      {/* Sticky Header with DraftIndicator */}
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
                Ajukan Bantuan Pos Pelkes
              </h1>
              <DraftIndicator status={draftStatus} pendingCount={pendingCount} className="mt-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Stack */}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Workflow Progress Indicator Bar */}
        <WorkflowStatusIndicator status="Draft" />

        {/* 1. Cascading Selector */}
        <Controller
          name="id_pos"
          control={control}
          render={({ field }) => (
            <PosCascadingSelector
              value={field.value}
              onChange={field.onChange}
              onJemaatChange={() => setValue('id_pos', '')}
              onMetaChange={(meta) => setHierarchyMeta(meta)}
              disabled={isSubmitting}
              required={targetScope === 'pos'}
              hidePos={targetScope === 'jemaat'}
            />
          )}
        />

        {/* 2. Jenis Bantuan */}
        <FormField label="Jenis Permohonan Bantuan" required error={errors.jenis_bantuan?.message}>
          <input
            type="text"
            {...register('jenis_bantuan', { required: true })}
            placeholder="Contoh: Renovasi Atap Pastori Bocor / Mobil Ambulans Dinas"
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm font-semibold focus:ring-2 focus:ring-brand-primary"
          />
        </FormField>

        {/* 3. Biaya Estimasi (Format Rupiah) & Urgensi (Color Coding Chips) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Estimasi Biaya Bantuan (Rp)" required icon={<DollarSign size={16} className="text-emerald-600" />}>
            <input
              type="text"
              inputMode="decimal"
              value={biayaDisplay}
              onChange={handleBiayaChange}
              placeholder="0"
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high font-mono text-base font-extrabold focus:ring-2 focus:ring-brand-primary"
            />
          </FormField>

          <FormField label="Tingkat Urgensi Bantuan" required>
            <Controller
              name="urgensi"
              control={control}
              render={() => (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-surface-sunken p-1 rounded-2xl border border-border-subtle">
                  {[
                    { id: 'Rendah', label: 'Rendah', color: 'bg-emerald-500/10 text-emerald-600' },
                    { id: 'Sedang', label: 'Sedang', color: 'bg-amber-500/10 text-amber-600' },
                    { id: 'Tinggi', label: 'Tinggi', color: 'bg-orange-500/10 text-orange-600' },
                    { id: 'Kritis', label: 'Kritis', color: 'bg-red-500/10 text-red-600 font-black' },
                  ].map((chip) => {
                    const isSelected = selectedUrgensi === chip.id;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setValue('urgensi', chip.id as any)}
                        className={cn(
                          'py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center cursor-pointer',
                          isSelected
                            ? 'bg-brand-primary text-white shadow-2xs'
                            : chip.color
                        )}
                      >
                        <span>{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </FormField>
        </div>

        {/* 4. Link ke Aset (Yes/No Toggle + AssetLinkSelector) */}
        <div className="space-y-3 p-4 rounded-2xl bg-surface-sunken/60 border border-border-subtle">
          <FormField label="Apakah permohonan ini terkait aset fisik tertentu?">
            <div className="grid grid-cols-2 gap-2 bg-surface-sunken p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setHasAssetLink('Tidak');
                  setAssetLinkValue({});
                }}
                className={cn(
                  'py-2 rounded-lg text-xs font-bold transition-all min-h-[44px] cursor-pointer',
                  hasAssetLink === 'Tidak'
                    ? 'bg-surface-1 text-brand-primary shadow-2xs'
                    : 'text-text-muted hover:text-text-high'
                )}
              >
                <span>Tidak (Umum)</span>
              </button>
              <button
                type="button"
                onClick={() => setHasAssetLink('Ya')}
                className={cn(
                  'py-2 rounded-lg text-xs font-bold transition-all min-h-[44px] cursor-pointer',
                  hasAssetLink === 'Ya'
                    ? 'bg-surface-1 text-brand-primary shadow-2xs'
                    : 'text-text-muted hover:text-text-high'
                )}
              >
                <span>Ya (Kaitkan Aset)</span>
              </button>
            </div>
          </FormField>

          {hasAssetLink === 'Ya' && (
            <AssetLinkSelector
              idPos={watch('id_pos') || hierarchyMeta?.id_pos}
              value={assetLinkValue}
              onChange={setAssetLinkValue}
            />
          )}
        </div>

        {/* 5. Proposal / RAB PDF Upload (FileUploadField Max 10MB) */}
        <FormField label="Dokumen Proposal / RAB (PDF/JPG, Max 10MB)" icon={<FileText size={16} />}>
          <FileUploadField
            files={proposalFiles}
            onChange={setProposalFiles}
            maxSizeMB={10}
            maxFiles={3}
          />
        </FormField>

        {/* 6. Keterangan Tambahan */}
        <FormField label="Detail Latar Belakang & Urgensi">
          <textarea
            {...register('keterangan')}
            rows={4}
            placeholder="Jelaskan kebutuhan perbaikan, dampak pelayanan jemaat, dan catatan penting lainnya..."
            className="w-full min-h-[120px] px-3.5 py-3 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm focus:ring-2 focus:ring-brand-primary resize-none"
          />
        </FormField>

        {/* Sticky Submit FAB with 3 States */}
        <SubmitFab
          label="Kirim Pengajuan Bantuan"
          onSubmit={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          isOffline={!isOnline}
          hasError={hasSubmitError}
        />
      </form>
    </div>
  );
}

export default BantuanFormClient;
