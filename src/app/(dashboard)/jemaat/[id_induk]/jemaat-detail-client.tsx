'use client';

import { useState } from 'react';
import { CollapsingMapHeader } from '@/components/detail/CollapsingMapHeader';
import { GlideTabs, TabOption } from '@/components/detail/GlideTabs';
import { JemaatProfilTab } from '@/components/detail/JemaatProfilTab';
import { ListRow } from '@/components/list/ListRow';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { ContextualFab } from '@/components/detail/ContextualFab';
import { useJemaatDetail } from '@/hooks/use-jemaat-detail';
import { usePosPelkesByJemaat } from '@/hooks/use-pos-pelkes-by-jemaat';
import { usePendetaByJemaat } from '@/hooks/use-pendeta-by-jemaat';
import { useAsetByJemaat } from '@/hooks/use-aset-by-jemaat';
import { useLogPastoralByJemaat } from '@/hooks/use-log-pastoral-by-jemaat';
import { calculateJemaatStats } from '@/lib/utils/jemaat-stats';
import { detectPosType } from '@/lib/utils/pos-type';
import {
  Home,
  Church,
  User,
  Building2,
  Activity,
  Crown,
  UserCheck,
  UserRound,
  Calendar,
  Landmark,
  Car,
  Box,
  ClipboardList,
} from 'lucide-react';

interface JemaatDetailClientProps {
  id_induk: string;
  id_mupel?: string;
  initialTab?: string;
  canWrite?: boolean;
}

const TABS_CONFIG: TabOption[] = [
  { id: 'profil', label: 'Profil', icon: <Home size={15} /> },
  { id: 'pos-pelkes', label: 'Pos Pelkes & Bajem', icon: <Church size={15} /> },
  { id: 'pendeta', label: 'Pendeta', icon: <User size={15} /> },
  { id: 'aset', label: 'Aset', icon: <Building2 size={15} /> },
  { id: 'log', label: 'Log Pastoral', icon: <Activity size={15} /> },
];

