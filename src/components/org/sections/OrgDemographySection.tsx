'use client';

import React from 'react';
import { OrganizationDemographyViewModel } from '@/types/organizationViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { Users } from 'lucide-react';

interface OrgDemographySectionProps {
  demography: OrganizationDemographyViewModel;
}

export const OrgDemographySection: React.FC<OrgDemographySectionProps> = ({ demography }) => {
  return (
    <section id="demografi" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          Demografi Pelkat (`t_demografi_pelkat`)
        </h2>
      </div>

      <div className="bg-slate-900/90 border border-border-subtle rounded-2xl p-5 shadow-xs">
        {demography.demografi.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={demography.demografi.reason} label={demography.demografi.label} />
        ) : demography.demografi.type === 'EMPTY' ? (
          <p className="text-sm text-slate-500 italic text-center py-4">{demography.demografi.label}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {demography.demografi.value.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-border-subtle space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {item.kategori_pelkat}
                </div>
                <div className="text-sm font-bold text-slate-100 font-sans tabular-nums flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-medium">KK: {item.jml_kk || 0}</span>
                  <span className="text-blue-400">L: {item.laki || 0} • P: {item.perempuan || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
