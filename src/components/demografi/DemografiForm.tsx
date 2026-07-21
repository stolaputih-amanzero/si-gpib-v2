'use client';

import { useState, useEffect } from 'react';
import { useBatchUpsertDemografi } from '@/hooks/use-demografi';
import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { PosCascadingSelector, HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { formatPastoralKegiatanText } from '@/lib/formatters/pastoral-text';
import { createClient } from '@/lib/supabase/client';

type PelkatKode = 'PA' | 'PT' | 'GP' | 'PKP' | 'PKB' | 'PKLU';

interface DemografiFormProps {
  id_pos?: string;
  initialData?: any;
  onSuccess?: (savedData: any, metaInfo?: HierarchyMetaInfo | null) => void;
}

export function DemografiForm({ id_pos: propIdPos, onSuccess }: DemografiFormProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hierarchyMeta, setHierarchyMeta] = useState<HierarchyMetaInfo | null>(null);

  // Selector Target Scope: 'pos' (Pos Pelkes) vs 'jemaat' (Jemaat Induk)
  const [targetScope, setTargetScope] = useState<'pos' | 'jemaat'>('jemaat');
  const [selectedIdPos, setSelectedIdPos] = useState<string>('');

  // 6 Pelkat Rows state
  const [pelkatRows, setPelkatRows] = useState<Record<PelkatKode, { laki: number; perempuan: number; jml_kk: number }>>({
    PA: { laki: 0, perempuan: 0, jml_kk: 0 },
    PT: { laki: 0, perempuan: 0, jml_kk: 0 },
    GP: { laki: 0, perempuan: 0, jml_kk: 0 },
    PKP: { laki: 0, perempuan: 0, jml_kk: 0 },
    PKB: { laki: 0, perempuan: 0, jml_kk: 0 },
    PKLU: { laki: 0, perempuan: 0, jml_kk: 0 },
  });

  // Additional Fields
  const [profesi, setProfesi] = useState<string>('');
  const [pendidikan, setPendidikan] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');

  const batchUpsertMutation = useBatchUpsertDemografi();

  // Load existing demografi if id_pos changes
  const activeIdPos = propIdPos || selectedIdPos;

  useEffect(() => {
    if (activeIdPos) {
      const fetchExistingData = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from('t_demografi_pelkat')
          .select('*')
          .eq('id_pos', activeIdPos);

        if (data && data.length > 0) {
          const updatedRows: Record<PelkatKode, { laki: number; perempuan: number; jml_kk: number }> = {
            PA: { laki: 0, perempuan: 0, jml_kk: 0 },
            PT: { laki: 0, perempuan: 0, jml_kk: 0 },
            GP: { laki: 0, perempuan: 0, jml_kk: 0 },
            PKP: { laki: 0, perempuan: 0, jml_kk: 0 },
            PKB: { laki: 0, perempuan: 0, jml_kk: 0 },
            PKLU: { laki: 0, perempuan: 0, jml_kk: 0 },
          };

          data.forEach((row) => {
            const kode = row.kategori_pelkat as PelkatKode;
            if (updatedRows[kode]) {
              updatedRows[kode] = {
                laki: row.laki || 0,
                perempuan: row.perempuan || 0,
                jml_kk: row.jml_kk || 0,
              };
            }
          });
          setPelkatRows(updatedRows);

          // Populasikan profesi, pendidikan, keterangan dari baris pertama yang ada
          const first = data[0];
          setProfesi(first.profesi || '');
          setPendidikan(first.pendidikan || '');
          setKeterangan(first.keterangan || '');
        } else {
          // Reset ke 0 jika tidak ada data tersimpan sebelumnya
          setPelkatRows({
            PA: { laki: 0, perempuan: 0, jml_kk: 0 },
            PT: { laki: 0, perempuan: 0, jml_kk: 0 },
            GP: { laki: 0, perempuan: 0, jml_kk: 0 },
            PKP: { laki: 0, perempuan: 0, jml_kk: 0 },
            PKB: { laki: 0, perempuan: 0, jml_kk: 0 },
            PKLU: { laki: 0, perempuan: 0, jml_kk: 0 },
          });
          setProfesi('');
          setPendidikan('');
          setKeterangan('');
        }
      };
      fetchExistingData();
    }
  }, [activeIdPos]);

  const handleRowChange = (kode: PelkatKode, field: 'laki' | 'perempuan' | 'jml_kk', val: number) => {
    setPelkatRows((prev) => ({
      ...prev,
      [kode]: {
        ...prev[kode],
        [field]: isNaN(val) ? 0 : val,
      },
    }));
  };

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      let finalPosId = activeIdPos;

      // Jika Jemaat Induk dipilih (tanpa Pos Pelkes), cari Pos utama/placeholder milik id_induk tersebut
      if (targetScope === 'jemaat' && hierarchyMeta?.id_induk) {
        const supabase = createClient();
        const { data: posRows } = await supabase
          .from('m_pos_pelkes')
          .select('id_pos')
          .eq('id_induk', hierarchyMeta.id_induk)
          .limit(1);

        if (posRows && posRows[0]) {
          finalPosId = posRows[0].id_pos;
        }
      }

      if (!finalPosId || finalPosId.trim() === '') {
        throw new Error('Silakan lengkapi pemilihan Wilayah Pelayanan terlebih dahulu.');
      }

      // Format teks input tambahan dengan smart auto-capitalization
      const formattedProfesi = profesi ? formatPastoralKegiatanText(profesi) : '';
      const formattedPendidikan = pendidikan ? formatPastoralKegiatanText(pendidikan) : '';
      const formattedKeterangan = keterangan ? formatPastoralKegiatanText(keterangan) : '';

      // Susun payload untuk ke-6 Kategori Pelkat
      const payloads = Object.entries(pelkatRows).map(([kode, row]) => ({
        id_pos: finalPosId,
        kategori_pelkat: kode as PelkatKode,
        jml_kk: row.jml_kk,
        laki: row.laki,
        perempuan: row.perempuan,
        profesi: formattedProfesi,
        pendidikan: formattedPendidikan,
        keterangan: formattedKeterangan,
      }));

      await batchUpsertMutation.mutateAsync(payloads);

      // Haptic feedback for mobile devices
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }

      setSuccessMsg('Seluruh data demografi 6 Pelkat berhasil disimpan!');
      if (onSuccess) {
        // Kirim record gabungan pertama sebagai representasi ke callback
        onSuccess(
          {
            id_pos: finalPosId,
            laki: Object.values(pelkatRows).reduce((sum, r) => sum + r.laki, 0),
            perempuan: Object.values(pelkatRows).reduce((sum, r) => sum + r.perempuan, 0),
            jml_kk: Object.values(pelkatRows).reduce((sum, r) => sum + r.jml_kk, 0),
            profesi: formattedProfesi,
            pendidikan: formattedPendidikan,
            keterangan: formattedKeterangan,
          },
          hierarchyMeta
        );
      }
    } catch (error: any) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
      setErrorMsg(error.message || 'Gagal menyimpan data demografi.');
    }
  };

  // Hitung akumulasi total seluruh Pelkat
  const totalLaki = Object.values(pelkatRows).reduce((sum, r) => sum + r.laki, 0);
  const totalPerempuan = Object.values(pelkatRows).reduce((sum, r) => sum + r.perempuan, 0);
  const totalJiwaOverall = totalLaki + totalPerempuan;
  const totalKkOverall = Object.values(pelkatRows).reduce((sum, r) => sum + r.jml_kk, 0);

  return (
    <form onSubmit={handleSubmitAll} className="space-y-4 text-left">
      {/* 1. Selector Target Scope (Jemaat Induk vs Pos Pelkes) */}
      {!propIdPos && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Target Lingkup Pendataan *</label>
          <div className="grid grid-cols-2 gap-2 bg-surface-sunken p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTargetScope('jemaat')}
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
      )}

      {/* 2. Pos Cascading Selector (dengan required sesuai scope) */}
      {!propIdPos && (
        <div className="space-y-1.5 w-full">
          <PosCascadingSelector
            value={selectedIdPos}
            onChange={(val) => setSelectedIdPos(val)}
            onMetaChange={(meta) => setHierarchyMeta(meta)}
            disabled={batchUpsertMutation.isPending}
            required={targetScope === 'pos'} // Hanya required jika target lingkup adalah Pos Pelkes
          />
        </div>
      )}

      {/* Success/Error alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-medium">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3. 6 Pelkat Rows Grid Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-high flex items-center justify-between">
          <span>Rincian Data 6 Pelkat GPIB *</span>
          <span className="text-[10px] text-text-muted font-normal">Input Jumlah Laki, Perempuan & KK</span>
        </label>
        
        <div className="border border-border-subtle rounded-2xl overflow-hidden bg-surface-base">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[340px]">
              <thead>
                <tr className="bg-surface-sunken/80 border-b border-border-subtle text-text-high font-bold">
                  <th className="p-3">Pelkat</th>
                  <th className="p-3 w-20 text-center">Laki</th>
                  <th className="p-3 w-20 text-center">Perempuan</th>
                  <th className="p-3 w-20 text-center">Jml KK</th>
                  <th className="p-3 w-16 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {KATEGORI_PELKAT.map((pelkat) => {
                  const kode = pelkat.kode as PelkatKode;
                  const row = pelkatRows[kode] || { laki: 0, perempuan: 0, jml_kk: 0 };
                  const totalRow = Number(row.laki) + Number(row.perempuan);

                  return (
                    <tr key={pelkat.kode} className="border-b border-border-subtle/50 hover:bg-surface-sunken/40">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl shrink-0">{pelkat.icon}</span>
                          <div>
                            <p className="font-bold text-text-high leading-tight">{pelkat.nama}</p>
                            <p className="text-[10px] text-text-muted leading-tight">{pelkat.kode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={0}
                          value={row.laki || ''}
                          onChange={(e) => handleRowChange(kode, 'laki', Number(e.target.value))}
                          placeholder="0"
                          className="w-full min-h-[38px] px-2 text-center rounded-lg border border-border-subtle bg-surface-elevated text-sm font-bold text-text-high tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={0}
                          value={row.perempuan || ''}
                          onChange={(e) => handleRowChange(kode, 'perempuan', Number(e.target.value))}
                          placeholder="0"
                          className="w-full min-h-[38px] px-2 text-center rounded-lg border border-border-subtle bg-surface-elevated text-sm font-bold text-text-high tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={0}
                          value={row.jml_kk || ''}
                          onChange={(e) => handleRowChange(kode, 'jml_kk', Number(e.target.value))}
                          placeholder="0"
                          className="w-full min-h-[38px] px-2 text-center rounded-lg border border-border-subtle bg-surface-elevated text-sm text-text-high tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                      </td>
                      <td className="p-3 text-center font-bold text-brand-primary tabular-nums">
                        {totalRow}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Calculated Sum Summary Box */}
      <div className="p-3.5 rounded-xl bg-surface-sunken border border-border-subtle grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs">
        <div>
          <p className="text-text-muted font-medium">Total KK</p>
          <p className="text-lg font-bold text-text-high mt-0.5 tabular-nums">{totalKkOverall}</p>
        </div>
        <div>
          <p className="text-text-muted font-medium">Laki + Perempuan</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5 tabular-nums">
            {totalLaki} L / {totalPerempuan} P
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-border-subtle pt-2 sm:pt-0">
          <p className="text-text-muted font-medium">Total Jiwa Terhitung</p>
          <p className="text-lg font-extrabold text-brand-primary mt-0.5 tabular-nums">{totalJiwaOverall} Jiwa</p>
        </div>
      </div>

      {/* 5. Additional Fields (Profesi & Pendidikan dengan masking) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Dominasi Profesi (Opsional)</label>
          <input
            type="text"
            placeholder="Misal: Petani, PNS, Wiraswasta"
            value={profesi}
            onChange={(e) => setProfesi(e.target.value)}
            onBlur={(e) => setProfesi(formatPastoralKegiatanText(e.target.value))}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-high">Tingkat Pendidikan (Opsional)</label>
          <input
            type="text"
            placeholder="Misal: SMA, Sarjana"
            value={pendidikan}
            onChange={(e) => setPendidikan(e.target.value)}
            onBlur={(e) => setPendidikan(formatPastoralKegiatanText(e.target.value))}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* 6. Keterangan */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high">Catatan Tambahan / Keterangan</label>
        <textarea
          rows={2}
          placeholder="Catatan khusus mengenai kategori pelkat ini..."
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          onBlur={(e) => setKeterangan(formatPastoralKegiatanText(e.target.value))}
          className="w-full p-3 rounded-xl border border-border-subtle bg-surface-elevated text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={batchUpsertMutation.isPending}
        className="w-full min-h-[48px] bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primary-dark active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-soft mt-3"
      >
        {batchUpsertMutation.isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Menyimpan Seluruh Data...</span>
          </>
        ) : (
          <span>Simpan Data Demografi</span>
        )}
      </button>
    </form>
  );
}
