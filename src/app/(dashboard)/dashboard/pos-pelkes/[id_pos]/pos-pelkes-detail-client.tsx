'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CollapsingMapHeader } from '@/components/detail/CollapsingMapHeader';
import { GlideTabs, TabOption } from '@/components/detail/GlideTabs';
import { InfoBlock } from '@/components/detail/InfoBlock';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { PastoralTab } from '@/components/detail/PastoralTab';
import { AsetTab } from '@/components/detail/AsetTab';
import { DemografiTab } from '@/components/detail/DemografiTab';
import { PelayanTab } from '@/components/detail/PelayanTab';
import { WilayahTab } from '@/components/detail/WilayahTab';
import { ContextualFab } from '@/components/detail/ContextualFab';
import { JadwalTabContent } from './jadwal-tab-content';
import {
  Home,
  Calendar,
  User,
  Users,
  Building2,
  Compass,
  Activity,
  MapPin,
  Phone,
  Navigation,
  ExternalLink,
} from 'lucide-react';

interface PosPelkesDetailClientProps {
  pos: any;
  demografi: any[];
  logs: any[];
  pj: any;
  pelayan: any[];
  relawan: any[];
  kerawanan: any[];
  potensi: any[];
  jadwalList: any[];
  historiList: any[];
  catLabel: string;
  catColor: string;
  canWrite: boolean;
  canDelete: boolean;
  currentUserName: string;
  initialTab?: string;
}

const TABS_CONFIG: TabOption[] = [
  { id: 'profil', label: 'Profil', icon: <Home size={15} /> },
  { id: 'jadwal', label: 'Jadwal Ibadah', icon: <Calendar size={15} /> },
  { id: 'pendeta', label: 'Pendeta & Pelayan', icon: <User size={15} /> },
  { id: 'demografi', label: 'Demografi', icon: <Users size={15} /> },
  { id: 'aset', label: 'Aset', icon: <Building2 size={15} /> },
  { id: 'wilayah', label: 'Analisis Wilayah', icon: <Compass size={15} /> },
  { id: 'log', label: 'Log Pastoral', icon: <Activity size={15} /> },
];

