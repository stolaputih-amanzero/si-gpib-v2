'use client';

import { useState } from 'react';
import { LegacyUnifiedOrganizationData } from './legacyTypes';
import { CollapsingMapHeader } from '@/components/detail/CollapsingMapHeader';
import { GlideTabs, TabOption } from '@/components/detail/GlideTabs';
import { ContextualFab } from '@/components/detail/ContextualFab';

// We will create these next
import { OrgOverviewSection } from './sections/OrgOverviewSection';
import { OrgProfileSection } from './sections/OrgProfileSection';
import { OrgSdmSection } from './sections/OrgSdmSection';
import { OrgDemografiSection } from './sections/OrgDemografiSection';
import { OrgPastoralJadwalSection } from './sections/OrgPastoralJadwalSection';
import { OrgAssetWilayahSection } from './sections/OrgAssetWilayahSection';
import { OrgBantuanSection } from './sections/OrgBantuanSection';

import { Home, User, Activity, Building2, LifeBuoy } from 'lucide-react';

interface OrganizationWorkspaceClientProps {
  orgData: LegacyUnifiedOrganizationData;
  activeContext: { id: string; name: string; context_level: string };
}

export function OrganizationWorkspaceClient({
  orgData,
  activeContext,
}: OrganizationWorkspaceClientProps) {
  // Safe default active tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Dynamic Tabs based on Level
  const TABS_CONFIG: TabOption[] = [
    { id: 'overview', label: 'Overview', icon: <Home size={15} /> },
    { id: 'profil', label: 'Profil', icon: <Home size={15} /> },
    { id: 'sdm', label: 'SDM', icon: <User size={15} /> },
    { id: 'aset', label: 'Aset', icon: <Building2 size={15} /> },
    { id: 'bantuan', label: 'Bantuan', icon: <LifeBuoy size={15} /> },
    { id: 'program', label: 'Program & Pastoral', icon: <Activity size={15} /> },
  ];

  // Map to legacy format for CollapsingMapHeader
  const headerPos = {
    id_pos: orgData.id,
    id_induk: orgData.parent_jemaat?.id || orgData.id,
    nama_pos: orgData.name,
    kategori: orgData.subtype || (orgData.level === 'MUPEL' ? 'Mupel' : orgData.level === 'JEMAAT' ? 'Jemaat' : 'Pos Pelkes'),
    alamat: orgData.profile.address,
    latitude: orgData.profile.lat,
    longitude: orgData.profile.lng,
    jemaat_induk: null,
  };

  let catLabel = 'Pos Pelkes';
  let catColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50';

  if (orgData.level === 'MUPEL') {
    catLabel = 'Mupel';
    catColor = 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/60 dark:text-indigo-200 dark:border-indigo-800';
  } else if (orgData.level === 'JEMAAT' || orgData.subtype === 'JEMAAT_INDUK' || orgData.subtype === 'JEMAAT_INDUK_MANDIRI') {
    catLabel = 'Jemaat';
    catColor = 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-800';
  } else if (orgData.subtype === 'BAJEM') {
    catLabel = 'Bajem';
    catColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50';
  }

  // Mutation logic: We use the `activeContext.id` for any forms/mutations.
  const canWrite = activeContext.id === orgData.id || activeContext.id === orgData.parent_jemaat?.id || activeContext.id === orgData.parent_mupel?.id || activeContext.id.startsWith('SINODE-') || activeContext.id === 'GLOBAL';

  return (
    <div className="space-y-4 pb-28 max-w-4xl mx-auto px-3 sm:px-6">
      <CollapsingMapHeader
        pos={headerPos}
        catLabel={catLabel}
        catColor={catColor}
        canWrite={canWrite}
        onEditClick={() => {
          // This routes to generic org edit form eventually
          window.location.href = `/settings/org/${encodeURIComponent(orgData.id)}/edit`;
        }}
      />

      <GlideTabs
        tabs={TABS_CONFIG}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId)}
        className="rounded-2xl shadow-xs"
      />

      <div className="pt-2">
        {activeTab === 'overview' && <OrgOverviewSection orgData={orgData} />}
        {activeTab === 'profil' && (
          <div className="space-y-6">
            <OrgProfileSection orgData={orgData} canWrite={canWrite} />
            <OrgDemografiSection orgData={orgData} />
          </div>
        )}
        {activeTab === 'sdm' && <OrgSdmSection orgData={orgData} />}
        {activeTab === 'aset' && <OrgAssetWilayahSection orgData={orgData} />}
        {activeTab === 'bantuan' && <OrgBantuanSection orgData={orgData} />}
        {activeTab === 'program' && <OrgPastoralJadwalSection orgData={orgData} />}
      </div>

      <ContextualFab id_pos={activeContext.id} activeTab={activeTab} canWrite={canWrite} />
    </div>
  );
}
