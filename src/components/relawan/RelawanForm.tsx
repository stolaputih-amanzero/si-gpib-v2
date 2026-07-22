'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { relawanSchema, RelawanInput, KATEGORI_RELAWAN } from '@/lib/validations/relawan.schema';
import { useCreateRelawan, useUpdateRelawan, RelawanItem } from '@/hooks/use-relawan';
import { Loader2, Save, AlertCircle, Phone, Award, Building } from 'lucide-react';
import { PosCascadingSelector, HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { createClient } from '@/lib/supabase/client';

interface RelawanFormProps {
  id_pos?: string;
  initialData?: RelawanItem | null;
  onSuccess: () => void;
}

export function RelawanForm({ id_pos = 'POS-001', initialData, onSuccess }: RelawanFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [targetScope, setTargetScope] = useState<'pos' | 'jemaat'>(
    initialData?.id_pos && initialData.id_pos !== 'POS-001' ? 'pos' : (id_pos && id_pos !== 'POS-001' ? 'pos' : 'jemaat')
  );
  const [hierarchyMeta, setHierarchyMeta] = useState<HierarchyMetaInfo | null>(null);
  const [currentPosId, setCurrentPosId] = useState<string>(
    initialData?.id_pos || (id_pos === 'POS-001' ? '' : id_pos)
  );

  const createMutation = useCreateRelawan();
  const updateMutation = useUpdateRelawan();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RelawanInput>({
    resolver: zodResolver(relawanSchema),
    defaultValues: {
      id_pos: currentPosId || undefined,
      nama: initialData?.nama || '',
      no_wa: initialData?.no_wa || '+628',
      gender: initialData?.gender || 'Laki-laki',
      kategori: initialData?.kategori || KATEGORI_RELAWAN[0],
      pelatihan: initialData?.pelatihan || '',
      keterangan: initialData?.keterangan || '',
    },
  });

  // Sync currentPosId with react-hook-form value
  useEffect(() => {
    setValue('id_pos', currentPosId);
  }, [currentPosId, setValue]);

  const onSubmit = async (data: RelawanInput) => {
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
        await updateMutation.mutateAsync({ id_relawan: initialData.id_relawan, input: payload });
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
      setErrorMsg(err.message || 'Gagal menyimpan data relawan.');
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
        <label className="text-xs font-semibold text-text-high">Target Lingkup Relawan *</label>
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
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-bold text-text-high uppercase tracking-wider flex items-center gap-1.5">
            <Building size={14} className="text-brand-primary" />
            <span>Pilih Wilayah Lokasi Relawan *</span>
          </h2>
          <span className="text-[11px] font-semibold text-text-muted">
            {targetScope === 'jemaat'
              ? 'Pos Pelkes Opsional (Level Jemaat)'
              : 'Pos Pelkes Wajib (Compulsory)'}
          </span>
        </div>

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

      {/* Nama & No WA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Nama Lengkap Relawan *</label>
          <input
            type="text"
            placeholder="Nama relawan..."
            {...register('nama')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.nama && <p className="text-xs text-error">{errors.nama.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
            <Phone size={14} className="text-emerald-600" />
            <span>Nomor WhatsApp (+62...) *</span>
          </label>
          <input
            type="text"
            placeholder="+6281234567890"
            {...register('no_wa')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-mono text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.no_wa && <p className="text-xs text-error">{errors.no_wa.message}</p>}
        </div>
      </div>

      {/* Kategori & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Kategori Relawan *</label>
          <select
            {...register('kategori')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {KATEGORI_RELAWAN.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
          {errors.kategori && <p className="text-xs text-error">{errors.kategori.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Jenis Kelamin *</label>
          <select
            {...register('gender')}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
          {errors.gender && <p className="text-xs text-error">{errors.gender.message}</p>}
        </div>
      </div>

      {/* Pelatihan */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
          <Award size={14} className="text-amber-500" />
          <span>Pelatihan yang Pernah Diikuti (Opsional)</span>
        </label>
        <input
          type="text"
          placeholder="Misal: Pelatihan Tanggap Bencana, Pertolongan Pertama, Sekolah Minggu"
          {...register('pelatihan')}
          className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-base font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {/* Keterangan */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high">Keterangan Tambahan</label>
        <textarea
          rows={2}
          placeholder="Catatan keahlian khusus, domisili..."
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
            <span>Menyimpan Relawan...</span>
          </>
        ) : (
          <>
            <Save size={18} />
            <span>{initialData ? 'Perbarui Data Relawan' : 'Simpan Relawan Baru'}</span>
          </>
        )}
      </button>
    </form>
  );
}
