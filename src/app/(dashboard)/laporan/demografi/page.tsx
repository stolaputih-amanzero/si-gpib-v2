'use client';

import { useState, useEffect } from 'react';
import { useDemografiList } from '@/hooks/use-demografi';
import { DemografiCard } from '@/components/demografi/DemografiCard';
import { DemografiChart } from '@/components/demografi/DemografiChart';
import { DemografiForm } from '@/components/demografi/DemografiForm';
import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';
import { Plus, Filter, Users, Search, X, MapPin, Building, Layers, Clock, UserCheck, Share2, Edit3, Compass, ExternalLink } from 'lucide-react';
import { HierarchyMetaInfo } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { createClient } from '@/lib/supabase/client';
import { shareToWhatsApp } from '@/lib/share/share-to-whatsapp';

interface DemografiDetailItem {
  id_pos: string;
  total_kk: number;
  total_laki: number;
  total_perempuan: number;
  total_jiwa: number;
  profesi?: string | null;
  pendidikan?: string | null;
  keterangan?: string | null;
  posName?: string;
  jemaatName?: string;
  mupelName?: string;
  latitude?: number | null;
  longitude?: number | null;
  alamat?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  pelkatRecords: Record<string, { laki: number; perempuan: number; jml_kk: number }>;
}

interface GroupedDemografiEntity {
  id_pos: string;
  nama_pos: string;
  jemaat_induk?: string;
  mupel?: string;
  latitude?: number | null;
  longitude?: number | null;
  alamat?: string | null;
  total_kk: number;
  total_laki: number;
  total_perempuan: number;
  total_jiwa: number;
  updated_at?: string | null;
  updated_by?: string | null;
  filledPelkatCodes: string[];
  missingPelkatCodes: string[];
  pelkatRecords: Record<string, { laki: number; perempuan: number; jml_kk: number; profesi?: string; pendidikan?: string; keterangan?: string }>;
}

function formatDateTimeIndonesian(dateString?: string | null) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';
  } catch (e) {
    return dateString;
  }
}

