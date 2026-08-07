'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { MapPin, Save, Send, FileText, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { haptic } from '@/lib/haptic/vibrate';

import { createAsetSchema, type CreateAsetSchema } from '@/lib/domains/aset/aset.schema';
import { useCreateAset } from '@/lib/domains/aset/aset.queries';
import { useFormDraft, FORM_KEYS } from '@/hooks/use-form-draft';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { generateTimestampId } from '@/lib/constants/id-formats';
import { NativeCameraCapture } from '@/components/camera/NativeCameraCapture';
import { GpsIndicator } from '@/components/gps/GpsIndicator';
import { KONDISI_ASET, STATUS_HUKUM_TANAH, type JenisAset } from '@/lib/domains/aset/aset.types';

interface AsetFormProps {
  jenis?: JenisAset;
  idPos?: string;
  // Legacy props support
  id_pos?: string;
  defaultKategori?: string;
  initialData?: any;
  showHierarchySelector?: boolean;
  onSuccess?: () => void;
}

export function AsetForm({ jenis, idPos, id_pos, defaultKategori }: AsetFormProps) {
  const actualIdPos = idPos || id_pos || '';
  const actualJenis = jenis || (defaultKategori?.toLowerCase() as JenisAset) || 'tanah';

  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  
  const [requestId] = useState(() => crypto.randomUUID());
  const [idAset] = useState(() => generateTimestampId(
    actualJenis === 'tanah' ? 'TNT' : actualJenis === 'bangunan' ? 'BGN' : 'ABG'
  ));
  const [idLampiran] = useState(() => generateTimestampId('LMP'));
  
  const [fotoBlob, setFotoBlob] = useState<Blob | null>(null);
  const [fotoGps, setFotoGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [manualGps, setManualGps] = useState<{ lat: string; lng: string } | null>(null);
  const [useManualGps, setUseManualGps] = useState(false);

  const formKey = `${FORM_KEYS.ASET_NEW}-${actualJenis}`;
  
  const form = useForm<CreateAsetSchema>({
    resolver: zodResolver(createAsetSchema) as any,
    defaultValues: {
      requestId,
      id_pos: actualIdPos,
      jenis: actualJenis,
      id_aset: idAset,
      latitude: 0,
      longitude: 0,
      keterangan: '',
      foto: null,
      // Defaults per jenis
      ...(actualJenis === 'tanah' && { luas_m2: 0 }),
      ...(actualJenis === 'bangunan' && { nama_bangunan: '' }),
      ...(actualJenis === 'bergerak' && { jenis_aset: '', kondisi: 'Baik' }),
    },
  });

  const { clearDraft } = useFormDraft(formKey, form as any);
  const mutation = useCreateAset();

  // Update GPS di form saat fotoGps berubah
  useEffect(() => {
    if (fotoGps && !useManualGps) {
      form.setValue('latitude', fotoGps.lat);
      form.setValue('longitude', fotoGps.lng);
      form.setValue('gps_accuracy', fotoGps.accuracy);
    }
  }, [fotoGps, useManualGps, form]);

  const handleCapture = useCallback((blob: Blob, gps?: { lat: number; lng: number; accuracy: number }) => {
    setFotoBlob(blob);
    if (gps) {
      setFotoGps(gps);
    }
    
    // Set metadata foto di form
    form.setValue('foto', {
      id_lampiran: idLampiran,
      nama_file: `aset-${actualJenis}-${idAset}.jpg`,
      file_path: `assets/${actualIdPos}/${actualJenis}/${idAset}/${requestId}-0.jpg`,
      tipe_file: 'image/jpeg',
      ukuran_file: blob.size,
    });
  }, [form, idLampiran, actualIdPos, actualJenis, idAset, requestId]);

  const onSubmit = (data: any) => {
    // Override GPS manual jika dipilih
    const finalData = useManualGps && manualGps
      ? { ...data, latitude: parseFloat(manualGps.lat), longitude: parseFloat(manualGps.lng) }
      : data;

    haptic('medium');
    mutation.mutate(
      { data: finalData, fotoBlob: fotoBlob ?? undefined },
      {
        onSuccess: (res) => {
          if (res.success) {
            clearDraft();
            router.back();
          }
        },
      }
    );
  };

  const isSubmitDisabled = mutation.isPending || !form.formState.isValid || (!fotoGps && !useManualGps);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-32 px-4 pt-4">
      {/* 1. KAMERA CAPTURE (Prioritas Utama) */}
      <section>
        <h2 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          📷 Foto Aset
        </h2>
        <NativeCameraCapture onCapture={handleCapture} />
      </section>

      {/* 2. GPS INDICATOR */}
      <section>
        <h2 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Lokasi GPS
        </h2>
        <GpsIndicator
          gps={fotoGps}
          useManual={useManualGps}
          onToggleManual={setUseManualGps}
          manualValue={manualGps}
          onManualChange={setManualGps}
          onGpsRefresh={setFotoGps}
        />
      </section>

      {/* 3. FIELD SPESIFIK PER JENIS */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Detail {actualJenis === 'tanah' ? 'Tanah' : actualJenis === 'bangunan' ? 'Bangunan' : 'Aset Bergerak'}
        </h2>

        {actualJenis === 'tanah' && (
          <>
            <div>
              <label className="text-sm text-gray-600">Luas (m²) *</label>
              <Input
                type="number"
                inputMode="decimal"
                {...form.register('luas_m2', { valueAsNumber: true })}
                className="h-12 text-base"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Status Hukum</label>
              <Select onValueChange={(v) => form.setValue('status_hukum', v as any)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Pilih status" /></SelectTrigger>
                <SelectContent>
                  {STATUS_HUKUM_TANAH.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Tahun Perolehan</label>
              <Input
                type="number"
                inputMode="numeric"
                {...form.register('thn_perolehan', { valueAsNumber: true })}
                className="h-12 text-base"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Potensi SDA</label>
              <Input
                {...form.register('potensi_sda')}
                placeholder="Contoh: mata air, kebun"
                className="h-12 text-base"
              />
            </div>
          </>
        )}

        {actualJenis === 'bangunan' && (
          <>
            <div>
              <label className="text-sm text-gray-600">Nama Bangunan *</label>
              <Input
                {...form.register('nama_bangunan')}
                placeholder="Contoh: Gedung Gereja, Pastori"
                className="h-12 text-base"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Fungsi</label>
              <Input
                {...form.register('fungsi')}
                placeholder="Contoh: Ibadah, Kantor"
                className="h-12 text-base"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Tahun Berdiri</label>
              <Input
                type="number"
                inputMode="numeric"
                {...form.register('thn_berdiri', { valueAsNumber: true })}
                className="h-12 text-base"
              />
            </div>
          </>
        )}

        {actualJenis === 'bergerak' && (
          <>
            <div>
              <label className="text-sm text-gray-600">Jenis Aset *</label>
              <Input
                {...form.register('jenis_aset')}
                placeholder="Contoh: Mobil, Genset, Sound System"
                className="h-12 text-base"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Merk / Tipe</label>
              <Input
                {...form.register('merk_tipe')}
                placeholder="Contoh: Toyota Avanza 2020"
                className="h-12 text-base"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Nomor Polisi</label>
              <Input
                {...form.register('no_polisi')}
                placeholder="B 1234 CD"
                className="h-12 text-base uppercase"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Jatuh Tempo Pajak</label>
              <Input
                type="date"
                {...form.register('tgl_pajak')}
                className="h-12 text-base"
              />
            </div>
          </>
        )}

        {/* Kondisi (untuk semua jenis) */}
        <div>
          <label className="text-sm text-gray-600">Kondisi</label>
          <div className="flex gap-2 mt-1">
            {KONDISI_ASET.map((k) => (
              <Button
                key={k}
                type="button"
                variant={form.watch('kondisi') === k ? 'default' : 'outline'}
                size="sm"
                className="flex-1 h-11"
                onClick={() => form.setValue('kondisi', k as any, { shouldValidate: true })}
              >
                {k}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">Keterangan</label>
          <Textarea
            {...form.register('keterangan')}
            placeholder="Catatan tambahan..."
            className="min-h-[80px] text-base"
          />
        </div>
      </section>

      {/* 4. SLOT MULTI-LAMPIRAN (Disabled — CJ-5.1) */}
      <section>
        <h2 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Paperclip className="w-4 h-4" /> Lampiran Dokumen
        </h2>
        <button
          type="button"
          aria-disabled="true"
          onClick={() => {
            toast.info('Multi-lampiran dokumen hadir di CJ-5.1');
            haptic('light');
          }}
          className="w-full h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 bg-gray-50"
        >
          <Paperclip className="w-5 h-5" />
          <span className="text-sm">Upload Sertifikat / Dokumen (Segera Hadir)</span>
        </button>
      </section>

      {/* 5. STICKY SUBMIT */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 pb-[calc(1rem+env(safe-area-inset-bottom))] z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button
          type="submit"
          className="w-full h-14 text-lg font-semibold"
          disabled={isSubmitDisabled}
        >
          {mutation.isPending ? (
            'Memproses...'
          ) : isOnline ? (
            <>
              <Send className="w-5 h-5 mr-2" /> Simpan Aset
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" /> Simpan & Kirim Nanti
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
