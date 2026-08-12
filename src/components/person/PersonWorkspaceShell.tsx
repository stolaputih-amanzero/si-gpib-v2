'use client';

import React, { useMemo } from 'react';
import { UnifiedPersonData } from '../../types/person.types';
import { adaptPersonToViewModel } from '../../adapters/personViewModelAdapter';
import { PersonHeader } from './PersonHeader';
import { PersonNavigationAnchor } from './PersonNavigationAnchor';
import { OverviewSection } from './sections/OverviewSection';
import { ProfileSection } from './sections/ProfileSection';
import { FamilySection } from './sections/FamilySection';
import { AssignmentSection } from './sections/AssignmentSection';
import { StructuralRoleSection } from './sections/StructuralRoleSection';
import { TransferHistorySection } from './sections/TransferHistorySection';
import { CompetenciesSection } from './sections/CompetenciesSection';
import { ExternalInvolvementSection } from './sections/ExternalInvolvementSection';
import { PastoralSection } from './sections/PastoralSection';
import { ServicePeriodSection } from './sections/ServicePeriodSection';
import { ServiceFieldSection } from './sections/ServiceFieldSection';
import { ActivitiesSection } from './sections/ActivitiesSection';

import { WorkspaceErrorBoundary } from '../common/WorkspaceErrorBoundary';

interface PersonWorkspaceShellProps {
  person: UnifiedPersonData;
}

export const PersonWorkspaceShell: React.FC<PersonWorkspaceShellProps> = ({ person }) => {
  // Pass through UI Anti-Corruption Layer (Adapter)
  const vm = useMemo(() => adaptPersonToViewModel(person), [person]);

  // Determine server-provided Person Type (ADR-04 progressive disclosure)
  const roleLabelLower = (person.overview?.current_role_label || '').toLowerCase();
  const personType: 'PENDETA' | 'PELAYAN' | 'RELAWAN' = 
    roleLabelLower.includes('pendeta') || roleLabelLower.includes('pj')
      ? 'PENDETA'
      : roleLabelLower.includes('pelayan') || roleLabelLower.includes('presbiter') || roleLabelLower.includes('diaken') || roleLabelLower.includes('penatua')
      ? 'PELAYAN'
      : 'RELAWAN';

  const isSelfPerson = (person as any)._meta?.is_self === true || (person as any).is_self === true;
  const assignmentSummary = `${person.overview?.current_organization_name || 'GPIB'}${person.overview?.current_role_label ? ` · ${person.overview.current_role_label}` : ''}`;

  return (
    <WorkspaceErrorBoundary>
      <div className="min-h-screen bg-[#0B1220] pb-20 space-y-6">
      {/* 1. Header (Identity-First Banner) */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <PersonHeader 
          header={vm.header} 
          isSelfPerson={isSelfPerson}
          personType={personType}
          assignmentSummary={assignmentSummary}
        />
      </div>

      {/* 2. Single Top Sticky Anchor Bar (Mobile-first PWA Nav) */}
      <div className="max-w-5xl mx-auto px-4">
        <PersonNavigationAnchor />
      </div>

      {/* 3. Progressive Single Workspace Sections (Strict ADR-04 Matrix per Person Type) */}
      <main className="max-w-5xl mx-auto px-4 space-y-10">
        <OverviewSection overview={vm.overview} />
        <ProfileSection profile={vm.profile} />

        {personType === 'PENDETA' ? (
          <>
            <AssignmentSection roles={vm.roles} />
            <StructuralRoleSection roles={vm.roles} />
            <TransferHistorySection roles={vm.roles} />
            <FamilySection profile={vm.profile} isSelfPerson={isSelfPerson} />
            <CompetenciesSection competencies={vm.competencies} />
            <ExternalInvolvementSection roles={vm.roles} />
            <PastoralSection pastoral={vm.pastoral} />
          </>
        ) : personType === 'PELAYAN' ? (
          <>
            <AssignmentSection roles={vm.roles} />
            <StructuralRoleSection roles={vm.roles} />
            <ServicePeriodSection roles={vm.roles} />
            <CompetenciesSection competencies={vm.competencies} />
            <ActivitiesSection pastoral={vm.pastoral} />
            <PastoralSection pastoral={vm.pastoral} />
          </>
        ) : (
          <>
            <AssignmentSection roles={vm.roles} />
            <ServiceFieldSection roles={vm.roles} />
            <CompetenciesSection competencies={vm.competencies} />
            <ActivitiesSection pastoral={vm.pastoral} />
            <PastoralSection pastoral={vm.pastoral} />
          </>
        )}
      </main>
      </div>
    </WorkspaceErrorBoundary>
  );
};
