'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mic, MicOff, Calendar, Clock, Loader2 } from 'lucide-react';
import { useVoiceInput } from '@/hooks/use-voice-input';
import { logPastoralSchema, LogPastoralInput } from '@/lib/validations/log-pastoral.schema';
import { createClient } from '@/lib/supabase/client';
import { PosCascadingSelector, HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { PastoralPhotoPicker } from '@/components/pastoral/PastoralPhotoPicker';
import { useToast } from '@/components/ui/toast';
import { formatPastoralKegiatanText } from '@/lib/formatters/pastoral-text';

interface LogPastoralFormProps {
  id_pos?: string;
  id_induk?: string;
  onSuccess: () => void;
}

export default function LogPastoralForm({ id_pos, id_induk, onSuccess }: LogPastoralFormProps) {
  const { toast } = useToast();
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [hierarchyMeta, setHierarchyMeta] = useState<HierarchyMetaInfo | null>(null);
  const [targetScope, setTargetScope] = useState<'pos' | 'jemaat'>(id_pos ? 'pos' : 'jemaat');

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
    control,
    formState: { errors, isSubmitting },
  } = useForm<LogPastoralInput>({
    resolver: zodResolver(logPastoralSchema),
    defaultValues: {
      id_induk: id_induk || '',
      id_pos: id_pos || undefined,
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
      setValue('tgl', getTodayDateString());
      setValue('jam', getNowTimeString());
      if (id_pos) setValue('id_pos', id_pos);
      if (id_induk) setValue('id_induk', id_induk);

      const { data: pendetaData } = await supabase
        .from('m_pendeta')
        .select('id_pendeta')
        .limit(1);

      if (pendetaData && pendetaData[0]) {
        setValue('id_pendeta', pendetaData[0].id_pendeta);
      }
    };

    initFormDefaults();
  }, [id_pos, id_induk, setValue]);

  useEffect(() => {
    if (transcript) {
      const formatted = formatPastoralKegiatanText(transcript);
      setValue('kegiatan', formatted, { shouldValidate: true });
    }
  }, [transcript, setValue]);

  const onSubmit = async (data: LogPastoralInput) => {
    try {
      const supabase = createClient();
      let pendetaId = data.id_pendeta;
      if (!pendetaId) {
        const { data: pData } = await supabase.from('m_pendeta').select('id_pendeta').limit(1);
        if (pData && pData[0]) pendetaId = pData[0].id_pendeta;
      }

      if (!pendetaId) {
        toast.error('Pendeta Belum Terdaftar', 'Silakan daftarkan pendeta terlebih dahulu.');
        return;
      }

      let finalPosId = data.id_pos && data.id_pos.trim() !== '' ? data.id_pos : id_pos || null;

      if (targetScope === 'pos' && !finalPosId) {
        toast.error('Wilayah Belum Lengkap', 'Silakan pilih Wilayah Pos Pelkes / Bajem.');
        return;
      }

      const idLog = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const tglStr = typeof data.tgl === 'string' ? data.tgl : getTodayDateString();
      const jamStr = data.jam || getNowTimeString();
      const zonaStr = data.zona_waktu || 'WIB';

      let rawCatatanFormatted = data.catatan ? formatPastoralKegiatanText(data.catatan) : '';
      const timeTag = `[⏰ Jam Pelayanan: ${jamStr} ${zonaStr}]`;
      let finalCatatan = rawCatatanFormatted ? `${timeTag}\n${rawCatatanFormatted}` : timeTag;

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
        toast.error('Gagal Menyimpan Log', error.message);
        return;
      }

      toast.success('Berhasil Disimpan', 'Log pastoral baru berhasil dicatat.');
      onSuccess();
    } catch (err: any) {
      toast.error('Gagal Menyimpan Log', err?.message || 'Terjadi kesalahan sistem.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Tanggal & Waktu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
            <span>Tanggal Pelayanan *</span>
          </label>
          <input
            type="date"
            {...register('tgl')}
            className="w-full min-h-[40px] px-3 rounded-xl border border-border-subtle bg-surface-sunken text-text-high text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-primary" />
            <span>Waktu / Jam & Timezone *</span>
          </label>
          <div className="flex gap-2">
            <input
              type="time"
              {...register('jam')}
              className="flex-1 min-h-[40px] px-3 rounded-xl border border-border-subtle bg-surface-sunken text-text-high text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <select
              {...register('zona_waktu')}
              className="min-h-[40px] px-3 rounded-xl border border-border-subtle bg-surface-sunken text-text-high text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary shrink-0"
            >
              <option value="WIB">WIB</option>
              <option value="WITA">WITA</option>
              <option value="WIT">WIT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Target Scope Switcher */}
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

      {/* Pos Pelkes Cascading Selector */}
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

      {/* Kegiatan Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high flex items-center justify-between">
          <span>Kegiatan Pastoral *</span>
          {isVoiceSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-primary text-white'
              }`}
            >
              {isListening ? <MicOff size={12} /> : <Mic size={12} />}
              <span>{isListening ? 'Stop Suara' : 'Input Suara'}</span>
            </button>
          )}
        </label>
        <textarea
          {...register('kegiatan')}
          rows={3}
          className="w-full p-3 rounded-xl border border-border-subtle bg-surface-sunken text-text-high text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
          placeholder="Cth: Kunjungan pastoral keluarga Jemaat dan penguatan doa..."
        />
        {errors.kegiatan && <p className="text-xs text-red-500 font-medium">{errors.kegiatan.message}</p>}
      </div>

      {/* Jumlah Jiwa */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high">Jumlah Jiwa Terlibat (Opsional)</label>
        <input
          type="number"
          {...register('jml_jiwa', { valueAsNumber: true })}
          className="w-full min-h-[40px] px-3 rounded-xl border border-border-subtle bg-surface-sunken text-text-high text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
          placeholder="Cth: 5"
        />
      </div>

      {/* Catatan / Detail */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high">Catatan Keterangan Tambahan (Opsional)</label>
        <textarea
          {...register('catatan')}
          rows={2}
          className="w-full p-3 rounded-xl border border-border-subtle bg-surface-sunken text-text-high text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
          placeholder="Cth: Pokok doa khusus untuk pemulihan kesehatan..."
        />
      </div>

      {/* Foto Kunjungan */}
      <PastoralPhotoPicker
        photoUrl={photoBase64}
        hierarchyMeta={hierarchyMeta}
        onPhotoChange={(_file, base64Url) => setPhotoBase64(base64Url || null)}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-md text-xs font-bold text-white bg-brand-primary hover:bg-blue-800 transition-all disabled:opacity-50 min-h-[44px]"
      >
        {isSubmitting ? (
          <><Loader2 size={16} className="animate-spin mr-2" /> Menyimpan...</>
        ) : (
          'Simpan Log Pastoral'
        )}
      </button>
    </form>
  );
}
