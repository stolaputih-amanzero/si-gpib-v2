'use client';

import React, { useMemo } from 'react';
import { UnifiedOrganizationData } from '@/types/organization.types';
import { adaptOrganizationToViewModel } from '@/adapters/organizationViewModelAdapter';
import { OrganizationHeader } from './OrganizationHeader';
import { OrgNavigationAnchor } from './OrgNavigationAnchor';
import { OrgOverviewSection } from './sections/OrgOverviewSection';
import { OrgStructureSection } from './sections/OrgStructureSection';
import { OrgPeopleSection } from './sections/OrgPeopleSection';
import { OrgDemographySection } from './sections/OrgDemographySection';
import { OrgPastoralSection } from './sections/OrgPastoralSection';
import { OrgAssetsSection } from './sections/OrgAssetsSection';
import { OrgTerritorySection } from './sections/OrgTerritorySection';
import { OrgAidRequestsSection } from './sections/OrgAidRequestsSection';
import { OrgHistorySection } from './sections/OrgHistorySection';

interface OrganizationWorkspaceShellProps {
  organization: UnifiedOrganizationData;
}

export const OrganizationWorkspaceShell: React.FC<OrganizationWorkspaceShellProps> = ({ organization }) => {
  // Pass through UI Anti-Corruption Layer (Adapter)
  const vm = useMemo(() => adaptOrganizationToViewModel(organization), [organization]);

  return (
    <div className="min-h-screen bg-[#0B1220] pb-20 space-y-6">
      {/* 1. Header (Identity-First Banner) */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <OrganizationHeader header={vm.header} />
      </div>

      {/* 2. Single Top Sticky Anchor Bar (Mobile-first PWA Nav) */}
      <div className="max-w-5xl mx-auto px-4">
        <OrgNavigationAnchor />
      </div>

      {/* 3. The 9 Canonical Workspace Sections */}
      <main className="max-w-5xl mx-auto px-4 space-y-10">
        <OrgOverviewSection overview={vm.overview} />
        <OrgStructureSection structure={vm.structure} />
        <OrgPeopleSection people={vm.people} />
        <OrgDemographySection demography={vm.demography} />
        <OrgPastoralSection pastoral={vm.pastoral} />
        <OrgAssetsSection assets={vm.assets} />
        <OrgTerritorySection territory={vm.territory} />
        <OrgAidRequestsSection aidRequests={vm.aidRequests} />
        <OrgHistorySection history={vm.history} />
      </main>
    </div>
  );
};
