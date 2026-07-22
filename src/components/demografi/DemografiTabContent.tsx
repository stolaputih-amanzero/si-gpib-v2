'use client';

import { useState, useEffect } from 'react';
import { useDemografiByPos } from '@/hooks/use-demografi';
import { DemografiForm } from '@/components/demografi/DemografiForm';
import { DemografiChart } from '@/components/demografi/DemografiChart';
import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';
import { Plus, Edit2, Check, Share2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { shareToWhatsApp } from '@/lib/share/share-to-whatsapp';

interface DemografiTabContentProps {
  id_pos: string;
  canWrite?: boolean;
}

export function DemografiTabContent({ id_pos, canWrite = true }: DemografiTabContentProps) {
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  const [posMetadata, setPosMetadata] = useState<{ nama_pos?: string; kategori?: string; nama_induk?: string; nama_mupel?: string; latitude?: number | null; longitude?: number | null } | null>(null);

  const { data: demografiData, isLoading } = useDemografiByPos(id_pos);
  const supabase = createClient();

  useEffect(() => {
    const fetchPosInfo = async () => {
      if (!id_pos) return;
      const { data: posData } = await supabase
        .from('m_pos_pelkes')
        .select(`
          nama_pos,
          kategori,
          latitude,
          longitude,
          jemaat_induk:m_jemaat_induk(
            nama_induk,
            mupel:m_mupel(nama_mupel)
          )
        `)
        .eq('id_pos', id_pos)
        .maybeSingle();

      if (posData) {
        setPosMetadata({
          nama_pos: posData.nama_pos,
          kategori: posData.kategori,
          nama_induk: (posData.jemaat_induk as any)?.nama_induk || '-',
          nama_mupel: (posData.jemaat_induk as any)?.mupel?.nama_mupel || '-',
          latitude: posData.latitude,
          longitude: posData.longitude,
        });
      }
    };

    fetchPosInfo();
  }, [id_pos, supabase]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userMeta = user.user_metadata || {};
        const { data: userRow } = await supabase
          .from('users')
          .select('nama_lengkap, nama, email, no_telepon')
          .eq('id', user.id)
          .maybeSingle();

        const displayUser =
          userRow?.nama_lengkap ||
          (userRow as any)?.nama ||
          userMeta.nama_lengkap ||
          userMeta.full_name ||
          userMeta.name ||
          userRow?.email ||
          user.email ||
          'Pengguna System';

        setCurrentUserEmail(displayUser);
      }
    };
    fetchCurrentUser();
  }, [supabase]);

  const handleAddNew = (kode?: string) => {
    setEditingItem(kode ? { id_pos, kategori_pelkat: kode } : { id_pos });
    setShowFormModal(true);
  };

  // Aggregate stats
  let totalJiwa = 0;
  let totalKk = 0;
  let totalLaki = 0;
  let totalPerempuan = 0;

  const chartData = KATEGORI_PELKAT.map((k) => {
    const found = demografiData?.find((d: any) => d.kategori_pelkat === k.kode);
    const laki = found ? found.laki || 0 : 0;
    const perempuan = found ? found.perempuan || 0 : 0;
    const sum = laki + perempuan;

    totalJiwa += sum;
    totalKk += found ? found.jml_kk || 0 : 0;
    totalLaki += laki;
    totalPerempuan += perempuan;

    return {
      kategori_pelkat: k.kode,
      laki,
      perempuan,
    };
  });

  // Extract summary info (profesi, pendidikan, keterangan, updated_at, updated_by, hierarchy) from recorded data
  const firstRecord: any = demografiData && demografiData.length > 0 ? demografiData[0] : null;
  const posObj = firstRecord?.pos;
  const posName = posMetadata?.nama_pos || posObj?.nama_pos || id_pos;
  const jemaatName = posMetadata?.nama_induk || posObj?.jemaat_induk?.nama_induk || '-';
  const mupelName = posMetadata?.nama_mupel || posObj?.jemaat_induk?.mupel?.nama_mupel || '-';
  const lat = posMetadata?.latitude ?? posObj?.latitude ?? posObj?.jemaat_induk?.latitude ?? null;
  const lng = posMetadata?.longitude ?? posObj?.longitude ?? posObj?.jemaat_induk?.longitude ?? null;
  const posKategori = posMetadata?.kategori || posObj?.kategori || '';
  const isBajem = posKategori.toLowerCase().includes('bajem') || posName.toLowerCase().includes('bajem');
  const posLabelHeader = isBajem ? 'Bajem' : 'Pos Pelkes';

  const summaryProfesi = demografiData?.find((d: any) => d.profesi)?.profesi;
  const summaryPendidikan = demografiData?.find((d: any) => d.pendidikan)?.pendidikan;
  const summaryKeterangan = demografiData?.find((d: any) => d.keterangan)?.keterangan;
  const latestUpdatedAt = firstRecord?.updated_at || firstRecord?.created_at;
  const latestUpdatedBy = firstRecord?.updated_by || currentUserEmail || 'Pengguna System';

  const handleShareWhatsApp = async () => {
    let mapsUrl = '';
    if (lat && lng) {
      mapsUrl = `google.com/maps?q=${lat},${lng}`;
    } else {
      const locName = posName && posName !== '-' 
        ? `GPIB ${posName}` 
        : `GPIB ${jemaatName}`;
      mapsUrl = `google.com/maps/search/?api=1&query=${encodeURIComponent(locName)}`;
    }

    let tglFormatted = '-';
    if (latestUpdatedAt) {
      try {
        const d = new Date(latestUpdatedAt);
        tglFormatted = d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) + ' WIB';
      } catch {
        tglFormatted = latestUpdatedAt;
      }
    }

    const formattedPosTitle = `*${(posName || '').toUpperCase()}* (${posLabelHeader})`;
    const formattedSubHierarchy = `_${jemaatName} - ${mupelName}_`;

    const lines = [
      formattedPosTitle,
      formattedSubHierarchy,
      ``,
      `*RINGKASAN DEMOGRAFI*`,
      `- Total Kepala Keluarga (KK): ${totalKk} KK`,
      `- Total Jiwa (L+P): ${totalJiwa} Jiwa (${totalLaki} L | ${totalPerempuan} P)`,
      ``,
      `*RINCIAN 6 KATEGORI PELKAT*`,
    ];

    KATEGORI_PELKAT.forEach((p, idx) => {
      const rec = demografiData?.find((d: any) => d.kategori_pelkat === p.kode) || { laki: 0, perempuan: 0 };
      const totalRow = (rec.laki || 0) + (rec.perempuan || 0);
      const lakiTxt = p.kode === 'PKP' ? '-' : `${rec.laki || 0} L`;
      const prTxt = p.kode === 'PKB' ? '-' : `${rec.perempuan || 0} P`;
      lines.push(`${idx + 1}. ${p.kode}: ${lakiTxt} | ${prTxt} | Total: ${totalRow} Jiwa`);
    });

    lines.push(
      ``,
      `*KETERANGAN TAMBAHAN*`,
      `- Dominasi Profesi: ${summaryProfesi || '-'}`,
      `- Tingkat Pendidikan: ${summaryPendidikan || '-'}`,
      `- Catatan: ${summaryKeterangan || '-'}`,
      ``,
      `*LOKASI & GOOGLE MAPS*`,
      `Peta Lokasi Google Maps:`,
      mapsUrl,
      ``,
      `Tanggal Update: ${tglFormatted}`,
      `Diperbarui Oleh: ${latestUpdatedBy}`,
    );

    await shareToWhatsApp({
      title: 'LAPORAN DEMOGRAFI PELKAT GPIB',
      text: lines.join('\n'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-border-subtle">
        <div>
          <h2 className="text-base font-extrabold text-text-high">
            Statistik Demografi Pos Pelkes
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Analisis data kuantitatif 6 Pelkat GPIB & Distribusi Jiwa/KK
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm min-h-[40px]"
            title="Bagikan Laporan Demografi ke WhatsApp"
          >
            <Share2 size={15} />
            <span>Share WA</span>
          </button>

          {canWrite && (
            <div>
              {demografiData && demografiData.length > 0 ? (
                <button
                  type="button"
                  onClick={() => handleAddNew()}
                  className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[40px]"
                >
                  <Edit2 size={15} />
                  <span>Edit Demografi</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddNew()}
                  className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[40px]"
                >
                  <Plus size={15} />
                  <span>Tambah Data</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-elevated p-3.5 rounded-xl border border-border-subtle shadow-soft">
          <p className="text-xs text-text-muted">Total Jiwa</p>
          <p className="text-2xl font-bold text-brand-primary tabular-nums mt-0.5">{totalJiwa}</p>
        </div>
        <div className="bg-surface-elevated p-3.5 rounded-xl border border-border-subtle shadow-soft">
          <p className="text-xs text-text-muted">Total KK</p>
          <p className="text-2xl font-bold text-text-high tabular-nums mt-0.5">{totalKk}</p>
        </div>
        <div className="bg-surface-elevated p-3.5 rounded-xl border border-border-subtle shadow-soft">
          <p className="text-xs text-blue-600 dark:text-blue-400">Laki-Laki</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-0.5">{totalLaki}</p>
        </div>
        <div className="bg-surface-elevated p-3.5 rounded-xl border border-border-subtle shadow-soft">
          <p className="text-xs text-pink-600 dark:text-pink-400">Perempuan</p>
          <p className="text-2xl font-bold text-pink-600 dark:text-pink-400 tabular-nums mt-0.5">{totalPerempuan}</p>
        </div>
      </div>

      {/* General Demografi Metadata (Profesi, Pendidikan, Keterangan) */}
      {(summaryProfesi || summaryPendidikan || summaryKeterangan) && (
        <div className="bg-surface-sunken/60 p-4 rounded-xl border border-border-subtle text-xs space-y-2">
          <h4 className="font-bold text-text-high text-xs uppercase tracking-wider text-brand-primary">
            Informasi Umum Demografi Wilayah
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {summaryProfesi && (
              <div className="bg-surface-elevated p-2.5 rounded-lg border border-border-subtle/60">
                <span className="text-[10px] text-text-muted font-bold block uppercase">Pekerjaan / Profesi Utama:</span>
                <span className="font-semibold text-text-high mt-0.5 block">{summaryProfesi}</span>
              </div>
            )}
            {summaryPendidikan && (
              <div className="bg-surface-elevated p-2.5 rounded-lg border border-border-subtle/60">
                <span className="text-[10px] text-text-muted font-bold block uppercase">Tingkat Pendidikan Terbanyak:</span>
                <span className="font-semibold text-text-high mt-0.5 block">{summaryPendidikan}</span>
              </div>
            )}
          </div>
          {summaryKeterangan && (
            <div className="bg-surface-elevated p-2.5 rounded-lg border border-border-subtle/60 italic text-text-muted">
              <span className="text-[10px] font-bold block not-italic uppercase text-text-muted">Catatan Demografi:</span>
              "{summaryKeterangan}"
            </div>
          )}
        </div>
      )}

      {/* Demografi Chart */}
      <div className="bg-surface-elevated p-4 md:p-6 rounded-xl border border-border-subtle shadow-soft space-y-3">
        <h3 className="text-sm font-bold text-text-high">Grafik Demografi Pos Pelkes</h3>
        <DemografiChart data={chartData} />
      </div>

      {/* 6 Pelkat Category Single Card Container */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-text-high">Status 6 Pelkat Standar GPIB</h3>
            <p className="text-xs text-text-muted mt-0.5">
              {isLoading ? 'Memuat...' : demografiData ? `${demografiData.length} dari 6 Pelkat Terisi` : '0 dari 6 Pelkat Terisi'}
            </p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface-sunken p-3.5 rounded-xl animate-pulse space-y-2">
                  <div className="h-4 bg-surface-base rounded w-1/2"></div>
                  <div className="h-8 bg-surface-base rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {KATEGORI_PELKAT.map((pelkat) => {
                const record = demografiData?.find((d: any) => d.kategori_pelkat === pelkat.kode);
                const total = record ? (record.laki || 0) + (record.perempuan || 0) : 0;

                return (
                  <div 
                    key={pelkat.kode}
                    className={`p-3.5 rounded-xl border transition-all ${
                      record 
                        ? 'bg-surface-sunken/50 border-border-subtle/80' 
                        : 'bg-surface-sunken/20 border-dashed border-gray-300 dark:border-gray-700 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{pelkat.icon}</span>
                        <div>
                          <h4 className="font-bold text-text-high text-xs">{pelkat.nama}</h4>
                          <p className="text-[10px] text-text-muted">{pelkat.kode} • {pelkat.deskripsi}</p>
                        </div>
                      </div>

                      {record ? (
                        <span className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                          <Check size={13} />
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-muted italic bg-surface-sunken px-2 py-0.5 rounded">Belum Ada</span>
                      )}
                    </div>

                    {record && (
                      <div className="mt-2.5 pt-2 border-t border-border-subtle/50 space-y-1.5">
                        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                          <div className="bg-surface-elevated p-1 rounded-md border border-border-subtle/40">
                            <span className="text-text-muted block text-[9px] font-bold">KK</span>
                            <span className="font-bold tabular-nums text-text-high">{record.jml_kk || 0}</span>
                          </div>
                          <div className="bg-blue-50/70 dark:bg-blue-950/40 p-1 rounded-md text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                            <span className="block text-[9px] font-bold">Laki</span>
                            <span className="font-bold tabular-nums">{record.laki || 0}</span>
                          </div>
                          <div className="bg-pink-50/70 dark:bg-pink-950/40 p-1 rounded-md text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-900/30">
                            <span className="block text-[9px] font-bold">Pr</span>
                            <span className="font-bold tabular-nums">{record.perempuan || 0}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-semibold text-brand-primary pt-0.5">
                          <span>Total: {total} Jiwa</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal / Drawer */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 border border-border-subtle shadow-float max-h-[90vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-base font-bold text-brand-primary">
                {editingItem?.kategori_pelkat || (demografiData && demografiData.length > 0)
                  ? 'Edit Demografi Pelkat'
                  : 'Input Demografi Pelkat Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high"
              >
                ✕
              </button>
            </div>

            <DemografiForm 
              id_pos={id_pos} 
              initialData={editingItem} 
              onSuccess={() => {
                setShowFormModal(false);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
