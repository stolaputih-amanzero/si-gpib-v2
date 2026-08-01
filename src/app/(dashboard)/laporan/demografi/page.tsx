'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemografiList, useDeleteDemografiByPos } from '@/hooks/use-demografi';
import { DemografiChart } from '@/components/demografi/DemografiChart';
import { DemografiForm } from '@/components/demografi/DemografiForm';
import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';
import {
  Plus,
  Users,
  Search,
  X,
  MapPin,
  Building,
  Layers,
  Share2,
  Edit3,
  Trash2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { shareToWhatsApp } from '@/lib/share/share-to-whatsapp';
import { ListRow } from '@/components/list/ListRow';
import { FilterChips } from '@/components/list/FilterChips';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { Badge } from '@/components/ui/badge';
import { PosName } from '@/components/ui/PosName';

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
  pelkatRecords: Record<
    string,
    {
      laki: number;
      perempuan: number;
      jml_kk: number;
      profesi?: string;
      pendidikan?: string;
      keterangan?: string;
    }
  >;
}

function formatDateTimeIndonesian(dateString?: string | null) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';

    return (
      d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    );
  } catch {
    return dateString;
  }
}

export default function LaporanDemografiPage() {
  const router = useRouter();
  const [selectedPelkat, setSelectedPelkat] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [formEditIdPos, setFormEditIdPos] = useState<string | undefined>(undefined);
  const [activeDetailModal, setActiveDetailModal] = useState<DemografiDetailItem | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  const supabase = createClient();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const userMeta = user.user_metadata || {};
        const { data: userRow } = await supabase
          .from('users')
          .select('email, no_telepon')
          .eq('id', user.id)
          .maybeSingle();

        const displayUser =
          userMeta.nama_lengkap ||
          userMeta.full_name ||
          userMeta.name ||
          userRow?.email ||
          userRow?.no_telepon ||
          user.email ||
          'Pengguna System';

        setCurrentUserEmail(displayUser);
      }
    };
    fetchCurrentUser();
  }, [supabase]);

  const { data: demografiList, isLoading, refetch } = useDemografiList({
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

  const deleteByPosMutation = useDeleteDemografiByPos();

  const handleEditFromDetail = (detail: DemografiDetailItem) => {
    setFormEditIdPos(detail.id_pos);
    setActiveDetailModal(null);
    setShowFormModal(true);
  };

  const handleDeleteFromDetail = async (detail: DemografiDetailItem) => {
    const posLabel = detail.posName || detail.id_pos;
    if (confirm(`Apakah Anda yakin ingin menghapus seluruh data demografi untuk ${posLabel}?`)) {
      try {
        await deleteByPosMutation.mutateAsync(detail.id_pos);
        setActiveDetailModal(null);
        refetch();
      } catch (err: any) {
        alert('Gagal menghapus data demografi: ' + (err.message || 'Terjadi kesalahan'));
      }
    }
  };

  const handleFormSuccess = async (savedData: any) => {
    setShowFormModal(false);
    if (savedData?.id_pos) {
      router.push(`/demografi/${savedData.id_pos}`);
    } else {
      refetch();
    }
  };

  const handleShareWhatsApp = async (detail: DemografiDetailItem) => {
    const tglFormatted = formatDateTimeIndonesian(detail.updated_at);
    const updatedUser = detail.updated_by || currentUserEmail || 'Pengguna System';

    let mapsUrl = '';
    if (detail.latitude && detail.longitude) {
      mapsUrl = `google.com/maps?q=${detail.latitude},${detail.longitude}`;
    } else {
      const locName =
        detail.posName && detail.posName !== '-'
          ? `GPIB ${detail.posName}`
          : `GPIB ${detail.jemaatName}`;
      mapsUrl = `google.com/maps/search/?api=1&query=${encodeURIComponent(locName)}`;
    }

    const isBajem = (detail.posName || '').toLowerCase().includes('bajem');
    const posLabelHeader = isBajem ? 'Bajem' : 'Pos Pelkes';
    const formattedPosTitle = `*${(detail.posName || '-').toUpperCase()}* (${posLabelHeader})`;
    const formattedSubHierarchy = `_${detail.jemaatName || '-'} - ${detail.mupelName || '-'}_`;

    const lines = [
      formattedPosTitle,
      formattedSubHierarchy,
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
      ``,
      `Tanggal Update: ${tglFormatted}`,
      `Diperbarui Oleh: ${updatedUser}`
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
    <div className="w-full space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-primary tracking-tight">
            Demografi Pelkat
          </h1>
          <p className="text-xs text-ink-tertiary mt-0.5">
            Pendataan Jemaat per Kategori Pelayanan GPIB
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenNewForm}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-xs min-h-[44px] shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Input Data Demografi</span>
          <span className="sm:hidden">Input</span>
        </button>
      </div>

      {/* Summary Metrics Strip */}
      <SummaryStrip
        metrics={[
          { label: 'Total Jiwa', value: totalJiwaOverall, icon: <Users size={16} /> },
          { label: 'Total KK', value: totalKkOverall },
          { label: 'Laki-Laki', value: totalLakiOverall },
          { label: 'Perempuan', value: totalPerempuanOverall },
        ]}
        className="hairline-b bg-surface-1/40 rounded-xl py-2 px-3"
      />

      {/* Chart Overview */}
      <div className="bg-surface-1 p-4 md:p-6 rounded-2xl border border-border-subtle shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-primary">Distribusi Jiwa per Pelkat</h2>
          <span className="text-xs text-ink-tertiary">6 Pelkat Standar GPIB</span>
        </div>
        <DemografiChart data={chartData} />
      </div>

      {/* Search Input Bar */}
      <div className="relative bg-surface-1 p-3 rounded-2xl border border-border-subtle shadow-xs">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-ink-tertiary" />
        <input
          type="text"
          placeholder="Cari nama Pos Pelkes atau Jemaat Induk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      {/* Filter Chips Pelkat */}
      <FilterChips
        items={[
          { key: '', label: 'Semua Pelkat' },
          ...KATEGORI_PELKAT.map((k) => ({
            key: k.kode,
            label: `${k.icon} ${k.nama} (${k.kode})`,
          })),
        ]}
        active={selectedPelkat}
        onChange={(key) => setSelectedPelkat(key)}
        className="px-0 py-1"
      />

      {/* Data List (Grouped Entity ListRows) */}
      <div className="pt-1">
        {isLoading ? (
          <ListSkeleton count={6} />
        ) : groupedList && groupedList.length > 0 ? (
          <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden">
            {groupedList.map((item) => {
              const posNameDisplay = item.nama_pos ? (
                <PosName name={item.nama_pos} />
              ) : (
                item.id_pos
              );

              return (
                <ListRow
                  key={item.id_pos}
                  icon={<Users className="h-5 w-5" />}
                  iconVariant="brand"
                  title={posNameDisplay}
                  subtitle={
                    <span>
                      {item.jemaat_induk || 'Jemaat Induk'} {item.mupel ? `· Mupel ${item.mupel}` : ''}
                    </span>
                  }
                  meta={
                    <span>
                      {item.total_kk} KK · {item.total_jiwa} Jiwa ({item.total_laki} L | {item.total_perempuan} P)
                    </span>
                  }
                  badge={
                    <Badge variant="brand" className="text-[10px] py-0 px-2">
                      {item.filledPelkatCodes.length}/6 Pelkat
                    </Badge>
                  }
                  onClick={() => handleOpenDetailFromGroupedEntity(item)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="Belum Ada Data Demografi"
            description="Tidak ada data demografi yang sesuai dengan filter pencarian Anda."
            action={{
              label: 'Input Data Demografi',
              onClick: handleOpenNewForm,
              variant: 'primary',
            }}
          />
        )}
      </div>

      {/* Input Demografi Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-1 w-full sm:max-w-2xl md:max-w-3xl rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 border border-border-subtle shadow-lg max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-600 flex items-center gap-2">
                  <Users size={18} />
                  <span>{formEditIdPos ? 'Edit Data Demografi Pelkat' : 'Input Demografi Pelkat Baru'}</span>
                </h2>
                <p className="text-xs text-ink-tertiary mt-0.5">
                  Pilih Wilayah Jemaat Induk, Pos Pelkes & Pelkat
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-ink-tertiary hover:text-ink-primary min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            <DemografiForm id_pos={formEditIdPos} onSuccess={handleFormSuccess} />
          </div>
        </div>
      )}

      {/* Detail Demografi Modal */}
      {activeDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-1 w-full sm:max-w-2xl md:max-w-3xl rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 border border-border-subtle shadow-lg max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-600 flex items-center gap-2">
                  <Users size={18} />
                  <span>Detail Demografi Pelkat</span>
                </h2>
                <p className="text-xs text-ink-tertiary mt-0.5">
                  Wilayah: <strong className="text-ink-primary font-semibold">{activeDetailModal.jemaatName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailModal(null)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-ink-tertiary hover:text-ink-primary min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-left">
              {/* 3-Level Hierarchy Breakdown */}
              <div className="bg-surface-base p-3.5 rounded-2xl border border-border-subtle/80 space-y-2 text-xs">
                {activeDetailModal.mupelName && (
                  <div className="flex items-center justify-between">
                    <span className="text-ink-tertiary flex items-center gap-1.5 font-medium">
                      <Layers size={14} className="text-purple-500" /> Mupel:
                    </span>
                    <span className="font-bold text-ink-primary">
                      {activeDetailModal.mupelName}
                    </span>
                  </div>
                )}

                {activeDetailModal.jemaatName && (
                  <div className="flex items-center justify-between border-t border-border-subtle/40 pt-2">
                    <span className="text-ink-tertiary flex items-center gap-1.5 font-medium">
                      <Building size={14} className="text-blue-500" /> Jemaat Induk:
                    </span>
                    <span className="font-bold text-ink-primary">
                      {activeDetailModal.jemaatName}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border-subtle/40 pt-2">
                  <span className="text-ink-tertiary flex items-center gap-1.5 font-medium">
                    <MapPin size={14} className="text-brand-600" /> Pos Pelkes / Bajem:
                  </span>
                  <span className="font-bold text-ink-primary">
                    {activeDetailModal.posName || '-'}
                  </span>
                </div>
              </div>

              {/* Summary KPI Totals */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="bg-surface-sunken p-2.5 rounded-xl border border-border-subtle/60">
                  <p className="text-[10px] text-ink-tertiary font-medium uppercase tracking-wider">Total KK</p>
                  <p className="text-base font-extrabold text-ink-primary tabular-nums mt-0.5">{activeDetailModal.total_kk} KK</p>
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
                <h3 className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
                  <Users size={14} className="text-brand-600" />
                  Rincian 6 Kategori Pelkat GPIB
                </h3>

                <div className="border border-border-subtle rounded-2xl overflow-hidden bg-surface-base">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-surface-sunken/80 border-b border-border-subtle text-ink-primary font-bold">
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
                              <span className="font-extrabold text-ink-primary text-xs tracking-wide">{pelkat.kode}</span>
                            </td>
                            <td className="p-2.5 text-center font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                              {pelkat.kode === 'PKP' ? '-' : rec.laki || 0}
                            </td>
                            <td className="p-2.5 text-center font-bold text-pink-600 dark:text-pink-400 tabular-nums">
                              {pelkat.kode === 'PKB' ? '-' : rec.perempuan || 0}
                            </td>
                            <td className="p-2.5 text-center font-extrabold text-brand-600 tabular-nums">
                              {sumRow} Jiwa
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(activeDetailModal)}
                  className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 shadow-xs shrink-0"
                  title="Bagikan Laporan Demografi ke WhatsApp"
                >
                  <Share2 size={16} />
                  <span>WA</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteFromDetail(activeDetailModal)}
                  disabled={deleteByPosMutation.isPending}
                  className="py-2.5 px-3.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/40 transition-all min-h-[44px] flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                  title="Hapus Data Demografi"
                >
                  <Trash2 size={16} />
                  <span>{deleteByPosMutation.isPending ? '...' : 'Hapus'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEditFromDetail(activeDetailModal)}
                  className="flex-1 py-2.5 px-3.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 active:scale-95 transition-all shadow-xs min-h-[44px] flex items-center justify-center gap-2"
                >
                  <Edit3 size={16} />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
