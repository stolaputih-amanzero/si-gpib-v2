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

  // Standalone Jumlah KK
  const [jmlKk, setJmlKk] = useState<number>(0);

  // 6 Pelkat Rows state (Laki & Perempuan)
  const [pelkatRows, setPelkatRows] = useState<Record<PelkatKode, { laki: number; perempuan: number }>>({
    PA: { laki: 0, perempuan: 0 },
    PT: { laki: 0, perempuan: 0 },
    GP: { laki: 0, perempuan: 0 },
    PKP: { laki: 0, perempuan: 0 }, // PKP: Laki-Laki selalu 0
    PKB: { laki: 0, perempuan: 0 }, // PKB: Perempuan selalu 0
    PKLU: { laki: 0, perempuan: 0 },
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
          const updatedRows: Record<PelkatKode, { laki: number; perempuan: number }> = {
            PA: { laki: 0, perempuan: 0 },
            PT: { laki: 0, perempuan: 0 },
            GP: { laki: 0, perempuan: 0 },
            PKP: { laki: 0, perempuan: 0 },
            PKB: { laki: 0, perempuan: 0 },
            PKLU: { laki: 0, perempuan: 0 },
          };

          let totalKkFound = 0;
          data.forEach((row) => {
            const kode = row.kategori_pelkat as PelkatKode;
            if (updatedRows[kode]) {
              updatedRows[kode] = {
                laki: kode === 'PKP' ? 0 : (row.laki || 0), // Poka-Yoke: Enforce 0 for PKP male
                perempuan: kode === 'PKB' ? 0 : (row.perempuan || 0), // Poka-Yoke: Enforce 0 for PKB female
              };
            }
            if (row.jml_kk && row.jml_kk > 0) {
              totalKkFound += row.jml_kk;
            }
          });
          setPelkatRows(updatedRows);
          setJmlKk(totalKkFound);

          // Populasikan profesi, pendidikan, keterangan dari baris pertama yang ada
          const first = data[0];
          setProfesi(first.profesi || '');
          setPendidikan(first.pendidikan || '');
          setKeterangan(first.keterangan || '');
        } else {
          // Reset ke 0 jika tidak ada data tersimpan sebelumnya
          setPelkatRows({
            PA: { laki: 0, perempuan: 0 },
            PT: { laki: 0, perempuan: 0 },
            GP: { laki: 0, perempuan: 0 },
            PKP: { laki: 0, perempuan: 0 },
            PKB: { laki: 0, perempuan: 0 },
            PKLU: { laki: 0, perempuan: 0 },
          });
          setJmlKk(0);
          setProfesi('');
          setPendidikan('');
          setKeterangan('');
        }
      };
      fetchExistingData();
    }
  }, [activeIdPos]);

  const handleRowChange = (kode: PelkatKode, field: 'laki' | 'perempuan', val: number) => {
    // Poka-Yoke Enforcement
    if (kode === 'PKP' && field === 'laki') return;
    if (kode === 'PKB' && field === 'perempuan') return;

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

      // Susun payload untuk ke-6 Kategori Pelkat (dengan aturan Poka-Yoke PKP & PKB)
      const payloads = Object.entries(pelkatRows).map(([kodeKey, row], index) => {
        const kode = kodeKey as PelkatKode;
        return {
          id_pos: finalPosId,
          kategori_pelkat: kode,
          jml_kk: index === 0 ? jmlKk : 0, // KK disimpan pada baris utama (PA)
          laki: kode === 'PKP' ? 0 : row.laki,
          perempuan: kode === 'PKB' ? 0 : row.perempuan,
          profesi: formattedProfesi,
          pendidikan: formattedPendidikan,
          keterangan: formattedKeterangan,
        };
      });

      await batchUpsertMutation.mutateAsync(payloads);

      // Haptic feedback for mobile devices
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }

      setSuccessMsg('Seluruh data demografi 6 Pelkat berhasil disimpan!');
      if (onSuccess) {
        onSuccess(
          {
            id_pos: finalPosId,
            laki: Object.values(pelkatRows).reduce((sum, r) => sum + r.laki, 0),
            perempuan: Object.values(pelkatRows).reduce((sum, r) => sum + r.perempuan, 0),
            jml_kk: jmlKk,
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
            required={targetScope === 'pos'}
            hidePos={targetScope === 'jemaat'}
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

      {/* 3. Standalone Jumlah KK (Tersendiri) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-high flex items-center justify-between">
          <span>Jumlah KK (Kepala Keluarga) *</span>
          <span className="text-[10px] text-text-muted font-normal">Total KK Wilayah Pelayanan</span>
        </label>
        <input
          type="number"
          min={0}
          value={jmlKk || ''}
          onChange={(e) => setJmlKk(Number(e.target.value))}
          placeholder="0"
          className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-base font-bold text-text-high tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {/* 4. 6 Pelkat Rows Input Header */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-text-high flex items-center justify-between">
          <span>Rincian Jiwa 6 Pelkat GPIB *</span>
          <span className="text-[10px] text-text-muted font-normal">Input Jumlah Laki-Laki & Perempuan</span>
        </label>

        {/* MOBILE VIEW: Card Layout (Setiap Pelkat dalam Card lega dengan Poka-Yoke Disabled state) */}
        <div className="space-y-2.5 sm:hidden">
          {KATEGORI_PELKAT.map((pelkat) => {
            const kode = pelkat.kode as PelkatKode;
            const row = pelkatRows[kode] || { laki: 0, perempuan: 0 };

            const isPkp = kode === 'PKP'; // PKP: Male disabled
            const isPkb = kode === 'PKB'; // PKB: Female disabled
            const totalRow = (isPkp ? 0 : Number(row.laki)) + (isPkb ? 0 : Number(row.perempuan));

            return (
              <div key={pelkat.kode} className="bg-surface-base border border-border-subtle/80 p-3.5 rounded-2xl space-y-2.5 shadow-soft">
                {/* Header Pelkat */}
                <div className="flex items-center justify-between border-b border-border-subtle/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{pelkat.icon}</span>
                    <div>
                      <h4 className="font-bold text-text-high text-xs">{pelkat.nama}</h4>
                      <p className="text-[10px] text-text-muted">{pelkat.kode}</p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-surface-sunken border border-border-subtle/60 text-right">
                    <span className="text-[10px] text-text-muted block font-medium">Subtotal</span>
                    <span className="text-xs font-extrabold text-brand-primary tabular-nums">{totalRow} Jiwa</span>
                  </div>
                </div>

                {/* Input Laki & Perempuan on next row (2-column layout dengan Poka-Yoke disabled) */}
                <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                  <div className="space-y-1">
                    <label className={`text-[11px] font-semibold ${isPkp ? 'text-text-muted' : 'text-blue-600 dark:text-blue-400'}`}>
                      {isPkp ? 'Laki-Laki (🔒 N/A - PKP)' : 'Laki-Laki'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      disabled={isPkp}
                      value={isPkp ? 0 : (row.laki || '')}
                      onChange={(e) => handleRowChange(kode, 'laki', Number(e.target.value))}
                      placeholder={isPkp ? '0' : '0'}
                      className={`w-full min-h-[44px] px-3 text-center rounded-xl border text-sm font-bold tabular-nums focus:outline-none ${
                        isPkp
                          ? 'bg-surface-sunken border-border-subtle text-text-muted opacity-60 cursor-not-allowed'
                          : 'border-blue-200 dark:border-blue-900 bg-surface-elevated text-text-high focus:ring-2 focus:ring-blue-500'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[11px] font-semibold ${isPkb ? 'text-text-muted' : 'text-pink-600 dark:text-pink-400'}`}>
                      {isPkb ? 'Perempuan (🔒 N/A - PKB)' : 'Perempuan'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      disabled={isPkb}
                      value={isPkb ? 0 : (row.perempuan || '')}
                      onChange={(e) => handleRowChange(kode, 'perempuan', Number(e.target.value))}
                      placeholder={isPkb ? '0' : '0'}
                      className={`w-full min-h-[44px] px-3 text-center rounded-xl border text-sm font-bold tabular-nums focus:outline-none ${
                        isPkb
                          ? 'bg-surface-sunken border-border-subtle text-text-muted opacity-60 cursor-not-allowed'
                          : 'border-pink-200 dark:border-pink-900 bg-surface-elevated text-text-high focus:ring-2 focus:ring-pink-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP VIEW: Clean Table Layout dengan Poka-Yoke disabled */}
        <div className="hidden sm:block border border-border-subtle rounded-2xl overflow-hidden bg-surface-base">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-sunken/80 border-b border-border-subtle text-text-high font-bold">
                <th className="p-3">Pelkat</th>
                <th className="p-3 w-32 text-center">Laki-Laki</th>
                <th className="p-3 w-32 text-center">Perempuan</th>
                <th className="p-3 w-24 text-center">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {KATEGORI_PELKAT.map((pelkat) => {
                const kode = pelkat.kode as PelkatKode;
                const row = pelkatRows[kode] || { laki: 0, perempuan: 0 };

                const isPkp = kode === 'PKP'; // PKP: Male disabled
                const isPkb = kode === 'PKB'; // PKB: Female disabled
                const totalRow = (isPkp ? 0 : Number(row.laki)) + (isPkb ? 0 : Number(row.perempuan));

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
                        disabled={isPkp}
                        value={isPkp ? 0 : (row.laki || '')}
                        onChange={(e) => handleRowChange(kode, 'laki', Number(e.target.value))}
                        placeholder={isPkp ? '0' : '0'}
                        className={`w-full min-h-[40px] px-2 text-center rounded-lg border text-sm font-bold tabular-nums focus:outline-none ${
                          isPkp
                            ? 'bg-surface-sunken border-border-subtle text-text-muted opacity-60 cursor-not-allowed'
                            : 'border-blue-200 dark:border-blue-900 bg-surface-elevated text-text-high focus:ring-2 focus:ring-blue-500'
                        }`}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        disabled={isPkb}
                        value={isPkb ? 0 : (row.perempuan || '')}
                        onChange={(e) => handleRowChange(kode, 'perempuan', Number(e.target.value))}
                        placeholder={isPkb ? '0' : '0'}
                        className={`w-full min-h-[40px] px-2 text-center rounded-lg border text-sm font-bold tabular-nums focus:outline-none ${
                          isPkb
                            ? 'bg-surface-sunken border-border-subtle text-text-muted opacity-60 cursor-not-allowed'
                            : 'border-pink-200 dark:border-pink-900 bg-surface-elevated text-text-high focus:ring-2 focus:ring-pink-500'
                        }`}
                      />
                    </td>
                    <td className="p-3 text-center font-bold text-brand-primary tabular-nums">
                      {totalRow} Jiwa
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Calculated Summary Box */}
      <div className="p-3.5 rounded-xl bg-surface-sunken border border-border-subtle grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs">
        <div>
          <p className="text-text-muted font-medium">Total KK Input</p>
          <p className="text-lg font-bold text-text-high mt-0.5 tabular-nums">{jmlKk} KK</p>
        </div>
        <div>
          <p className="text-text-muted font-medium">Laki + Perempuan</p>
          <p className="text-lg font-bold mt-0.5 tabular-nums flex items-center justify-center gap-1">
            <span className="text-blue-600 dark:text-blue-400">{totalLaki} L</span>
            <span className="text-text-muted font-normal">/</span>
            <span className="text-pink-600 dark:text-pink-400">{totalPerempuan} P</span>
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-border-subtle pt-2 sm:pt-0">
          <p className="text-text-muted font-medium">Total Jiwa Terhitung</p>
          <p className="text-lg font-extrabold text-brand-primary mt-0.5 tabular-nums">{totalJiwaOverall} Jiwa</p>
        </div>
      </div>

      {/* 6. Additional Fields (Profesi & Pendidikan dengan masking) */}
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

      {/* 7. Keterangan */}
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
