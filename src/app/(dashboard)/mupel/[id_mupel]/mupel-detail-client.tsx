'use client';

import { useState } from 'react';
import { CollapsingMapHeader } from '@/components/detail/CollapsingMapHeader';
import { GlideTabs, TabOption } from '@/components/detail/GlideTabs';
import { MupelProfilTab } from '@/components/detail/MupelProfilTab';
import { ListRow } from '@/components/list/ListRow';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { ContextualFab } from '@/components/detail/ContextualFab';
import { useMupelDetail } from '@/hooks/use-mupel-detail';
import { useJemaatByMupel } from '@/hooks/use-jemaat-by-mupel';
import { usePendetaByMupel } from '@/hooks/use-pendeta-by-mupel';
import { useAdminMupel } from '@/hooks/use-admin-mupel';
import { useLogPastoralByMupel } from '@/hooks/use-log-pastoral-by-mupel';
import { calculateMupelStats } from '@/lib/utils/mupel-stats';
import { calculateMupelCentroid } from '@/lib/utils/mupel-centroid';
import {
  Home,
  Church,
  User,
  Activity,
  Crown,
  UserCheck,
  UserRound,
  Calendar,
  ClipboardList,
} from 'lucide-react';

interface MupelDetailClientProps {
  id_mupel: string;
  initialTab?: string;
  canWrite?: boolean;
}

const TABS_CONFIG: TabOption[] = [
  { id: 'profil', label: 'Profil Mupel', icon: <Home size={15} /> },
  { id: 'jemaat', label: 'Jemaat Induk', icon: <Church size={15} /> },
  { id: 'pendeta', label: 'Pendeta', icon: <User size={15} /> },
  { id: 'log', label: 'Log Pastoral', icon: <Activity size={15} /> },
];

export function MupelDetailClient({
  id_mupel,
  initialTab = 'profil',
  canWrite = true,
}: MupelDetailClientProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Filter & Pagination State for Pastoral Logs
  const [pastoralDateFilter, setPastoralDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [pastoralPage, setPastoralPage] = useState<number>(1);

  // Queries
  const { data: mupel, isLoading: isLoadingMupel } = useMupelDetail(id_mupel);
  const { data: jemaatList, isLoading: isLoadingJemaat } = useJemaatByMupel(id_mupel);
  const { data: pendetaList, isLoading: isLoadingPendeta } = usePendetaByMupel(id_mupel);
  const { data: adminUsers } = useAdminMupel(id_mupel);

  // Lazy query for pastoral logs across Mupel
  const { data: pastoralData, isLoading: isLoadingPastoral } = useLogPastoralByMupel(
    id_mupel,
    pastoralDateFilter,
    pastoralPage,
    20
  );

  if (isLoadingMupel) {
    return <ListSkeleton count={4} />;
  }

  if (!mupel) {
    return (
      <EmptyState
        icon={Church}
        title="Mupel Tidak Ditemukan"
        description={`Mupel dengan ID ${id_mupel} tidak ditemukan atau telah dihapus.`}
      />
    );
  }

  // Calculate 5-metric Mupel stats
  const stats = calculateMupelStats(jemaatList || [], pendetaList || []);

  // Calculate geographic centroid and cluster markers
  const { centroid, validMarkers } = calculateMupelCentroid(
    (jemaatList || []).map((j) => ({
      id_induk: j.id_induk,
      nama_induk: j.nama_induk,
      latitude: j.latitude,
      longitude: j.longitude,
    }))
  );

  const headerPos = {
    id_pos: mupel.id_mupel,
    id_induk: mupel.id_mupel,
    nama_pos: mupel.nama_mupel,
    kategori: 'Musyawarah Pelayanan',
    alamat: mupel.keterangan || `Wilayah Pelayanan ${mupel.nama_mupel}`,
    latitude: centroid?.lat || null,
    longitude: centroid?.lng || null,
    jemaat_induk: null,
  };

  return (
    <div className="space-y-4 pb-28 max-w-4xl mx-auto px-3 sm:px-6">
      {/* 1. Collapsing Map Header (100% REUSE with Cluster Map Option A) */}
      <CollapsingMapHeader
        pos={headerPos}
        catLabel="Musyawarah Pelayanan (Mupel)"
        catColor="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/60 dark:text-indigo-200 dark:border-indigo-800"
        canWrite={canWrite}
        mapType="cluster"
        centroid={centroid}
        clusterMarkers={validMarkers}
        onEditClick={() => {
          window.location.href = `/hierarki`;
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
          <MupelProfilTab
            mupel={mupel}
            stats={stats}
            admins={adminUsers}
          />
        )}

        {/* TAB 2: JEMAAT INDUK (UJIAN KEGENERIKAN PUNCAK 100% REUSE ListRow) */}
        {activeTab === 'jemaat' && (
          <div className="space-y-3 animate-tab-fade">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Church size={14} className="text-brand-primary" />
                <span>Jemaat Induk Terdaftar ({jemaatList?.length || 0})</span>
              </h3>
            </div>

            {isLoadingJemaat ? (
              <ListSkeleton count={4} />
            ) : !jemaatList || jemaatList.length === 0 ? (
              <EmptyState
                icon={Church}
                title="Belum Ada Jemaat Induk"
                description="Belum ada Jemaat Induk yang terdaftar di bawah Mupel ini."
              />
            ) : (
              <div className="divide-y divide-line-hairline bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs">
                {jemaatList.map((j) => (
                  <ListRow
                    key={j.id_induk}
                    icon={<Church className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                    iconVariant="brand"
                    title={j.nama_induk}
                    subtitle={
                      <span className="flex items-center gap-2 flex-wrap">
                        <span>ID: {j.id_induk}</span>
                        {j.alamat && <span>• {j.alamat}</span>}
                      </span>
                    }
                    meta={`${j.pos_count || 0} Pos Pelkes • ${j.bajem_count || 0} Bajem`}
                    href={`/jemaat/${encodeURIComponent(j.id_induk)}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PENDETA (ListRow dengan Role Chips & Jemaat Subtitle) */}
        {activeTab === 'pendeta' && (
          <div className="space-y-3 animate-tab-fade">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <User size={14} className="text-brand-primary" />
                <span>Pendeta Terdaftar di Mupel ({pendetaList?.length || 0})</span>
              </h3>
            </div>

            {isLoadingPendeta ? (
              <ListSkeleton count={4} />
            ) : !pendetaList || pendetaList.length === 0 ? (
              <EmptyState
                icon={User}
                title="Belum Ada Pendeta Terdaftar"
                description="Belum ada pendeta yang terdaftar di jemaat-jemaat Mupel ini."
              />
            ) : (
              <div className="divide-y divide-line-hairline bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs">
                {pendetaList.map((p) => {
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
                          <span>{p.nama_induk}</span>
                          {p.jabatan && <span>• {p.jabatan}</span>}
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

        {/* TAB 4: LOG PASTORAL (Lazy Loaded + Date Filter + Load More Button) */}
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
                description="Belum ada catatan kegiatan pastoral yang terdaftar di wilayah Mupel ini pada rentang waktu ini."
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
                            <span>• {log.nama_induk} ({log.nama_pos})</span>
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

                {/* Explicit "Load More" Button with Counter */}
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
      <ContextualFab id_pos={mupel.id_mupel} activeTab={activeTab} canWrite={canWrite} />
    </div>
  );
}

export default MupelDetailClient;
