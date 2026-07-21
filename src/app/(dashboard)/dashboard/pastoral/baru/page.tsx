'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mic, MicOff, Save, Calendar, Users } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useVoiceInput } from '@/hooks/use-voice-input';
import { logPastoralSchema, LogPastoralInput } from '@/lib/validations/log-pastoral.schema';
import { createClient } from '@/lib/supabase/client';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { PosCascadingSelector } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';

export default function LogPastoralBaruPage() {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const {
    isListening,
    transcript,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
  } = useVoiceInput();

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
      tgl: new Date(),
      kegiatan: '',
      jml_jiwa: undefined,
      catatan: '',
      id_pendeta: 'dummy-pendeta',
    },
  });

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Set default Today date string for input
    const todayStr = getTodayDateString();
    setValue('tgl', new Date(todayStr));

    // Get user id as pendeta id temporarily
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setValue('id_pendeta', user.id);
      }
    };
    fetchUser();
  }, [setValue]);

  // Auto-fill voice transcript ke field kegiatan
  useEffect(() => {
    if (transcript) {
      setValue('kegiatan', transcript, { shouldValidate: true });
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
        // Restore form data (kecuali tanggal)
        setValue('kegiatan', draft.kegiatan || '');
        setValue('jml_jiwa', draft.jml_jiwa);
        setValue('catatan', draft.catatan || '');
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [setValue]);

  const onSubmit = async (data: LogPastoralInput) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User tidak terautentikasi');

      // Generate ID log
      const idLog = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const tglValue = data.tgl && !isNaN(new Date(data.tgl).getTime())
        ? new Date(data.tgl).toISOString().split('T')[0]
        : getTodayDateString();

      const { error } = await supabase.from('t_log_pastoral').insert({
        id_log: idLog,
        id_pos: data.id_pos || null,
        id_pendeta: data.id_pendeta,
        tgl: tglValue,
        kegiatan: data.kegiatan,
        jml_jiwa: data.jml_jiwa,
        catatan: data.catatan,
      });

      if (error) throw error;

      // Clear draft
      localStorage.removeItem('draft:log-pastoral');

      // Haptic feedback (success)
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }

      router.push('/laporan/pastoral');
    } catch (error) {
      console.error('Failed to save log:', error);
      // Haptic feedback (error)
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-base pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/80 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-serif font-bold text-text-high">
            Input Log Pastoral
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Catat kegiatan pelayanan Anda
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Tanggal */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-high flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Tanggal *
          </label>
          <input
            type="date"
            defaultValue={getTodayDateString()}
            {...register('tgl', {
              valueAsDate: true,
            })}
            className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base text-text-high text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          />
          {errors.tgl && (
            <p className="text-xs text-error">{errors.tgl.message}</p>
          )}
        </div>

        {/* Pos Pelkes Cascading Selector (Mupel & Jemaat Mandatory, Pos Pelkes Optional) */}
        <div className="space-y-1.5 w-full">
          <Controller
            name="id_pos"
            control={control}
            render={({ field }) => (
              <PosCascadingSelector
                value={field.value}
                onChange={field.onChange}
                onJemaatChange={(jemaatId) => setValue('id_induk', jemaatId, { shouldValidate: true })}
                error={errors.id_pos?.message}
                jemaatError={errors.id_induk?.message}
                disabled={isSubmitting}
                required={false}
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
            rows={4}
            placeholder="Deskripsikan kegiatan pastoral..."
            className="w-full min-h-[120px] px-3 py-2 rounded-md border border-border-subtle bg-surface-base text-text-high text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-none"
          />
          {errors.kegiatan && (
            <p className="text-xs text-error">{errors.kegiatan.message}</p>
          )}
          {isListening && (
            <p className="text-xs text-brand-primary animate-pulse">
               Mendengarkan... (Bahasa Indonesia)
            </p>
          )}
        </div>

        {/* Jumlah Jiwa */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-high flex items-center gap-2">
            <Users className="w-4 h-4" />
            Jumlah Jiwa
          </label>
          <input
            type="number"
            {...register('jml_jiwa', { valueAsNumber: true })}
            placeholder="0"
            className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-base text-text-high text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          />
          {errors.jml_jiwa && (
            <p className="text-xs text-error">{errors.jml_jiwa.message}</p>
          )}
        </div>

        {/* Catatan */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-high">
            Catatan (Opsional)
          </label>
          <textarea
            {...register('catatan')}
            rows={3}
            placeholder="Catatan tambahan..."
            className="w-full min-h-[100px] px-3 py-2 rounded-md border border-border-subtle bg-surface-base text-text-high text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isOnline}
          className="w-full min-h-[44px] bg-brand-primary text-white rounded-md font-medium text-base flex items-center justify-center gap-2 hover:bg-brand-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isSubmitting ? 'Menyimpan...' : 'Simpan Log'}
        </button>

        {!isOnline && (
          <p className="text-xs text-center text-amber-600">
            ⚠️ Anda offline. Data akan disimpan sebagai draft.
          </p>
        )}
      </form>
    </div>
  );
}
