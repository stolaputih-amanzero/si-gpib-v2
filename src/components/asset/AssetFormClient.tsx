'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, RefreshCw, X, LandPlot, Building2, Car } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { QuickSelectChips } from '@/components/forms/QuickSelectChips';
import { CameraCaptureField } from '@/components/forms/CameraCaptureField';
import { FileUploadField, FileUploadItem } from '@/components/forms/FileUploadField';
import { DraftIndicator } from '@/components/forms/DraftIndicator';
import { SubmitFab } from '@/components/forms/SubmitFab';

import { PosCascadingSelector, HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { useUserMupelAuth } from '@/hooks/use-hierarki-selector';
import { useToast } from '@/components/ui/toast';
import { useFormDraft } from '@/hooks/use-form-draft';
import { usePendingSubmissions } from '@/hooks/use-pending-submissions';
import { useGeolocation } from '@/hooks/use-geolocation';

import { createAsetAction } from '@/app/actions/aset';
import { cn } from '@/lib/utils';

export interface AssetFormClientProps {
  autoLockedPosId?: string | null;
  onClose?: () => void;
  isSheetMode?: boolean;
}

export function AssetFormClient({ autoLockedPosId, onClose, isSheetMode }: AssetFormClientProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryPosId = searchParams.get('id_pos');

  const { toast } = useToast();
  const { data: userAuth } = useUserMupelAuth();
  const { lat: geoLat, lng: geoLng, loading: isGeoLoading, getLocation } = useGeolocation();

  const [jenisAset, setJenisAset] = useState<'tanah' | 'bangunan' | 'bergerak'>('tanah');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [dokumenFiles, setDokumenFiles] = useState<FileUploadItem[]>([]);
  const [hierarchyMeta, setHierarchyMeta] = useState<HierarchyMetaInfo | null>(null);
  const [targetScope, setTargetScope] = useState<'pos' | 'jemaat'>('jemaat');
  const [hasSubmitError, setHasSubmitError] = useState(false);

  // GPS State & Priority Indicator (EXIF -> Browser -> Manual)
  const [lat, setLat] = useState<number>(-0.4948);
  const [lng, setLng] = useState<number>(117.1436);
  const [gpsSource, setGpsSource] = useState<'exif' | 'browser' | 'manual'>('browser');

  const { pendingCount } = usePendingSubmissions();

  const initialValues = {
    id_pos: '',
    luas_m2: 100,
    thn_perolehan: new Date().getFullYear(),
    status_hukum: 'SHM',
    kondisi: 'Baik',
    fungsi: 'Gereja',
    thn_berdiri: new Date().getFullYear(),
    jenis_bergerak: 'Kendaraan',
    merk_tipe: '',
    no_polisi: '',
    tgl_pajak: '',
    potensi_sda: '',
    keterangan: '',
  };

  const { draft, saveDraft, clearDraft, status: draftStatus } = useFormDraft(
    'draft:form-aset',
    initialValues
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { isSubmitting },
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

  // Update GPS from Geolocation API if source is browser
  useEffect(() => {
    if (geoLat && geoLng && gpsSource === 'browser') {
      setLat(geoLat);
      setLng(geoLng);
    }
  }, [geoLat, geoLng, gpsSource]);

  // Set default values on mount
  useEffect(() => {
    if (userAuth) {
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
    } else if (autoLockedPosId) {
      setValue('id_pos', autoLockedPosId);
      setTargetScope('pos');
    }
  }, [userAuth, queryPosId, setValue, autoLockedPosId]);

  const handleRefreshGps = () => {
    getLocation();
    if (geoLat && geoLng) {
      setLat(geoLat);
      setLng(geoLng);
      setGpsSource('browser');
    }
  };

  const onSubmit = async (formValues: any) => {
    setHasSubmitError(false);

    if (!photoBase64) {
      toast.error('Foto Aset Wajib Ada', 'Sesuai Business Rule #16, foto aset wajib diambil.');
      return;
    }

    const posId = autoLockedPosId || formValues.id_pos || hierarchyMeta?.id_pos || 'POS-MOCK-001';

    try {
      let asetPayloadData: any = {
        id_pos: posId,
        latitude: lat,
        longitude: lng,
        keterangan: formValues.keterangan || null,
      };

      if (jenisAset === 'tanah') {
        asetPayloadData = {
          ...asetPayloadData,
          luas_m2: Number(formValues.luas_m2 || 100),
          thn_perolehan: Number(formValues.thn_perolehan || 2020),
          status_hukum: formValues.status_hukum || 'SHM',
          kondisi: formValues.kondisi || 'Baik',
          potensi_sda: formValues.potensi_sda || null,
        };
      } else if (jenisAset === 'bangunan') {
        asetPayloadData = {
          ...asetPayloadData,
          fungsi: formValues.fungsi || 'Gereja',
          kondisi: formValues.kondisi || 'Baik',
          thn_berdiri: Number(formValues.thn_berdiri || 2010),
        };
      } else if (jenisAset === 'bergerak') {
        asetPayloadData = {
          ...asetPayloadData,
          jenis: formValues.jenis_bergerak || 'Kendaraan',
          merk_tipe: formValues.merk_tipe || 'Aset Bergerak',
          thn_perolehan: Number(formValues.thn_perolehan || 2020),
          no_polisi: formValues.no_polisi || null,
          tgl_pajak: formValues.tgl_pajak || null,
        };
      }

      const dokumenNames = dokumenFiles.map((d) => d.name);

      await createAsetAction({
        jenis_aset: jenisAset,
        id_pos: posId,
        data: asetPayloadData,
        foto_base64: photoBase64,
        dokumen_paths: dokumenNames,
      });

      clearDraft();
      toast.success('Aset Berhasil Disimpan', `Aset ${jenisAset.toUpperCase()} di ${hierarchyMeta?.posName || 'Wilayah'} telah tercatat.`);
      if (onClose) onClose();
      else router.push('/assets'); // updated to canon route
    } catch (err: any) {
      console.error('Failed to save asset:', err);
      setHasSubmitError(true);
      toast.error('Gagal Menyimpan Aset', err?.message || 'Terjadi kesalahan sistem.');
    }
  };

  const selectedJenisBergerak = watch('jenis_bergerak');

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
                  Tambah Aset Inventaris
                </h1>
                <DraftIndicator status={draftStatus} pendingCount={pendingCount} className="mt-0.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Stack */}
      <form onSubmit={handleSubmit(onSubmit)} className={cn("mx-auto space-y-6", isSheetMode ? "pb-24" : "max-w-4xl px-4 py-6")}>
        {/* GPS Auto-Fill Context Card with Indicator */}
        <div className="p-4 rounded-2xl bg-surface-sunken/60 border border-border-subtle text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-text-high flex items-center gap-1.5">
              <MapPin size={14} className="text-brand-primary" />
              <span>Koordinat GPS Aset (Business Rule #16)</span>
            </span>

            {/* GPS Source Priority Indicator */}
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border',
                gpsSource === 'exif'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : gpsSource === 'browser'
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  : 'bg-surface-sunken text-text-tertiary border-border-subtle'
              )}
            >
              {gpsSource === 'exif' ? 'GPS dari Foto' : gpsSource === 'browser' ? 'GPS Browser' : 'GPS Manual'}
            </span>
          </div>

          <div className="flex items-center justify-between text-text-muted font-mono">
            <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
            <button
              type="button"
              onClick={handleRefreshGps}
              disabled={isGeoLoading}
              className="px-2.5 py-1 rounded-lg bg-surface-1 border border-border-subtle text-brand-primary font-bold text-[11px] flex items-center gap-1 hover:bg-surface-sunken transition-all cursor-pointer min-h-[36px]"
            >
              <RefreshCw size={12} className={isGeoLoading ? 'animate-spin' : ''} />
              <span>Refresh GPS</span>
            </button>
          </div>
        </div>

        {/* 1. QuickSelectChips (Jenis Aset: Tanah / Bangunan / Bergerak) */}
        <FormField label="Pilih Jenis Aset" required>
          <div className="grid grid-cols-3 gap-2 bg-surface-sunken p-1 rounded-2xl border border-border-subtle">
            {[
              { id: 'tanah', label: 'Tanah', icon: LandPlot },
              { id: 'bangunan', label: 'Bangunan', icon: Building2 },
              { id: 'bergerak', label: 'Bergerak', icon: Car },
            ].map((chip) => {
              const Icon = chip.icon;
              const isSelected = jenisAset === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setJenisAset(chip.id as any)}
                  className={cn(
                    'py-3 rounded-xl text-xs font-extrabold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 min-h-[44px] cursor-pointer',
                    isSelected
                      ? 'bg-brand-primary text-white shadow-2xs'
                      : 'text-text-muted hover:text-text-high'
                  )}
                >
                  <Icon size={16} />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </FormField>

        {/* 2. Cascading Wilayah Selector (Hidden if Auto-Locked) */}
        {!autoLockedPosId && (
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
        )}

        {/* 3. Conditional Fields per Jenis Aset */}
        {jenisAset === 'tanah' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Luas Tanah (m²)" required>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  {...register('luas_m2', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm focus:ring-2 focus:ring-brand-primary"
                />
              </FormField>

              <FormField label="Tahun Perolehan" required>
                <input
                  type="number"
                  inputMode="numeric"
                  {...register('thn_perolehan', { valueAsNumber: true })}
                  placeholder="2020"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm focus:ring-2 focus:ring-brand-primary"
                />
              </FormField>
            </div>

            <FormField label="Status Hukum Sertifikat" required>
              <Controller
                name="status_hukum"
                control={control}
                render={({ field }) => (
                  <QuickSelectChips
                    options={['SHM', 'HGB', 'Girik', 'Lainnya']}
                    value={field.value}
                    onChange={field.onChange}
                    allowCustom={false}
                  />
                )}
              />
            </FormField>

            <FormField label="Kondisi Tanah" required>
              <Controller
                name="kondisi"
                control={control}
                render={({ field }) => (
                  <QuickSelectChips
                    options={['Baik', 'Rusak Ringan', 'Rusak Berat', 'Sengketa']}
                    value={field.value}
                    onChange={field.onChange}
                    allowCustom={false}
                  />
                )}
              />
            </FormField>

            <FormField label="Potensi SDA (Mata Air, Kebun, dll)">
              <textarea
                {...register('potensi_sda')}
                rows={2}
                placeholder="Contoh: terdapat sumber mata air bersih dan perkebunan kelapa..."
                className="w-full min-h-[80px] px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm focus:ring-2 focus:ring-brand-primary resize-none"
              />
            </FormField>
          </div>
        )}

        {jenisAset === 'bangunan' && (
          <div className="space-y-4 animate-fade-in">
            <FormField label="Fungsi Utama Bangunan" required>
              <Controller
                name="fungsi"
                control={control}
                render={({ field }) => (
                  <QuickSelectChips
                    options={['Gereja', 'Pastori', 'Sekolah', 'Kantor', 'Lainnya']}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Kondisi Bangunan" required>
                <Controller
                  name="kondisi"
                  control={control}
                  render={({ field }) => (
                    <QuickSelectChips
                      options={['Baik', 'Rusak Ringan', 'Rusak Berat', 'Tidak Layak']}
                      value={field.value}
                      onChange={field.onChange}
                      allowCustom={false}
                    />
                  )}
                />
              </FormField>

              <FormField label="Tahun Berdiri" required>
                <input
                  type="number"
                  inputMode="numeric"
                  {...register('thn_berdiri', { valueAsNumber: true })}
                  placeholder="2010"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm focus:ring-2 focus:ring-brand-primary"
                />
              </FormField>
            </div>
          </div>
        )}

        {jenisAset === 'bergerak' && (
          <div className="space-y-4 animate-fade-in">
            <FormField label="Jenis Aset Bergerak" required>
              <Controller
                name="jenis_bergerak"
                control={control}
                render={({ field }) => (
                  <QuickSelectChips
                    options={['Kendaraan', 'Alat Musik', 'Elektronik', 'Furniture', 'Lainnya']}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Merk / Tipe Aset" required>
                <input
                  type="text"
                  {...register('merk_tipe')}
                  placeholder="Contoh: Toyota Avanza 2020 / Yamaha Sound System"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm focus:ring-2 focus:ring-brand-primary"
                />
              </FormField>

              <FormField label="Tahun Perolehan" required>
                <input
                  type="number"
                  inputMode="numeric"
                  {...register('thn_perolehan', { valueAsNumber: true })}
                  placeholder="2020"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm focus:ring-2 focus:ring-brand-primary"
                />
              </FormField>
            </div>

            {selectedJenisBergerak === 'Kendaraan' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                <FormField label="Nomor Polisi (Plat Vehicle)">
                  <input
                    type="text"
                    {...register('no_polisi')}
                    placeholder="Contoh: KT 1234 AB"
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm uppercase focus:ring-2 focus:ring-brand-primary"
                  />
                </FormField>

                <FormField label="Jatuh Tempo Pajak (STNK/BPKB)">
                  <input
                    type="date"
                    {...register('tgl_pajak')}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm focus:ring-2 focus:ring-brand-primary"
                  />
                </FormField>
              </div>
            )}
          </div>
        )}

        {/* 4. Keterangan Tambahan */}
        <FormField label="Keterangan Catatan Aset">
          <textarea
            {...register('keterangan')}
            rows={3}
            placeholder="Catatan tambahan lokasi, riwayat hibah, atau kondisi fisik..."
            className="w-full min-h-[100px] px-3.5 py-3 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm focus:ring-2 focus:ring-brand-primary resize-none"
          />
        </FormField>

        {/* 5. Foto Aset (100% REUSE CameraCaptureField - WAJIB) */}
        <FormField label="Foto Aset (WAJIB - Business Rule #16)" required>
          <CameraCaptureField
            value={photoBase64}
            onChange={(base64) => {
              setPhotoBase64(base64);
              if (base64) setGpsSource('exif');
            }}
          />
        </FormField>

        {/* 6. Dokumen Pendukung (FileUploadField Baru - Max 10MB) */}
        <FormField label="Dokumen Pendukung (Sertifikat / Akta PDF, Max 10MB)">
          <FileUploadField
            files={dokumenFiles}
            onChange={setDokumenFiles}
            maxSizeMB={10}
            maxFiles={5}
          />
        </FormField>

        {/* Sticky Submit FAB with 3 States */}
        <SubmitFab
          label="Simpan Data Aset"
          onSubmit={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          isOffline={false}
          hasError={hasSubmitError}
        />
      </form>
    </div>
  );
}

export default AssetFormClient;
