'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { CollapsingMapHeader } from '@/components/detail/CollapsingMapHeader';
import { GlideTabs, TabOption } from '@/components/detail/GlideTabs';
import { ProfilTab } from '@/components/detail/ProfilTab';
import { PastoralTab } from '@/components/detail/PastoralTab';
import { AsetTab } from '@/components/detail/AsetTab';
import { PelayanTab } from '@/components/detail/PelayanTab';
import { WilayahTab } from '@/components/detail/WilayahTab';
import { ContextualFab } from '@/components/detail/ContextualFab';
import { JadwalTabContent } from './jadwal-tab-content';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import {
  Home,
  Calendar,
  User,
  Users,
  Building2,
  Compass,
  Activity,
} from 'lucide-react';

// Lazy-load DemografiTab (containing Recharts bundle) to keep initial JS payload < 100KB
const DemografiTabLazy = dynamic(
  () => import('@/components/detail/DemografiTab').then((mod) => mod.DemografiTab),
  {
    ssr: false,
    loading: () => <ListSkeleton count={3} />,
  }
);

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

  return (
    <div className="space-y-4 pb-28 max-w-4xl mx-auto px-3 sm:px-6">
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

      {/* 3. Lazy Tab Contents */}
      <div className="pt-2">
        {/* TAB 1: PROFIL */}
        {activeTab === 'profil' && (
          <ProfilTab pos={pos} demografi={demografi} pj={pj} />
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

        {/* TAB 4: DEMOGRAFI (Lazy Loaded Recharts) */}
        {activeTab === 'demografi' && (
          <div className="animate-tab-fade">
            <DemografiTabLazy id_pos={pos.id_pos} canWrite={canWrite} />
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