export function JemaatDetailClient({
  id_induk,
  initialTab = 'profil',
  canWrite = true,
}: JemaatDetailClientProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Sub-tab & Pagination State for Aset
  const [asetSubTab, setAsetSubTab] = useState<'all' | 'tanah' | 'bangunan' | 'bergerak'>('all');
  const [asetPage, setAsetPage] = useState<number>(1);

  // Filter & Pagination State for Pastoral Logs
  const [pastoralDateFilter, setPastoralDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [pastoralPage, setPastoralPage] = useState<number>(1);

  // Queries
  const { data: jemaat, isLoading: isLoadingJemaat } = useJemaatDetail(id_induk);
  const { data: posList, isLoading: isLoadingPos } = usePosPelkesByJemaat(id_induk);
  const { data: pendetaData, isLoading: isLoadingPendeta } = usePendetaByJemaat(id_induk);

  // Lazy queries enabled per active tab
  const { data: asetData, isLoading: isLoadingAset } = useAsetByJemaat(
    id_induk,
    asetSubTab,
    asetPage,
    20
  );

  const { data: pastoralData, isLoading: isLoadingPastoral } = useLogPastoralByJemaat(
    id_induk,
    pastoralDateFilter,
    pastoralPage,
    20
  );

  if (isLoadingJemaat) {
    return <ListSkeleton count={4} />;
  }

  if (!jemaat) {
    return (
      <EmptyState
        icon={Church}
        title="Jemaat Induk Tidak Ditemukan"
        description={`Jemaat Induk dengan ID ${id_induk} tidak ditemukan atau telah dihapus.`}
      />
    );
  }

  // Calculate 5-metric stats for StatStrip
  const stats = calculateJemaatStats(posList || [], {
    jumlah_kk: jemaat.jumlah_kk,
    jumlah_jiwa: jemaat.jumlah_jiwa,
  });

  const headerPos = {
    id_pos: jemaat.id_induk,
    id_induk: jemaat.id_induk,
    nama_pos: jemaat.nama_induk,
    kategori: 'Jemaat Induk Mandiri',
    alamat: jemaat.alamat,
    latitude: jemaat.latitude,
    longitude: jemaat.longitude,
    jemaat_induk: jemaat.mupel ? {
      id_induk: jemaat.id_induk,
      nama_induk: jemaat.nama_induk,
      id_mupel: jemaat.mupel.id_mupel,
      mupel: jemaat.mupel,
    } : null,
  };

  return (
    <div className="space-y-4 pb-28 max-w-4xl mx-auto px-3 sm:px-6">
      {/* 1. Collapsing Map Header (REUSE 100%) */}
      <CollapsingMapHeader
        pos={headerPos}
        catLabel="Jemaat Induk Mandiri"
        catColor="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-800"
        canWrite={canWrite}
        onEditClick={() => {
          window.location.href = `/hierarki/${encodeURIComponent(jemaat.id_mupel)}`;
        }}
      />

      {/* 2. 60fps GlideTabs Header (REUSE 100%) */}
      <GlideTabs
        tabs={TABS_CONFIG}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId)}
        className="rounded-2xl shadow-xs"
      />

      {/* 3. Tab Contents */}
      <div className="pt-2">
        {/* TAB 1: PROFIL */}
        {activeTab === 'profil' && (
          <JemaatProfilTab
            jemaat={jemaat}
            stats={stats}
            kmj={pendetaData?.kmj}
            pjs={pendetaData?.pjs}
          />
        )}

        {/* TAB 2: POS PELKES & BAJEM (100% REUSE ListRow) */}
        {activeTab === 'pos-pelkes' && (
          <div className="space-y-3 animate-tab-fade">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Church size={14} className="text-brand-primary" />
                <span>Pos Pelkes & Bajem ({posList?.length || 0})</span>
              </h3>
            </div>

            {isLoadingPos ? (
              <ListSkeleton count={4} />
            ) : !posList || posList.length === 0 ? (
              <EmptyState
                icon={Church}
                title="Belum Ada Pos Pelkes"
                description="Jemaat Induk ini belum memiliki Pos Pelkes atau Bajem terdaftar di bawahnya."
              />
            ) : (
              <div className="divide-y divide-line-hairline bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs">
                {posList.map((pos) => {
                  const posType = detectPosType(pos);
                  const isBajem = posType === 'bajem';
                  const label = isBajem ? 'Bakal Jemaat' : 'Pos Pelkes';

                  return (
                    <ListRow
                      key={pos.id_pos}
                      icon={
                        isBajem ? (
                          <Church className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                        ) : (
                          <Church className="w-5 h-5 text-brand-primary" />
                        )
                      }
                      iconVariant={isBajem ? 'accent' : 'brand'}
                      title={pos.nama_pos}
                      subtitle={
                        <span className="flex items-center gap-2 flex-wrap">
                          <span>{pos.pj?.nama_lengkap ? `PJ: ${pos.pj.nama_lengkap}` : '⚠️ Belum ada PJ'}</span>
                          {pos.alamat && <span>• {pos.alamat}</span>}
                        </span>
                      }
                      badge={
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isBajem
                              ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}
                        >
                          {label}
                        </span>
                      }
                      meta={`${pos.jumlah_kk || 0} KK • ${pos.jumlah_jiwa || 0} Jiwa`}
                      href={`/dashboard/pos-pelkes/${encodeURIComponent(pos.id_pos)}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PENDETA (ListRow dengan Role Chips) */}
        {activeTab === 'pendeta' && (
          <div className="space-y-3 animate-tab-fade">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <User size={14} className="text-brand-primary" />
                <span>Pendeta Terdaftar ({pendetaData?.allPendeta?.length || 0})</span>
              </h3>
            </div>

            {isLoadingPendeta ? (
              <ListSkeleton count={4} />
            ) : !pendetaData?.allPendeta || pendetaData.allPendeta.length === 0 ? (
              <EmptyState
                icon={User}
                title="Belum Ada Pendeta Terdaftar"
                description="Belum ada pendeta yang terdaftar di bawah Jemaat Induk ini."
              />
            ) : (
              <div className="divide-y divide-line-hairline bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs">
                {pendetaData.allPendeta.map((p) => {
                  let roleLabel = 'Pendeta';
                  let roleClass = 'bg-surface-sunken text-text-muted';
                  let RoleIcon = UserRound;

                  if (p.is_kmj) {
                    roleLabel = 'KMJ';
                    roleClass = 'bg-brand-primary text-white';
                    RoleIcon = Crown;
                  } else if (p.is_pj) {
                    roleLabel = 'PJ';
                    roleClass = 'bg-accent-500/10 text-accent-600 border border-accent-500/20';
                    RoleIcon = UserCheck;
                  }

                  return (
                    <ListRow
                      key={p.id_pendeta}
                      icon={<RoleIcon className="w-5 h-5" />}
                      iconVariant={p.is_kmj ? 'brand' : p.is_pj ? 'accent' : 'default'}
                      title={p.nama_lengkap}
                      subtitle={
                        <span className="flex items-center gap-2 flex-wrap">
                          <span>{p.jabatan || 'Pendeta GPIB'}</span>
                          {p.no_wa && <span>• WA: {p.no_wa}</span>}
                        </span>
                      }
                      badge={
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${roleClass}`}>
                          {roleLabel}
                        </span>
                      }
                      href={`/settings/users/${encodeURIComponent(p.user_id || p.id_pendeta)}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ASET (Lazy Loaded + Sub-chips + Load More Button) */}
        {activeTab === 'aset' && (
          <div className="space-y-4 animate-tab-fade">
            {/* Sub-Chips Filter */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {[
                { id: 'all', label: 'Semua Aset', icon: <Box size={13} /> },
                { id: 'tanah', label: 'Tanah', icon: <Landmark size={13} /> },
                { id: 'bangunan', label: 'Bangunan', icon: <Building2 size={13} /> },
                { id: 'bergerak', label: 'Bergerak', icon: <Car size={13} /> },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    setAsetSubTab(chip.id as any);
                    setAsetPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 min-h-[36px] ${
                    asetSubTab === chip.id
                      ? 'bg-brand-primary text-white shadow-2xs'
                      : 'bg-surface-1 border border-border-subtle text-text-muted hover:bg-surface-sunken'
                  }`}
                >
                  {chip.icon}
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {isLoadingAset ? (
              <ListSkeleton count={4} />
            ) : !asetData?.items || asetData.items.length === 0 ? (
              <EmptyState
                icon={Box}
                title="Belum Ada Inventaris Aset"
                description="Belum ada aset terdaftar pada kategori ini di seluruh Pos Pelkes jemaat ini."
              />
            ) : (
              <div className="space-y-3">
                <div className="divide-y divide-line-hairline bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs">
                  {asetData.items.map((item) => (
                    <ListRow
                      key={item.id}
                      icon={
                        item.kategori === 'tanah' ? (
                          <Landmark className="w-5 h-5" />
                        ) : item.kategori === 'bangunan' ? (
                          <Building2 className="w-5 h-5" />
                        ) : (
                          <Car className="w-5 h-5" />
                        )
                      }
                      iconVariant={item.kategori === 'bangunan' ? 'brand' : 'accent'}
                      title={item.nama}
                      subtitle={item.detail}
                      meta={`Kondisi: ${item.kondisi}`}
                      href="/laporan/aset"
                    />
                  ))}
                </div>

                {/* Explicit "Load More" Button with Counter (User Clarification #2) */}
                {asetData.hasMore && (
                  <button
                    type="button"
                    onClick={() => setAsetPage((prev) => prev + 1)}
                    className="w-full py-3 px-4 rounded-xl border border-border-subtle bg-surface-1 hover:bg-surface-sunken text-xs font-bold text-brand-primary flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                  >
                    <span>Muat Lebih Banyak ({asetData.remaining} tersisa)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: LOG PASTORAL (Lazy Loaded + Date Filter + Load More Button) */}
        {activeTab === 'log' && (
          <div className="space-y-4 animate-tab-fade">
            {/* Date Range Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {[
                { id: 'all', label: 'Semua Waktu' },
                { id: '7d', label: '7 Hari Terakhir' },
                { id: '30d', label: '30 Hari Terakhir' },
                { id: '90d', label: '90 Hari Terakhir' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    setPastoralDateFilter(chip.id as any);
                    setPastoralPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] ${
                    pastoralDateFilter === chip.id
                      ? 'bg-brand-primary text-white shadow-2xs'
                      : 'bg-surface-1 border border-border-subtle text-text-muted hover:bg-surface-sunken'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {isLoadingPastoral ? (
              <ListSkeleton count={4} />
            ) : !pastoralData?.items || pastoralData.items.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="Belum Ada Log Pastoral"
                description="Belum ada catatan kegiatan pastoral yang terdaftar pada rentang waktu ini."
              />
            ) : (
              <div className="space-y-3">
                <div className="divide-y divide-line-hairline bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs">
                  {pastoralData.items.map((log) => {
                    const formattedDate = log.tgl
                      ? new Date(log.tgl).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-';

                    return (
                      <ListRow
                        key={log.id_log}
                        icon={<Activity className="w-5 h-5 text-brand-primary" />}
                        iconVariant="brand"
                        title={log.kegiatan || 'Kegiatan Pastoral'}
                        subtitle={
                          <span className="flex items-center gap-2 flex-wrap">
                            <span>Pendeta: {log.pendeta?.nama_lengkap || '-'}</span>
                            <span>• Pos: {log.nama_pos}</span>
                          </span>
                        }
                        meta={
                          <span className="flex items-center gap-2 text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{formattedDate}</span>
                            </span>
                            {log.jml_jiwa && <span>• {log.jml_jiwa} Jiwa</span>}
                          </span>
                        }
                        href="/laporan/pastoral"
                      />
                    );
                  })}
                </div>

                {/* Explicit "Load More" Button with Counter (User Clarification #2) */}
                {pastoralData.hasMore && (
                  <button
                    type="button"
                    onClick={() => setPastoralPage((prev) => prev + 1)}
                    className="w-full py-3 px-4 rounded-xl border border-border-subtle bg-surface-1 hover:bg-surface-sunken text-xs font-bold text-brand-primary flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                  >
                    <span>Muat Lebih Banyak ({pastoralData.remaining} tersisa)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Contextual Floating Action Button */}
      <ContextualFab id_pos={jemaat.id_induk} activeTab={activeTab} canWrite={canWrite} />
    </div>
  );
}

export default JemaatDetailClient;
