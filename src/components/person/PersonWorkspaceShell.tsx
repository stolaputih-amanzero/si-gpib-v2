'use client';

import React, { useMemo } from 'react';
import { UnifiedPersonData } from '../../types/person.types';
import { adaptPersonToViewModel } from '../../adapters/personViewModelAdapter';
import { PersonHeader } from './PersonHeader';
import { PersonNavigationAnchor } from './PersonNavigationAnchor';
import { OverviewSection } from './sections/OverviewSection';
import { ProfileSection } from './sections/ProfileSection';
import { RolesSection } from './sections/RolesSection';
import { CompetenciesSection } from './sections/CompetenciesSection';
import { PastoralSection } from './sections/PastoralSection';

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

      {/* 3. Progressive Single Workspace Sections (PR-03 ADR-04 Matrix) */}
      <main className="max-w-5xl mx-auto px-4 space-y-10">
        {/* Ringkasan Overview */}
        <OverviewSection overview={vm.overview} />

        {/* Profil Section */}
        <ProfileSection profile={vm.profile} isSelfPerson={isSelfPerson} />

        {/* Penugasan & Peran */}
        <RolesSection roles={vm.roles} />

        {/* Kompetensi (A-1 Neutrality W-6) */}
        <CompetenciesSection competencies={vm.competencies} />

        {/* Pastoral & Aktivitas Pelayanan */}
        <PastoralSection pastoral={vm.pastoral} />
      </main>
    </div>
  );
};
