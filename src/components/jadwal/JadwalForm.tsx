'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  jadwalSchema, 
  JadwalInput, 
  HARI_OPTIONS, 
  JENIS_IBADAH_OPTIONS 
} from '@/lib/validations/jadwal.schema';
import { useCreateJadwal, useUpdateJadwal, JadwalItem } from '@/hooks/use-jadwal';
import { Loader2, Save, AlertCircle, Clock, Calendar } from 'lucide-react';

interface JadwalFormProps {
  id_pos?: string;
  initialData?: JadwalItem | null;
  onSuccess: () => void;
}

export function JadwalForm({ id_pos = 'POS-001', initialData, onSuccess }: JadwalFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createMutation = useCreateJadwal();
  const updateMutation = useUpdateJadwal();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JadwalInput>({
    resolver: zodResolver(jadwalSchema),
    defaultValues: {
      id_pos: initialData?.id_pos || id_pos,
      jenis: initialData?.jenis || JENIS_IBADAH_OPTIONS[0],
      hari: (initialData?.hari as any) || 'Minggu',
      jam: initialData?.jam ? initialData.jam.substring(0, 5) : '09:00',
      keterangan: initialData?.keterangan || '',
    },
  });

  const onSubmit = async (data: JadwalInput) => {
    setErrorMsg(null);
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id_ibadah: initialData.id_ibadah, input: data });
      } else {
        await createMutation.mutateAsync(data);
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

      {/* ID Pos Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high">ID Pos Pelkes *</label>
        <input
          type="text"
          {...register('id_pos')}
          className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        {errors.id_pos && <p className="text-xs text-error">{errors.id_pos.message}</p>}
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

      {/* Hari & Jam */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
            <Clock size={14} className="text-brand-primary" />
            <span>Jam Pelaksanaan (HH:mm) *</span>
          </label>
          <input
            type="time"
            {...register('jam')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-mono font-bold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.jam && <p className="text-xs text-error">{errors.jam.message}</p>}
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
