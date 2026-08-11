'use client';

import { useState } from 'react';
import { LegacyUnifiedPersonData as UnifiedPersonData } from './legacyTypes';
import { User, Activity, MapPin, Briefcase, FileText, ArrowRightLeft, Users, Shield } from 'lucide-react';
import { PersonProfileSection } from './sections/PersonProfileSection';
import { PersonStructuralSection } from './sections/PersonStructuralSection';
import { PersonTransferSection } from './sections/PersonTransferSection';
import { PersonAssignmentSection } from './sections/PersonAssignmentSection';
import { PersonFamilySection } from './sections/PersonFamilySection';
import { PersonCompetencySection } from './sections/PersonCompetencySection';
import { PersonInvolvementSection } from './sections/PersonInvolvementSection';
import { PersonPastoralLogSection } from './sections/PersonPastoralLogSection';

const TABS = [
  { id: 'profile', label: 'Profil Utama', icon: <User size={16} /> },
  { id: 'structural', label: 'Jabatan Struktural', icon: <Briefcase size={16} /> },
  { id: 'transfer', label: 'Riwayat Mutasi', icon: <ArrowRightLeft size={16} /> },
  { id: 'assignment', label: 'Penugasan Pos', icon: <MapPin size={16} /> },
  { id: 'family', label: 'Data Keluarga', icon: <Users size={16} /> },
  { id: 'competency', label: 'Kompetensi', icon: <FileText size={16} /> },
  { id: 'involvement', label: 'Keterlibatan', icon: <Shield size={16} /> },
  { id: 'pastoral', label: 'Log Pastoral', icon: <Activity size={16} /> },
] as const;

type TabId = typeof TABS[number]['id'];

export function PersonWorkspaceClient({ personData }: { personData: UnifiedPersonData }) {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  return (
    <div className="flex flex-col h-full bg-surface-sunken">
      {/* Collapsing Header */}
      <header className="bg-brand-primary pb-6 pt-12 px-4 md:px-8 rounded-b-[2rem] shadow-md relative z-10 sticky top-0">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-4">
          <div className="w-24 h-24 rounded-full bg-white/20 p-1 shrink-0">
            <div className="w-full h-full rounded-full bg-surface-1 flex items-center justify-center overflow-hidden text-brand-primary">
              {personData.avatar_url ? (
                <img src={personData.avatar_url} alt={personData.name} className="w-full h-full object-cover" />
              ) : (
                <User size={40} />
              )}
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1 mt-2 md:mt-0 text-white">
            <h1 className="text-2xl font-black tracking-tight">{personData.name}</h1>
            <p className="text-brand-primary-light font-medium text-sm mt-0.5">
              {personData.nip ? `NIP: ${personData.nip}` : 'NIP tidak tersedia'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider border border-white/30">
                {personData.status}
              </span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10 flex items-center gap-1.5">
                <MapPin size={14} />
                {personData.stats?.pos_aktif || 0} Pos Aktif
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Horizontal Scrollable Tabs */}
      <div className="max-w-4xl mx-auto w-full px-2 mt-4 relative z-0">
        <div className="overflow-x-auto hide-scrollbar -mx-2 px-2 pb-2">
          <div className="flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 text-sm font-bold ${
                  activeTab === tab.id 
                    ? 'bg-surface-1 shadow-2xs text-brand-primary border border-brand-primary/10' 
                    : 'bg-transparent text-text-muted hover:bg-surface-1/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section Content */}
      <main className="flex-1 overflow-y-auto mt-2 pb-24">
        <div className="max-w-4xl mx-auto w-full px-4">
          {activeTab === 'profile' && <PersonProfileSection personData={personData} />}
          {activeTab === 'structural' && <PersonStructuralSection personData={personData} />}
          {activeTab === 'transfer' && <PersonTransferSection personData={personData} />}
          {activeTab === 'assignment' && <PersonAssignmentSection personData={personData} />}
          {activeTab === 'family' && <PersonFamilySection personData={personData} />}
          {activeTab === 'competency' && <PersonCompetencySection personData={personData} />}
          {activeTab === 'involvement' && <PersonInvolvementSection personData={personData} />}
          {activeTab === 'pastoral' && <PersonPastoralLogSection personData={personData} />}
        </div>
      </main>
    </div>
  );
}
