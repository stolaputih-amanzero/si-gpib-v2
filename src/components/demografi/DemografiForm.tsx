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

  // Active ID Pos (propIdPos or selectedIdPos)
  const activeIdPos = propIdPos || selectedIdPos;

  useEffect(() => {
    if (propIdPos) {
      setSelectedIdPos(propIdPos);
    }
  }, [propIdPos]);

  // Load existing demografi if id_pos changes
  useEffect(() => {
    if (activeIdPos) {
      const fetchExistingData = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from('t_demografi_pelkat')
          .select('*, pos:m_pos_pelkes(nama_pos, kategori)')
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

          // Poka-Yoke: Check target scope of existing pos pelkes
          const posKategori = first.pos?.kategori || '';
          const posNama = first.pos?.nama_pos || '';
          if (posKategori === 'Pos Pelkes' && !posNama.toLowerCase().startsWith('jemaat ')) {
            setTargetScope('pos');
          } else {
            setTargetScope('jemaat');
          }
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

      // Jika Jemaat Induk dipilih dan belum ada posId
      if (!finalPosId && targetScope === 'jemaat') {
        const jemaatId = hierarchyMeta?.id_induk;
        if (!jemaatId) {
          throw new Error('Silakan pilih Wilayah Mupel & Jemaat Induk terlebih dahulu.');
        }

        const supabase = createClient();
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

      if (!finalPosId || finalPosId.trim() === '') {
        throw new Error(
          targetScope === 'pos'
            ? 'Silakan pilih Wilayah Pos Pelkes / Bajem terlebih dahulu.'
            : 'Silakan pilih Wilayah Mupel & Jemaat Induk terlebih dahulu.'
        );
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

      {/* 2. Pos Cascading Selector (dengan required sesuai scope & reverse lookup) */}
      <div className="space-y-1.5 w-full">
        <PosCascadingSelector
          value={activeIdPos}
          defaultPosId={propIdPos}
          onChange={(val) => setSelectedIdPos(val)}
          onMetaChange={(meta) => setHierarchyMeta(meta)}
          disabled={batchUpsertMutation.isPending}
          required={targetScope === 'pos'}
          hidePos={targetScope === 'jemaat'}
        />
      </div>

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
          className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-bold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
        />
      </div>

      {/* 4. Batch 6-Pelkat Input Grid */}
      <div className="space-y-3 pt-1 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-text-high uppercase tracking-wider">
            Rincian Jumlah Jiwa per Pelkat *
          </label>
          <span className="text-[11px] text-text-muted">6 Pelkat GPIB</span>
        </div>

        {/* Desktop View Table */}
        <div className="hidden sm:block border border-border-subtle rounded-2xl overflow-hidden bg-surface-base">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-sunken/80 border-b border-border-subtle text-text-high font-bold">
                <th className="p-3">Pelkat</th>
                <th className="p-3 text-blue-600 dark:text-blue-400">Laki-Laki</th>
                <th className="p-3 text-pink-600 dark:text-pink-400">Perempuan</th>
                <th className="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {KATEGORI_PELKAT.map((pelkat) => {
                const kode = pelkat.kode as PelkatKode;
                const row = pelkatRows[kode];
                const rowTotal = row.laki + row.perempuan;
                const isPkp = kode === 'PKP';
                const isPkb = kode === 'PKB';

                return (
                  <tr key={kode} className="border-b border-border-subtle/40 hover:bg-surface-sunken/40">
                    <td className="p-3 font-semibold text-text-high">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{pelkat.icon}</span>
                        <div>
                          <p className="font-bold">{pelkat.nama}</p>
                          <p className="text-[10px] text-text-muted font-normal">({kode})</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={0}
                        disabled={isPkp}
                        value={isPkp ? 0 : row.laki || ''}
                        onChange={(e) => handleRowChange(kode, 'laki', Number(e.target.value))}
                        placeholder={isPkp ? '-' : '0'}
                        className={`w-24 px-2.5 py-1.5 rounded-lg border border-border-subtle text-xs font-bold focus:ring-2 focus:ring-blue-500 min-h-[36px] ${
                          isPkp ? 'bg-surface-sunken opacity-60 cursor-not-allowed text-text-muted' : 'bg-surface-base text-blue-700 dark:text-blue-300'
                        }`}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={0}
                        disabled={isPkb}
                        value={isPkb ? 0 : row.perempuan || ''}
                        onChange={(e) => handleRowChange(kode, 'perempuan', Number(e.target.value))}
                        placeholder={isPkb ? '-' : '0'}
                        className={`w-24 px-2.5 py-1.5 rounded-lg border border-border-subtle text-xs font-bold focus:ring-2 focus:ring-pink-500 min-h-[36px] ${
                          isPkb ? 'bg-surface-sunken opacity-60 cursor-not-allowed text-text-muted' : 'bg-surface-base text-pink-700 dark:text-pink-300'
                        }`}
                      />
                    </td>
                    <td className="p-3 text-right font-extrabold text-brand-primary tabular-nums">
                      {rowTotal} <span className="text-[10px] font-normal text-text-muted">Jiwa</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View Responsive Cards */}
        <div className="sm:hidden space-y-2.5">
          {KATEGORI_PELKAT.map((pelkat) => {
            const kode = pelkat.kode as PelkatKode;
            const row = pelkatRows[kode];
            const isPkp = kode === 'PKP';
            const isPkb = kode === 'PKB';

            return (
              <div key={kode} className="bg-surface-base p-3 rounded-2xl border border-border-subtle/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{pelkat.icon}</span>
                    <span className="font-bold text-xs text-text-high">{pelkat.nama} ({kode})</span>
                  </div>
                  <span className="text-xs font-extrabold text-brand-primary tabular-nums">
                    {row.laki + row.perempuan} Jiwa
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 block mb-1">Laki-Laki</label>
                    <input
                      type="number"
                      min={0}
                      disabled={isPkp}
                      value={isPkp ? 0 : row.laki || ''}
                      onChange={(e) => handleRowChange(kode, 'laki', Number(e.target.value))}
                      placeholder={isPkp ? '-' : '0'}
                      className={`w-full px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs font-bold focus:ring-2 focus:ring-blue-500 min-h-[40px] ${
                        isPkp ? 'bg-surface-sunken opacity-60 cursor-not-allowed text-text-muted' : 'bg-surface-base text-blue-700 dark:text-blue-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 block mb-1">Perempuan</label>
                    <input
                      type="number"
                      min={0}
                      disabled={isPkb}
                      value={isPkb ? 0 : row.perempuan || ''}
                      onChange={(e) => handleRowChange(kode, 'perempuan', Number(e.target.value))}
                      placeholder={isPkb ? '-' : '0'}
                      className={`w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900/50 text-xs font-bold focus:ring-2 focus:ring-pink-500 min-h-[40px] ${
                        isPkb ? 'bg-surface-sunken opacity-60 cursor-not-allowed text-text-muted' : 'bg-surface-base text-pink-700 dark:text-pink-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Summary Card (Laki-Laki Blue, Perempuan Pink) */}
        <div className="bg-surface-sunken p-3.5 rounded-2xl border border-border-subtle flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-text-high">Total Jiwa Terhitung:</span>
            <div className="flex items-center gap-3 mt-0.5 font-bold tabular-nums text-[11px]">
              <span className="text-blue-600 dark:text-blue-400">{totalLaki} Laki-Laki</span>
              <span className="text-text-muted">•</span>
              <span className="text-pink-600 dark:text-pink-400">{totalPerempuan} Perempuan</span>
            </div>
          </div>
          <span className="text-xl font-serif font-bold text-brand-primary tabular-nums">
            {totalJiwaOverall} <span className="text-xs font-normal text-text-muted">Jiwa</span>
          </span>
        </div>
      </div>

      {/* 5. Additional Fields (Profesi, Pendidikan, Keterangan) */}
      <div className="space-y-3 pt-1 border-t border-border-subtle">
        <label className="text-xs font-bold text-text-high uppercase tracking-wider">
          Informasi Tambahan (Profesi & Pendidikan)
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-high">Dominasi Profesi Jemaat</label>
            <input
              type="text"
              value={profesi}
              onChange={(e) => setProfesi(e.target.value)}
              onBlur={(e) => setProfesi(formatPastoralKegiatanText(e.target.value))}
              placeholder="Contoh: Wiraswasta, Pegawai Negeri, PNS, Petani..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:ring-2 focus:ring-brand-primary min-h-[44px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-high">Tingkat Pendidikan Dominan</label>
            <input
              type="text"
              value={pendidikan}
              onChange={(e) => setPendidikan(e.target.value)}
              onBlur={(e) => setPendidikan(formatPastoralKegiatanText(e.target.value))}
              placeholder="Contoh: SMA, Sarjana (S1), Diploma (D3)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:ring-2 focus:ring-brand-primary min-h-[44px]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-text-high">Catatan / Keterangan Tambahan</label>
          <textarea
            rows={2}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            onBlur={(e) => setKeterangan(formatPastoralKegiatanText(e.target.value))}
            placeholder="Catatan tambahan kondisi demografi..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:ring-2 focus:ring-brand-primary resize-none"
          />
        </div>
      </div>

      {/* 6. Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={batchUpsertMutation.isPending}
          className="w-full py-3 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-dark active:scale-[0.98] transition-all shadow-soft flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-60"
        >
          {batchUpsertMutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Menyimpan Seluruh Demografi Pelkat...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>{propIdPos ? 'Simpan Perubahan Demografi' : 'Simpan Seluruh Demografi 6 Pelkat'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
