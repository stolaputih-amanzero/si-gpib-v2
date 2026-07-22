'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  jadwalSchema, 
  JadwalInput, 
  HARI_OPTIONS, 
  JENIS_IBADAH_OPTIONS,
  ZONA_WAKTU_OPTIONS 
} from '@/lib/validations/jadwal.schema';
import { useCreateJadwal, useUpdateJadwal, JadwalItem } from '@/hooks/use-jadwal';
import { Loader2, Save, AlertCircle, Clock, Calendar } from 'lucide-react';
import { PosCascadingSelector, HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { createClient } from '@/lib/supabase/client';

interface JadwalFormProps {
  id_pos?: string;
  initialData?: JadwalItem | null;
  onSuccess: () => void;
}

export function JadwalForm({ id_pos = 'POS-001', initialData, onSuccess }: JadwalFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [targetScope, setTargetScope] = useState<'pos' | 'jemaat'>(
    initialData?.id_pos && initialData.id_pos !== 'POS-001' ? 'pos' : (id_pos && id_pos !== 'POS-001' ? 'pos' : 'jemaat')
  );
  const [hierarchyMeta, setHierarchyMeta] = useState<HierarchyMetaInfo | null>(null);
  const [currentPosId, setCurrentPosId] = useState<string>(
    initialData?.id_pos || (id_pos === 'POS-001' ? '' : id_pos)
  );

  const createMutation = useCreateJadwal();
  const updateMutation = useUpdateJadwal();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JadwalInput>({
    resolver: zodResolver(jadwalSchema),
    defaultValues: {
      id_pos: currentPosId || undefined,
      jenis: initialData?.jenis || JENIS_IBADAH_OPTIONS[0],
      hari: (initialData?.hari as any) || 'Minggu',
      jam: initialData?.jam ? initialData.jam.substring(0, 5) : '09:00',
      zona_waktu: (initialData?.zona_waktu as any) || 'WIB',
      keterangan: initialData?.keterangan || '',
    },
  });

  // Sync currentPosId with react-hook-form value
  useEffect(() => {
    setValue('id_pos', currentPosId);
  }, [currentPosId, setValue]);

  const onSubmit = async (data: JadwalInput) => {
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
        await updateMutation.mutateAsync({ id_ibadah: initialData.id_ibadah, input: payload });
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
      setErrorMsg(err.message || 'Gagal menyimpan jadwal ibadah.');
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
        <label className="text-xs font-semibold text-text-high">Target Lingkup Jadwal *</label>
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

      {/* Jenis Ibadah */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high">Jenis Ibadah *</label>
        <select
          {...register('jenis')}
          className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          {JENIS_IBADAH_OPTIONS.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
        {errors.jenis && <p className="text-xs text-error">{errors.jenis.message}</p>}
      </div>

      {/* Hari */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
          <Calendar size={14} className="text-brand-primary" />
          <span>Hari Pelaksanaan *</span>
        </label>
        <select
          {...register('hari')}
          className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          {HARI_OPTIONS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        {errors.hari && <p className="text-xs text-error">{errors.hari.message}</p>}
      </div>

      {/* Jam dan Zona dalam 1 Baris */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
            <Clock size={14} className="text-brand-primary" />
            <span>Jam *</span>
          </label>
          <input
            type="time"
            {...register('jam')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-mono font-bold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.jam && <p className="text-xs text-error">{errors.jam.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
            <Clock size={14} className="text-brand-primary" />
            <span>Zona *</span>
          </label>
          <select
            {...register('zona_waktu')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {ZONA_WAKTU_OPTIONS.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          {errors.zona_waktu && <p className="text-xs text-error">{errors.zona_waktu.message}</p>}
        </div>
      </div>

      {/* Keterangan */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high">Keterangan / Tempat</label>
        <textarea
          rows={2}
          placeholder="Misal: Bertempat di Gedung Gereja Pos, membawa Alkitab & Kidung Jemaat..."
          {...register('keterangan')}
          className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-base text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
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
            <span>Menyimpan Jadwal...</span>
          </>
        ) : (
          <>
            <Save size={18} />
            <span>{initialData ? 'Perbarui Jadwal Ibadah' : 'Simpan Jadwal Ibadah'}</span>
          </>
        )}
      </button>
    </form>
  );
}
