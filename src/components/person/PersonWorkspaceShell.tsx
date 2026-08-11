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

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16 space-y-6">
      {/* 1. Header (Identity-First Banner) */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <PersonHeader header={vm.header} />
      </div>

      {/* 2. Single Top Sticky Anchor Bar (Mobile-first PWA Nav) */}
      <div className="max-w-6xl mx-auto px-4">
        <PersonNavigationAnchor />
      </div>

      {/* 3. Progressive Single Workspace Sections */}
      <main className="max-w-6xl mx-auto px-4 space-y-10">
        <OverviewSection overview={vm.overview} />
        <ProfileSection profile={vm.profile} />
        <RolesSection roles={vm.roles} />
        <CompetenciesSection competencies={vm.competencies} />
        <PastoralSection pastoral={vm.pastoral} />
      </main>
    </div>
  );
};
