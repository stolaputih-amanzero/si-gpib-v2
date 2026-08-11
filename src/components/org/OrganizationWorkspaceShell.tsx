'use client';

import React, { useMemo } from 'react';
import { UnifiedOrganizationData } from '@/types/organization.types';
import { adaptOrganizationToViewModel } from '@/adapters/organizationViewModelAdapter';
import { OrganizationHeader } from './OrganizationHeader';
import { OrgNavigationAnchor } from './OrgNavigationAnchor';
import { OrgOverviewSection } from './sections/OrgOverviewSection';
import { OrgStructureSection } from './sections/OrgStructureSection';
import { OrgPeopleSection } from './sections/OrgPeopleSection';
import { OrgAssetsSection } from './sections/OrgAssetsSection';
import { OrgAidRequestsSection } from './sections/OrgAidRequestsSection';
import { OrgTerritorySection } from './sections/OrgTerritorySection';

interface OrganizationWorkspaceShellProps {
  organization: UnifiedOrganizationData;
}

export const OrganizationWorkspaceShell: React.FC<OrganizationWorkspaceShellProps> = ({ organization }) => {
  // Pass through UI Anti-Corruption Layer (Adapter)
  const vm = useMemo(() => adaptOrganizationToViewModel(organization), [organization]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16 space-y-6">
      {/* 1. Header (Identity-First Banner) */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <OrganizationHeader header={vm.header} />
      </div>

      {/* 2. Single Top Sticky Anchor Bar (Mobile-first PWA Nav) */}
      <div className="max-w-6xl mx-auto px-4">
        <OrgNavigationAnchor />
      </div>

      {/* 3. The 6 Progressive Workspace Sections */}
      <main className="max-w-6xl mx-auto px-4 space-y-10">
        <OrgOverviewSection overview={vm.overview} />
        <OrgStructureSection structure={vm.structure} />
        <OrgPeopleSection people={vm.people} />
        <OrgAssetsSection assets={vm.assets} />
        <OrgAidRequestsSection aidRequests={vm.aidRequests} />
        <OrgTerritorySection territory={vm.territory} />
      </main>
    </div>
  );
};
