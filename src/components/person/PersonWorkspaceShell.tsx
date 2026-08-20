'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { UnifiedPersonData } from '../../types/person.types';
import { adaptPersonToViewModel } from '../../adapters/personViewModelAdapter';
import { PersonHeader } from './PersonHeader';
import { PersonNavigationAnchor, TabItem } from './PersonNavigationAnchor';
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
import { ForensicWatermark } from '@/components/security/ForensicWatermark';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  LayoutDashboard, 
  Users
} from 'lucide-react';

interface PersonWorkspaceShellProps {
  person: UnifiedPersonData;
  isSelfPerson?: boolean;
}

export const PersonWorkspaceShell: React.FC<PersonWorkspaceShellProps> = ({ person, isSelfPerson: isSelfProp }) => {
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

  const isSelfPerson = Boolean(
    isSelfProp ||
    (person as any)._meta?.is_self === true || 
    (person as any).is_self === true
  );
  const assignmentSummary = `${person.overview?.current_organization_name || 'GPIB'}${person.overview?.current_role_label ? ` · ${person.overview.current_role_label}` : ''}`;

  // Define dynamic tabs per Person Type
  const tabs: TabItem[] = useMemo(() => {
    if (personType === 'PENDETA') {
      return [
        { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard className="size-4" /> },
        { id: 'profile', label: 'Profil Pribadi', icon: <User className="size-4" /> },
        { id: 'roles', label: 'Penugasan & Mutasi', icon: <Briefcase className="size-4" /> },
        { id: 'family', label: 'Data Keluarga', icon: <Users className="size-4" /> },
        { id: 'competencies', label: 'Kompetensi', icon: <GraduationCap className="size-4" /> },
        { id: 'pastoral', label: 'Aktivitas Pastoral', icon: <BookOpen className="size-4" /> },
      ];
    } else if (personType === 'PELAYAN') {
      return [
        { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard className="size-4" /> },
        { id: 'profile', label: 'Profil Pribadi', icon: <User className="size-4" /> },
        { id: 'roles', label: 'Penugasan & Periode', icon: <Briefcase className="size-4" /> },
        { id: 'competencies', label: 'Kompetensi', icon: <GraduationCap className="size-4" /> },
        { id: 'pastoral', label: 'Aktivitas Pelayanan', icon: <BookOpen className="size-4" /> },
      ];
    } else {
      return [
        { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard className="size-4" /> },
        { id: 'profile', label: 'Profil Pribadi', icon: <User className="size-4" /> },
        { id: 'roles', label: 'Bidang Pelayanan', icon: <Briefcase className="size-4" /> },
        { id: 'competencies', label: 'Kompetensi', icon: <GraduationCap className="size-4" /> },
        { id: 'pastoral', label: 'Aktivitas Pos', icon: <BookOpen className="size-4" /> },
      ];
    }
  }, [personType]);

  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || 'overview');

  // Handle URL hash sync on load & change
  useEffect(() => {
    const rawHash = window.location.hash.replace('#', '');
    if (rawHash && tabs.some((t) => t.id === rawHash)) {
      setActiveTab(rawHash);
    }
  }, [tabs]);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `#${tabId}`);
    const navEl = document.getElementById('person-workspace-content');
    if (navEl) {
      navEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <WorkspaceErrorBoundary>
      <div className="min-h-screen bg-surface-base pb-24 space-y-6 relative select-none">
        {/* DLP Security Forensic Watermark */}
        <ForensicWatermark label="DOKUMEN SDM RESMI GPIB" />

        {/* 1. Header (Identity-First Banner) */}
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <PersonHeader 
            header={vm.header}
            personRaw={person}
            isSelfPerson={isSelfPerson}
            personType={personType}
            assignmentSummary={assignmentSummary}
          />
        </div>

        {/* 2. Top Sticky Tab Navigation Bar with Integrated Sub-Pagination */}
        <div className="max-w-5xl mx-auto px-4">
          <PersonNavigationAnchor 
            tabs={tabs}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
          />
        </div>

        {/* 3. Main Workspace: Active Tab Only */}
        <main id="person-workspace-content" className="max-w-5xl mx-auto px-4 space-y-6 scroll-mt-24">
          
          {/* Active Tab Content Rendering */}
          <div className="animate-in fade-in-50 duration-200">
            {activeTab === 'overview' && (
              <OverviewSection overview={vm.overview} />
            )}

            {activeTab === 'profile' && (
              <ProfileSection profile={vm.profile} />
            )}

            {activeTab === 'roles' && (
              <div className="space-y-6">
                <AssignmentSection roles={vm.roles} />
                <StructuralRoleSection roles={vm.roles} />
                {personType === 'PENDETA' ? (
                  <TransferHistorySection roles={vm.roles} />
                ) : personType === 'PELAYAN' ? (
                  <ServicePeriodSection roles={vm.roles} />
                ) : (
                  <ServiceFieldSection roles={vm.roles} />
                )}
              </div>
            )}

            {activeTab === 'family' && (
              <FamilySection profile={vm.profile} isSelfPerson={isSelfPerson} />
            )}

            {activeTab === 'competencies' && (
              <div className="space-y-6">
                <CompetenciesSection competencies={vm.competencies} />
                {personType === 'PENDETA' && (
                  <ExternalInvolvementSection roles={vm.roles} />
                )}
              </div>
            )}

            {activeTab === 'pastoral' && (
              <div className="space-y-6">
                {personType !== 'PENDETA' && (
                  <ActivitiesSection pastoral={vm.pastoral} />
                )}
                <PastoralSection pastoral={vm.pastoral} />
              </div>
            )}
          </div>

        </main>
      </div>
    </WorkspaceErrorBoundary>
  );
};