export function PosPelkesDetailClient({
  pos,
  demografi,
  logs,
  pj,
  pelayan,
  relawan,
  kerawanan,
  potensi,
  catLabel,
  catColor,
  canWrite,
  initialTab = 'profil',
}: PosPelkesDetailClientProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Demografi Totals
  const demoKK = demografi?.reduce((acc: number, curr: any) => acc + (curr.jml_kk || 0), 0) || 0;
  const demoLaki = demografi?.reduce((acc: number, curr: any) => acc + (curr.laki || 0), 0) || 0;
  const demoPerempuan = demografi?.reduce((acc: number, curr: any) => acc + (curr.perempuan || 0), 0) || 0;
  const demoJiwa = demoLaki + demoPerempuan;

  const totalKK = demoKK || pos.jumlah_kk || 0;
  const totalJiwa = demoJiwa || pos.jumlah_jiwa || 0;

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto px-3 sm:px-6">
      {/* 1. Collapsing Map Identity Header */}
      <CollapsingMapHeader
        pos={pos}
        catLabel={catLabel}
        catColor={catColor}
        canWrite={canWrite}
        onEditClick={() => {
          window.location.href = `/dashboard/pos-pelkes/${encodeURIComponent(pos.id_pos)}/edit`;
        }}
      />

      {/* 2. 60fps GlideTabs Header */}
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
          <div className="space-y-4 animate-tab-fade">
            {/* StatStrip Demografi */}
            <SummaryStrip
              metrics={[
                { label: 'Jumlah KK', value: totalKK, icon: <Home size={16} className="text-emerald-600 dark:text-emerald-400" /> },
                { label: 'Total Jiwa', value: totalJiwa, icon: <Users size={16} className="text-brand-primary" /> },
                { label: 'Laki-Laki', value: demoLaki, icon: <User size={16} className="text-blue-600 dark:text-blue-400" /> },
                { label: 'Perempuan', value: demoPerempuan, icon: <User size={16} className="text-pink-600 dark:text-pink-400" /> },
              ]}
              className="bg-surface-1/50 rounded-xl py-2 px-3 hairline-b"
            />

            {/* Quick Pendeta PJ Card (If assigned) */}
            {pj && (
              <div className="bg-surface-1 p-3.5 rounded-2xl border border-border-subtle shadow-xs flex items-center justify-between gap-3">
                <Link
                  href={`/pendeta/${pj.id_pendeta}`}
                  className="flex items-center gap-3 min-w-0 flex-1 group"
                >
                  {pj.foto_url ? (
                    <img
                      src={pj.foto_url}
                      alt={pj.nama_lengkap}
                      className="w-10 h-10 rounded-xl object-cover border border-border-subtle shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      {pj.nama_lengkap.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-wider block">
                      Pendeta Jemaat (PJ)
                    </span>
                    <h4 className="font-extrabold text-sm text-text-high truncate group-hover:text-brand-primary transition-colors">
                      {pj.nama_lengkap}
                    </h4>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Status: {pj.status_tugas || 'Aktif'}
                    </p>
                  </div>
                </Link>

                {pj.no_wa && (
                  <a
                    href={`https://wa.me/${pj.no_wa.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center transition-all min-h-[40px] min-w-[40px] shrink-0"
                    title={`Chat WA ${pj.nama_lengkap}`}
                  >
                    <Phone size={16} />
                  </a>
                )}
              </div>
            )}

            {/* Information Blocks Container (Hairline Cardless List) */}
            <div className="bg-surface-1 rounded-2xl border border-border-subtle shadow-xs overflow-hidden divide-y divide-line-hairline">
              <InfoBlock
                icon={<MapPin className="w-4 h-4 text-brand-primary" />}
                label="Alamat Pos Pelkes"
                value={pos.alamat}
              />

              <InfoBlock
                icon={<Building2 className="w-4 h-4 text-brand-primary" />}
                label="Jemaat Induk Pengampu"
                value={pos.jemaat_induk?.nama_induk}
                href={
                  pos.jemaat_induk
                    ? `/hierarki/${encodeURIComponent(pos.jemaat_induk.id_mupel)}/${encodeURIComponent(pos.jemaat_induk.id_induk)}`
                    : undefined
                }
              />

              <InfoBlock
                icon={<Calendar className="w-4 h-4 text-brand-primary" />}
                label="Tanggal Berdiri"
                value={
                  pos.tgl_berdiri
                    ? new Date(pos.tgl_berdiri).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : null
                }
              />

              {pos.latitude && pos.longitude && (
                <InfoBlock
                  icon={<Navigation className="w-4 h-4 text-brand-primary" />}
                  label="Koordinat Lokasi GPS"
                  value={`Lat: ${pos.latitude}, Lng: ${pos.longitude}`}
                  href={`https://www.google.com/maps/dir/?api=1&destination=${pos.latitude},${pos.longitude}`}
                  trailing={<ExternalLink size={14} className="text-text-tertiary" />}
                />
              )}

              <InfoBlock
                icon={<Compass className="w-4 h-4 text-brand-primary" />}
                label="Catatan Keterangan"
                value={pos.keterangan}
              />

              <InfoBlock
                icon={<Activity className="w-4 h-4 text-brand-primary" />}
                label="Terakhir Diperbarui"
                value={
                  pos.updated_at
                    ? `${new Date(pos.updated_at).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })} ${pos.updated_by ? `oleh ${pos.updated_by}` : ''}`
                    : null
                }
              />
            </div>
          </div>
        )}

        {/* TAB 2: JADWAL */}
        {activeTab === 'jadwal' && (
          <div className="animate-tab-fade">
            <JadwalTabContent id_pos={pos.id_pos} canWrite={canWrite} />
          </div>
        )}

        {/* TAB 3: PENDETA & PELAYAN */}
        {activeTab === 'pendeta' && (
          <div className="animate-tab-fade">
            <PelayanTab
              id_pos={pos.id_pos}
              canWrite={canWrite}
              pj={pj}
              pelayan={pelayan}
              relawan={relawan}
            />
          </div>
        )}

        {/* TAB 4: DEMOGRAFI */}
        {activeTab === 'demografi' && (
          <div className="animate-tab-fade">
            <DemografiTab id_pos={pos.id_pos} canWrite={canWrite} />
          </div>
        )}

        {/* TAB 5: ASET */}
        {activeTab === 'aset' && (
          <div className="animate-tab-fade">
            <AsetTab id_pos={pos.id_pos} canWrite={canWrite} />
          </div>
        )}

        {/* TAB 6: WILAYAH */}
        {activeTab === 'wilayah' && (
          <div className="animate-tab-fade">
            <WilayahTab
              id_pos={pos.id_pos}
              canWrite={canWrite}
              initialKerawanan={kerawanan}
              initialPotensi={potensi}
            />
          </div>
        )}

        {/* TAB 7: LOG PASTORAL */}
        {activeTab === 'log' && (
          <div className="animate-tab-fade">
            <PastoralTab
              id_pos={pos.id_pos}
              canWrite={canWrite}
              initialLogs={logs}
            />
          </div>
        )}
      </div>

      {/* 4. Contextual Floating Action Button */}
      <ContextualFab id_pos={pos.id_pos} activeTab={activeTab} canWrite={canWrite} />
    </div>
  );
}

export default PosPelkesDetailClient;
