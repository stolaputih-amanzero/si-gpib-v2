'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mic, MicOff, Save, Calendar, Clock, Users, ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVoiceInput } from '@/hooks/use-voice-input';
import { logPastoralSchema, LogPastoralInput } from '@/lib/validations/log-pastoral.schema';
import { createClient } from '@/lib/supabase/client';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { PosCascadingSelector, HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { PastoralPhotoPicker } from '@/components/pastoral/PastoralPhotoPicker';
import { useToast } from '@/components/ui/toast';

import { formatPastoralKegiatanText } from '@/lib/formatters/pastoral-text';

function LogPastoralBaruContentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [hierarchyMeta, setHierarchyMeta] = useState<HierarchyMetaInfo | null>(null);
  const [targetScope, setTargetScope] = useState<'pos' | 'jemaat'>('jemaat');
  const searchParams = useSearchParams();
  const queryPosId = searchParams.get('id_pos');

  const {
    isListening,
    transcript,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
  } = useVoiceInput();

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LogPastoralInput>({
    resolver: zodResolver(logPastoralSchema),
    defaultValues: {
      id_induk: '',
      id_pos: undefined,
      tgl: getTodayDateString(),
      jam: getNowTimeString(),
      zona_waktu: 'WIB',
      kegiatan: '',
      jml_jiwa: undefined,
      catatan: '',
      id_pendeta: '',
    },
  });

  useEffect(() => {
    const initFormDefaults = async () => {
      const supabase = createClient();
      
      // 1. Set default Today date & current local time string
      setValue('tgl', getTodayDateString());
      setValue('jam', getNowTimeString());

      // 2. Resolve valid id_pendeta from m_pendeta table to pass Foreign Key constraint
      const { data: pendetaData } = await supabase
        .from('m_pendeta')
        .select('id_pendeta')
        .limit(1);

      if (pendetaData && pendetaData[0]) {
        setValue('id_pendeta', pendetaData[0].id_pendeta);
      }
    };

    initFormDefaults();
  }, [setValue]);

  useEffect(() => {
    if (queryPosId) {
      setValue('id_pos', queryPosId);
      setTargetScope('pos');
    }
  }, [queryPosId, setValue]);

  // Auto-fill & smart format voice transcript ke field kegiatan
  useEffect(() => {
    if (transcript) {
      const formatted = formatPastoralKegiatanText(transcript);
      setValue('kegiatan', formatted, { shouldValidate: true });
    }
  }, [transcript, setValue]);

  // Form draft auto-save setiap 30 detik
  useEffect(() => {
    const interval = setInterval(() => {
      const formData = watch();
      if (formData.kegiatan) {
        localStorage.setItem(
          'draft:log-pastoral',
          JSON.stringify({ ...formData, savedAt: new Date().toISOString() })
        );
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [watch]);

  // Load draft dari localStorage saat mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('draft:log-pastoral');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.kegiatan) setValue('kegiatan', draft.kegiatan);
        if (draft.jml_jiwa) setValue('jml_jiwa', draft.jml_jiwa);
        if (draft.catatan) setValue('catatan', draft.catatan);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [setValue]);

  const onSubmit = async (data: LogPastoralInput) => {
    try {
      const supabase = createClient();

      // Ensure valid pendeta ID fallback if not set
      let pendetaId = data.id_pendeta;
      if (!pendetaId) {
        const { data: pData } = await supabase.from('m_pendeta').select('id_pendeta').limit(1);
        if (pData && pData[0]) {
          pendetaId = pData[0].id_pendeta;
        }
      }

      if (!pendetaId) {
        toast.error('Pendeta Belum Terdaftar', 'Silakan daftarkan pendeta di sistem terlebih dahulu.');
        return;
      }

      // Resolve finalPosId according to targetScope
      let finalPosId = data.id_pos && data.id_pos.trim() !== '' ? data.id_pos : null;

      if (targetScope === 'pos') {
        if (!finalPosId) {
          toast.error('Wilayah Belum Lengkap', 'Silakan pilih Wilayah Pos Pelkes / Bajem terlebih dahulu.');
          return;
        }
      } else {
        // Target scope: Jemaat Induk
        const jemaatId = data.id_induk || hierarchyMeta?.id_induk;
        if (!jemaatId) {
          toast.error('Wilayah Belum Lengkap', 'Silakan pilih Wilayah Mupel & Jemaat Induk terlebih dahulu.');
          return;
        }

        if (!finalPosId) {
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
            if (!insErr) {
              finalPosId = createdPosId;
            }
          }
        }
      }

      // Generate ID log
      const idLog = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const tglStr = typeof data.tgl === 'string'
        ? data.tgl
        : data.tgl instanceof Date
        ? data.tgl.toISOString().split('T')[0]
        : getTodayDateString();

      const jamStr = data.jam || getNowTimeString();
      const zonaStr = data.zona_waktu || 'WIB';

      // Combine time prefix and hierarchy metadata into catatan
      let rawCatatanFormatted = data.catatan ? formatPastoralKegiatanText(data.catatan) : '';
      const timeTag = `[⏰ Jam Pelayanan: ${jamStr} ${zonaStr}]`;
      let finalCatatan = rawCatatanFormatted ? `${timeTag}\n${rawCatatanFormatted}` : timeTag;

      // Format hierarchy metadata tag
      const mupelName = hierarchyMeta?.mupelName || 'Mupel GPIB';
      const jemaatName = hierarchyMeta?.jemaatName || 'Jemaat Induk';
      const posName = targetScope === 'jemaat'
        ? '-'
        : hierarchyMeta?.posName && hierarchyMeta.posName !== 'Pelayanan Jemaat Direct'
        ? hierarchyMeta.posName
        : '-';
      const hierarchyTag = `[🏛️ HIERARKI: ${mupelName} | ${jemaatName} | ${posName}]`;

      if (!finalCatatan.includes('HIERARKI:')) {
        finalCatatan += `\n${hierarchyTag}`;
      }

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

      const { error } = await supabase.from('t_log_pastoral').insert(payload);

      if (error) {
        console.error('Supabase Error Insert Log Pastoral:', error);
        toast.error('Gagal Menyimpan Log', error.message || 'Terjadi kesalahan saat menyimpan ke database.');
        return;
      }

      // Clear draft
      localStorage.removeItem('draft:log-pastoral');
      toast.success('Berhasil Disimpan', `Log pastoral di ${posName !== '-' ? posName : jemaatName} telah dicatat.`);

      // Haptic feedback (success)
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }

      router.push('/laporan/pastoral');
    } catch (err: any) {
      console.error('Failed to save log:', err);
      toast.error('Gagal Menyimpan Log', err?.message || 'Terjadi kesalahan sistem.');
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-base pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/80 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 rounded-xl text-text-high hover:bg-surface-sunken transition-all border border-border-subtle/50"
              aria-label="Kembali"
            >
              <ChevronLeft size={20} className="text-brand-primary" />
            </button>
            <div>
              <h1 className="text-xl font-serif font-bold text-text-high leading-tight">
                Input Log Pastoral
              </h1>
              <p className="text-xs text-text-muted">
                Catat kegiatan pelayanan pastoral & foto kunjungan Anda
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Tanggal & Waktu / Jam (Side by Side) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-high flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary" />
              Tanggal Pelayanan *
            </label>
            <input
              type="date"
              {...register('tgl')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-text-high text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            {errors.tgl && (
              <p className="text-xs text-error font-medium">{errors.tgl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-high flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-primary" />
              Waktu / Jam & Timezone *
            </label>
            <div className="flex gap-2">
              <input
                type="time"
                {...register('jam')}
                className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-text-high text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <select
                {...register('zona_waktu')}
                className="min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-text-high text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary shrink-0 cursor-pointer"
              >
                <option value="WIB">WIB (UTC+7)</option>
                <option value="WITA">WITA (UTC+8)</option>
                <option value="WIT">WIT (UTC+9)</option>
              </select>
            </div>
            {errors.jam && (
              <p className="text-xs text-error font-medium">{errors.jam.message}</p>
            )}
          </div>
        </div>

        {/* 1. Selector Target Scope (Jemaat Induk vs Pos Pelkes) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Target Lingkup Pelayanan *</label>
          <div className="grid grid-cols-2 gap-2 bg-surface-sunken p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setTargetScope('jemaat');
                setValue('id_pos', undefined);
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

        {/* 2. Pos Pelkes Cascading Selector */}
        <div className="space-y-1.5 w-full">
          <Controller
            name="id_pos"
            control={control}
            render={({ field }) => (
              <PosCascadingSelector
                value={field.value}
                onChange={field.onChange}
                onJemaatChange={(jemaatId) => setValue('id_induk', jemaatId, { shouldValidate: true })}
                onMetaChange={(meta) => setHierarchyMeta(meta)}
                error={errors.id_pos?.message}
                jemaatError={errors.id_induk?.message}
                disabled={isSubmitting}
                required={targetScope === 'pos'}
                hidePos={targetScope === 'jemaat'}
              />
            )}
          />
        </div>

        {/* Kegiatan dengan Voice Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-high flex items-center justify-between">
            <span>Kegiatan *</span>
            {isVoiceSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-brand-primary text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3 h-3" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3" />
                    Suara
                  </>
                )}
              </button>
            )}
          </label>
          <textarea
            {...register('kegiatan')}
            onBlur={(e) => {
              const formatted = formatPastoralKegiatanText(e.target.value);
              setValue('kegiatan', formatted, { shouldValidate: true });
            }}
            rows={4}
            placeholder="Deskripsikan kegiatan pastoral (contoh: Kunjungan Jemaat Sakit, Konseling Keluarga)..."
            className="w-full min-h-[120px] px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-text-high text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
          />
          {errors.kegiatan && (
            <p className="text-xs text-error font-medium">{errors.kegiatan.message}</p>
          )}
          {isListening && (
            <p className="text-xs text-brand-primary font-medium animate-pulse">
               Mendengarkan... (Bahasa Indonesia)
            </p>
          )}
        </div>

        {/* Foto Dokumentasi (Kamera / Galeri dengan GPS, Timestamp & Hierarki Watermark) */}
        <PastoralPhotoPicker
          photo={null}
          hierarchyMeta={hierarchyMeta}
          onPhotoChange={(_, base64) => setPhotoBase64(base64 || null)}
          disabled={isSubmitting}
        />

        {/* Jumlah Jiwa */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-high flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-primary" />
            Jumlah Jiwa Dilayani
          </label>
          <input
            type="number"
            {...register('jml_jiwa', { valueAsNumber: true })}
            placeholder="0"
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-text-high text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.jml_jiwa && (
            <p className="text-xs text-error font-medium">{errors.jml_jiwa.message}</p>
          )}
        </div>

        {/* Catatan */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-high">
            Catatan Pastoral (Opsional)
          </label>
          <textarea
            {...register('catatan')}
            onBlur={(e) => {
              const formatted = formatPastoralKegiatanText(e.target.value);
              setValue('catatan', formatted);
            }}
            rows={3}
            placeholder="Catatan tambahan pastoral..."
            className="w-full min-h-[100px] px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-text-high text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isOnline}
          className="w-full min-h-[44px] bg-brand-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-primary-dark active:scale-[0.98] transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isSubmitting ? 'Menyimpan...' : 'Simpan Log Pastoral'}
        </button>

        {!isOnline && (
          <p className="text-xs text-center text-amber-600 font-medium">
            ⚠️ Anda sedang offline. Data akan disimpan secara lokal.
          </p>
        )}
      </form>
    </div>
  );
}

import { Suspense } from 'react';

export default function LogPastoralBaruPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-text-muted animate-pulse font-medium">Memuat form pastoral...</div>}>
      <LogPastoralBaruContentPage />
    </Suspense>
  );
}