export default function LaporanDemografiPage() {
  const [selectedPelkat, setSelectedPelkat] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [formEditIdPos, setFormEditIdPos] = useState<string | undefined>(undefined);
  const [activeDetailModal, setActiveDetailModal] = useState<DemografiDetailItem | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  const supabase = createClient();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userMeta = user.user_metadata || {};
        const { data: userRow } = await supabase
          .from('users')
          .select('email, no_telepon')
          .eq('id', user.id)
          .maybeSingle();

        const displayUser =
          userRow?.email ||
          user.email ||
          userMeta.full_name ||
          userMeta.name ||
          userRow?.no_telepon ||
          user.phone ||
          'Pengguna System';

        setCurrentUserEmail(displayUser);
      }
    };
    fetchCurrentUser();
  }, [supabase]);

  const { data: demografiList, isLoading } = useDemografiList({
    kategori_pelkat: selectedPelkat || undefined,
  });

  const filteredList = demografiList?.filter((item: any) => {
    if (!searchQuery.trim()) return true;
    const posName = item.pos?.nama_pos || '';
    const jemaatName = item.pos?.jemaat_induk?.nama_induk || '';
    return (
      posName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jemaatName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate Overall Totals
  let totalJiwaOverall = 0;
  let totalLakiOverall = 0;
  let totalPerempuanOverall = 0;
  let totalKkOverall = 0;

  const chartDataMap: Record<string, { laki: number; perempuan: number }> = {};
  KATEGORI_PELKAT.forEach((k) => {
    chartDataMap[k.kode] = { laki: 0, perempuan: 0 };
  });

  // Grouping Demografi List by Entity (id_pos)
  const groupedEntitiesMap: Record<string, GroupedDemografiEntity> = {};

  filteredList?.forEach((item: any) => {
    const sum = (item.laki || 0) + (item.perempuan || 0);
    totalJiwaOverall += sum;
    totalLakiOverall += item.laki || 0;
    totalPerempuanOverall += item.perempuan || 0;
    totalKkOverall += item.jml_kk || 0;

    if (chartDataMap[item.kategori_pelkat]) {
      chartDataMap[item.kategori_pelkat].laki += item.laki || 0;
      chartDataMap[item.kategori_pelkat].perempuan += item.perempuan || 0;
    }

    const idPos = item.id_pos;
    const posName = item.pos?.nama_pos || item.id_pos;
    const jemaatName = item.pos?.jemaat_induk?.nama_induk || '-';
    const mupelName = item.pos?.jemaat_induk?.mupel?.nama_mupel || '-';
    const lat = item.pos?.latitude || item.pos?.jemaat_induk?.latitude || null;
    const lng = item.pos?.longitude || item.pos?.jemaat_induk?.longitude || null;
    const alamatStr = item.pos?.alamat || item.pos?.jemaat_induk?.alamat || null;

    if (!groupedEntitiesMap[idPos]) {
      groupedEntitiesMap[idPos] = {
        id_pos: idPos,
        nama_pos: posName,
        jemaat_induk: jemaatName,
        mupel: mupelName,
        latitude: lat,
        longitude: lng,
        alamat: alamatStr,
        total_kk: 0,
        total_laki: 0,
        total_perempuan: 0,
        total_jiwa: 0,
        updated_at: item.updated_at || item.created_at,
        updated_by: item.updated_by,
        filledPelkatCodes: [],
        missingPelkatCodes: [],
        pelkatRecords: {},
      };
    }

    const entity = groupedEntitiesMap[idPos];

    // Pick latest updated_at & updated_by
    if (item.updated_at && (!entity.updated_at || new Date(item.updated_at) > new Date(entity.updated_at))) {
      entity.updated_at = item.updated_at;
      if (item.updated_by) entity.updated_by = item.updated_by;
    }

    const laki = item.laki || 0;
    const perempuan = item.perempuan || 0;
    const sumJiwa = laki + perempuan;

    entity.total_laki += laki;
    entity.total_perempuan += perempuan;
    entity.total_jiwa += sumJiwa;
    if (item.jml_kk && item.jml_kk > entity.total_kk) {
      entity.total_kk = item.jml_kk;
    }

    if (sumJiwa > 0 || item.jml_kk > 0) {
      if (!entity.filledPelkatCodes.includes(item.kategori_pelkat)) {
        entity.filledPelkatCodes.push(item.kategori_pelkat);
      }
    }

    entity.pelkatRecords[item.kategori_pelkat] = {
      laki,
      perempuan,
      jml_kk: item.jml_kk || 0,
      profesi: item.profesi,
      pendidikan: item.pendidikan,
      keterangan: item.keterangan,
    };
  });

  const ALL_PELKAT_CODES = ['PA', 'PT', 'GP', 'PKP', 'PKB', 'PKLU'];
  const groupedList = Object.values(groupedEntitiesMap).map((entity) => {
    const missing = ALL_PELKAT_CODES.filter((c) => !entity.filledPelkatCodes.includes(c));
    return {
      ...entity,
      missingPelkatCodes: missing,
    };
  });

  const chartData = Object.entries(chartDataMap).map(([kategori_pelkat, values]) => ({
    kategori_pelkat,
    laki: values.laki,
    perempuan: values.perempuan,
  }));

  const handleOpenDetailFromGroupedEntity = (entity: GroupedDemografiEntity) => {
    const rawPosName = entity.nama_pos || '';
    const jemaatNama = entity.jemaat_induk || '-';
    
    // Poka-Yoke check if Pos Pelkes is a direct Jemaat Induk scope
    const isDirectJemaat =
      rawPosName.toLowerCase().startsWith('jemaat ') ||
      rawPosName.toLowerCase() === jemaatNama.toLowerCase() ||
      rawPosName === 'Pelayanan Jemaat Direct';

    let profesiVal = '';
    let pendidikanVal = '';
    let keteranganVal = '';

    Object.values(entity.pelkatRecords).forEach((rec: any) => {
      if (rec.profesi && !profesiVal) profesiVal = rec.profesi;
      if (rec.pendidikan && !pendidikanVal) pendidikanVal = rec.pendidikan;
      if (rec.keterangan && !keteranganVal) keteranganVal = rec.keterangan;
    });

    setActiveDetailModal({
      id_pos: entity.id_pos,
      total_kk: entity.total_kk,
      total_laki: entity.total_laki,
      total_perempuan: entity.total_perempuan,
      total_jiwa: entity.total_jiwa,
      profesi: profesiVal,
      pendidikan: pendidikanVal,
      keterangan: keteranganVal,
      posName: isDirectJemaat ? '-' : rawPosName,
      jemaatName: jemaatNama,
      mupelName: entity.mupel || '-',
      latitude: entity.latitude,
      longitude: entity.longitude,
      alamat: entity.alamat,
      updated_at: entity.updated_at,
      updated_by: entity.updated_by || currentUserEmail || 'Pengguna System',
      pelkatRecords: entity.pelkatRecords,
    });
  };

  const handleOpenNewForm = () => {
    setFormEditIdPos(undefined);
    setShowFormModal(true);
  };

  const handleEditFromDetail = (detail: DemografiDetailItem) => {
    setFormEditIdPos(detail.id_pos);
    setActiveDetailModal(null);
    setShowFormModal(true);
  };

  const handleFormSuccess = (savedData: any, _metaInfo?: HierarchyMetaInfo | null) => {
    setShowFormModal(false);
    
    // Auto-open detail modal for saved entity
    const entity = groupedEntitiesMap[savedData.id_pos];
    if (entity) {
      handleOpenDetailFromGroupedEntity(entity);
    }
  };

  const handleShareWhatsApp = async (detail: DemografiDetailItem) => {
    const tglFormatted = formatDateTimeIndonesian(detail.updated_at);
    const updatedUser = detail.updated_by || currentUserEmail || 'Pengguna System';

    // Construct Google Maps URL (Clean URL without https:// protocol to suppress WhatsApp thumbnail card)
    let mapsUrl = '';
    if (detail.latitude && detail.longitude) {
      mapsUrl = `google.com/maps?q=${detail.latitude},${detail.longitude}`;
    } else {
      const locName = detail.posName && detail.posName !== '-' 
        ? `GPIB ${detail.posName}` 
        : `GPIB ${detail.jemaatName}`;
      mapsUrl = `google.com/maps/search/?api=1&query=${encodeURIComponent(locName)}`;
    }

    const lines = [
      `Mupel: ${detail.mupelName || '-'}`,
      `Jemaat Induk: ${detail.jemaatName || '-'}`,
      `Pos Pelkes/Bajem: ${detail.posName || '-'}`,
      `Tanggal Update: ${tglFormatted}`,
      `Diperbarui Oleh: ${updatedUser}`,
      ``,
      `*RINGKASAN DEMOGRAFI*`,
      `- Total Kepala Keluarga (KK): ${detail.total_kk} KK`,
      `- Total Jiwa (L+P): ${detail.total_jiwa} Jiwa (${detail.total_laki} L | ${detail.total_perempuan} P)`,
      ``,
      `*RINCIAN 6 KATEGORI PELKAT*`,
    ];

    KATEGORI_PELKAT.forEach((p, idx) => {
      const rec = detail.pelkatRecords[p.kode] || { laki: 0, perempuan: 0 };
      const totalRow = (rec.laki || 0) + (rec.perempuan || 0);
      const lakiTxt = p.kode === 'PKP' ? '-' : `${rec.laki || 0} L`;
      const prTxt = p.kode === 'PKB' ? '-' : `${rec.perempuan || 0} P`;
      lines.push(`${idx + 1}. ${p.kode}: ${lakiTxt} | ${prTxt} | Total: ${totalRow} Jiwa`);
    });

    lines.push(
      ``,
      `*KETERANGAN TAMBAHAN*`,
      `- Dominasi Profesi: ${detail.profesi || '-'}`,
      `- Tingkat Pendidikan: ${detail.pendidikan || '-'}`,
      `- Catatan: ${detail.keterangan || '-'}`,
      ``,
      `*LOKASI & GOOGLE MAPS*`,
      `Peta Lokasi Google Maps:`,
      mapsUrl,
    );

    if (detail.alamat) {
      lines.push(`Alamat Wilayah: ${detail.alamat}`);
    }

    await shareToWhatsApp({
      title: 'LAPORAN DEMOGRAFI PELKAT GPIB',
      text: lines.join('\n'),
    });
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">Demografi Pelkat</h1>
          <p className="text-xs md:text-sm text-text-muted mt-0.5">Pendataan Jemaat per Kategori Pelayanan GPIB</p>
        </div>
        <button
          type="button"
          onClick={handleOpenNewForm}
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-dark transition-all flex items-center gap-2 shadow-soft min-h-[44px] shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Input Data Demografi</span>
          <span className="sm:hidden">Input</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-text-muted font-medium">Total Jiwa</p>
          <p className="text-2xl font-serif font-bold text-brand-primary tabular-nums mt-1">{totalJiwaOverall}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Di seluruh Pos Pelkes</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-text-muted font-medium">Total KK</p>
          <p className="text-2xl font-serif font-bold text-text-high tabular-nums mt-1">{totalKkOverall}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Kepala Keluarga</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Laki-Laki</p>
          <p className="text-2xl font-serif font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-1">{totalLakiOverall}</p>
          <p className="text-[11px] text-text-muted mt-0.5">{totalJiwaOverall > 0 ? `${((totalLakiOverall/totalJiwaOverall)*100).toFixed(1)}%` : '0%'}</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">Perempuan</p>
          <p className="text-2xl font-serif font-bold text-pink-600 dark:text-pink-400 tabular-nums mt-1">{totalPerempuanOverall}</p>
          <p className="text-[11px] text-text-muted mt-0.5">{totalJiwaOverall > 0 ? `${((totalPerempuanOverall/totalJiwaOverall)*100).toFixed(1)}%` : '0%'}</p>
        </div>
      </div>

      {/* Chart Overview */}
      <div className="bg-surface-elevated p-4 md:p-6 rounded-2xl border border-border-subtle shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-high">Distribusi Jiwa per Pelkat</h2>
          <span className="text-xs text-text-muted">6 Pelkat Standar GPIB</span>
        </div>
        <DemografiChart data={chartData} />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-high uppercase tracking-wider">
          <Filter size={14} />
          <span>Filter Data Demografi</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Cari nama Pos Pelkes atau Jemaat Induk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
            />
          </div>

          <select
            value={selectedPelkat}
            onChange={(e) => setSelectedPelkat(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-medium text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
          >
            <option value="">Semua Kategori Pelkat</option>
            {KATEGORI_PELKAT.map((k) => (
              <option key={k.kode} value={k.kode}>
                {k.icon} {k.nama} ({k.kode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data List (Grouped Entity Summary Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-high">Daftar Wilayah Pendataan Demografi</h2>
          <span className="text-xs text-text-muted">
            {groupedList ? `${groupedList.length} Wilayah` : 'Memuat...'}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl p-4 animate-pulse space-y-3 border border-border-subtle">
                <div className="h-4 bg-surface-sunken rounded w-3/4"></div>
                <div className="h-3 bg-surface-sunken rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : groupedList && groupedList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupedList.map((item) => (
              <DemografiCard
                key={item.id_pos}
                id_pos={item.id_pos}
                nama_pos={item.nama_pos}
                jemaat_induk={item.jemaat_induk}
                mupel={item.mupel}
                total_kk={item.total_kk}
                total_laki={item.total_laki}
                total_perempuan={item.total_perempuan}
                total_jiwa={item.total_jiwa}
                updated_at={item.updated_at}
                filledPelkatCodes={item.filledPelkatCodes}
                missingPelkatCodes={item.missingPelkatCodes}
                onClick={() => handleOpenDetailFromGroupedEntity(item)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface-elevated rounded-2xl p-8 text-center border border-border-subtle space-y-2">
            <Users size={36} className="mx-auto text-text-muted opacity-50" />
            <p className="font-semibold text-text-high text-sm">Belum Ada Data Demografi</p>
            <p className="text-xs text-text-muted">
              {searchQuery || selectedPelkat 
                ? 'Tidak ada data demografi yang sesuai dengan filter.' 
                : 'Klik tombol "+ Input Data Demografi" di atas untuk mulai menambahkan data.'}
            </p>
          </div>
        )}
      </div>

      {/* Input Demografi Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                  <Users size={18} />
                  <span>{formEditIdPos ? 'Edit Data Demografi Pelkat' : 'Input Demografi Pelkat Baru'}</span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Pilih Wilayah Jemaat Induk, Pos Pelkes (Opsional) & Pelkat
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            <DemografiForm 
              id_pos={formEditIdPos}
              onSuccess={handleFormSuccess} 
            />
          </div>
        </div>
      )}

      {/* Detail Demografi Modal (Multi-Pelkat Breakdown) */}
      {activeDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                  <Users size={18} />
                  <span>Detail Demografi Pelkat</span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Wilayah: <strong className="text-text-high font-semibold">{activeDetailModal.jemaatName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailModal(null)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-left">
              {/* 3-Level Hierarchy Breakdown */}
              <div className="bg-surface-base p-3.5 rounded-2xl border border-border-subtle/80 space-y-2 text-xs">
                {activeDetailModal.mupelName && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted flex items-center gap-1.5 font-medium">
                      <Layers size={14} className="text-purple-500" /> Mupel:
                    </span>
                    <span className="font-bold text-text-high">
                      {activeDetailModal.mupelName}
                    </span>
                  </div>
                )}

                {activeDetailModal.jemaatName && (
                  <div className="flex items-center justify-between border-t border-border-subtle/40 pt-2">
                    <span className="text-text-muted flex items-center gap-1.5 font-medium">
                      <Building size={14} className="text-blue-500" /> Jemaat Induk:
                    </span>
                    <span className="font-bold text-text-high">
                      {activeDetailModal.jemaatName}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border-subtle/40 pt-2">
                  <span className="text-text-muted flex items-center gap-1.5 font-medium">
                    <MapPin size={14} className="text-brand-primary" /> Pos Pelkes / Bajem:
                  </span>
                  <span className="font-bold text-text-high">
                    {activeDetailModal.posName || '-'}
                  </span>
                </div>

                {/* Direct Clickable Google Maps Link */}
                {activeDetailModal.latitude && activeDetailModal.longitude ? (
                  <div className="flex items-center justify-between border-t border-border-subtle/40 pt-2 text-[11px]">
                    <span className="text-text-muted flex items-center gap-1.5 font-medium">
                      <Compass size={14} className="text-emerald-500" /> Google Maps:
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${activeDetailModal.latitude},${activeDetailModal.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-brand-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <span>{activeDetailModal.latitude.toFixed(5)}, {activeDetailModal.longitude.toFixed(5)}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border-t border-border-subtle/40 pt-2 text-[11px]">
                    <span className="text-text-muted flex items-center gap-1.5 font-medium">
                      <Compass size={14} className="text-emerald-500" /> Google Maps:
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        activeDetailModal.posName && activeDetailModal.posName !== '-'
                          ? `GPIB ${activeDetailModal.posName}`
                          : `GPIB ${activeDetailModal.jemaatName}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-primary hover:underline flex items-center gap-1"
                    >
                      <span>Buka di Maps</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* Summary KPI Totals */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="bg-surface-sunken p-2.5 rounded-xl border border-border-subtle/60">
                  <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Total KK</p>
                  <p className="text-base font-extrabold text-text-high tabular-nums mt-0.5">{activeDetailModal.total_kk} KK</p>
                </div>
                <div className="bg-blue-50/70 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">Laki-Laki</p>
                  <p className="text-base font-extrabold text-blue-700 dark:text-blue-300 tabular-nums mt-0.5">{activeDetailModal.total_laki} L</p>
                </div>
                <div className="bg-pink-50/70 dark:bg-pink-950/40 p-2.5 rounded-xl border border-pink-100 dark:border-pink-900/40">
                  <p className="text-[10px] text-pink-600 dark:text-pink-400 font-medium uppercase tracking-wider">Perempuan</p>
                  <p className="text-base font-extrabold text-pink-700 dark:text-pink-300 tabular-nums mt-0.5">{activeDetailModal.total_perempuan} P</p>
                </div>
              </div>

              {/* 6 Pelkat Breakdown Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-text-high flex items-center gap-1.5">
                  <Users size={14} className="text-brand-primary" />
                  Rincian 6 Kategori Pelkat GPIB
                </h3>

                <div className="border border-border-subtle rounded-2xl overflow-hidden bg-surface-base">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-surface-sunken/80 border-b border-border-subtle text-text-high font-bold">
                        <th className="p-2.5">Pelkat</th>
                        <th className="p-2.5 text-center">Laki</th>
                        <th className="p-2.5 text-center">Perempuan</th>
                        <th className="p-2.5 text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {KATEGORI_PELKAT.map((pelkat) => {
                        const rec = activeDetailModal.pelkatRecords[pelkat.kode] || { laki: 0, perempuan: 0 };
                        const sumRow = (rec.laki || 0) + (rec.perempuan || 0);

                        return (
                          <tr key={pelkat.kode} className="border-b border-border-subtle/40 hover:bg-surface-sunken/40">
                            <td className="p-2.5 font-medium flex items-center gap-2">
                              <span className="text-base">{pelkat.icon}</span>
                              <span className="font-extrabold text-text-high text-xs tracking-wide">{pelkat.kode}</span>
                            </td>
                            <td className="p-2.5 text-center font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                              {pelkat.kode === 'PKP' ? '-' : rec.laki || 0}
                            </td>
                            <td className="p-2.5 text-center font-bold text-pink-600 dark:text-pink-400 tabular-nums">
                              {pelkat.kode === 'PKB' ? '-' : rec.perempuan || 0}
                            </td>
                            <td className="p-2.5 text-center font-extrabold text-brand-primary tabular-nums">
                              {sumRow} Jiwa
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Profesi & Pendidikan */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-surface-base p-3 rounded-xl border border-border-subtle/60">
                <div>
                  <p className="text-text-muted font-medium">Dominasi Profesi:</p>
                  <p className="font-semibold text-text-high mt-0.5">{activeDetailModal.profesi || '-'}</p>
                </div>
                <div>
                  <p className="text-text-muted font-medium">Tingkat Pendidikan:</p>
                  <p className="font-semibold text-text-high mt-0.5">{activeDetailModal.pendidikan || '-'}</p>
                </div>
              </div>

              {/* Keterangan */}
              {activeDetailModal.keterangan ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-high">Catatan / Keterangan:</label>
                  <p className="text-xs text-text-high italic bg-surface-sunken/60 p-3 rounded-xl border border-border-subtle/60 leading-relaxed whitespace-pre-line">
                    "{activeDetailModal.keterangan}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-text-muted italic">Tidak ada catatan tambahan.</p>
              )}

              {/* Audit Metadata: Tanggal Terakhir Diperbarui & User Peng-Update */}
              <div className="space-y-1.5 p-3 rounded-xl bg-surface-sunken/60 border border-border-subtle/50 text-xs">
                <div className="flex items-center justify-between text-text-muted">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock size={14} className="text-brand-primary shrink-0" />
                    Terakhir Diperbarui:
                  </span>
                  <span className="font-semibold text-text-high tabular-nums">
                    {formatDateTimeIndonesian(activeDetailModal.updated_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-text-muted border-t border-border-subtle/30 pt-1.5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <UserCheck size={14} className="text-emerald-500 shrink-0" />
                    Diperbarui Oleh:
                  </span>
                  <span className="font-bold text-text-high font-mono text-[11px]">
                    {activeDetailModal.updated_by || currentUserEmail || 'Pengguna System'}
                  </span>
                </div>
              </div>

              {/* Action Buttons (Clean Text Style - Matching Log Pastoral) */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-border-subtle text-xs">
                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(activeDetailModal)}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 min-h-[44px] px-1"
                  title="Bagikan Laporan Demografi ke WhatsApp"
                >
                  <Share2 size={16} />
                  <span>Share WA</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEditFromDetail(activeDetailModal)}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 min-h-[44px] px-1"
                  title="Edit Data Demografi"
                >
                  <Edit3 size={16} />
                  <span>Edit Data</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDetailModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-border-subtle font-bold text-text-high hover:bg-surface-sunken transition-all min-h-[44px]"
                >
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
