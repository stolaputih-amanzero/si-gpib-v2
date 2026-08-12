'use client';

import React from 'react';
import { RolesViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { Globe } from 'lucide-react';

interface ExternalInvolvementSectionProps {
  roles: RolesViewModel;
}

export const ExternalInvolvementSection: React.FC<ExternalInvolvementSectionProps> = ({ roles }) => {
  return (
    <section id="keterlibatan" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          Keterlibatan Eksternal &amp; Oikumene (`t_keterlibatan_pendeta`)
        </h2>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-3">
        {roles.assignments.type === 'DATA' ? (
          <div className="space-y-2">
            {roles.assignments.value.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-border-subtle text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-100">{item.jabatan}</div>
                  <div className="text-slate-400 mt-0.5">{item.organization_name}</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 text-[11px]">
                  Oikumene / Eksternal
                </span>
              </div>
            ))}
          </div>
        ) : roles.assignments.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={roles.assignments.reason} label={roles.assignments.label} />
        ) : (
          <p className="text-xs italic text-slate-500 p-4 text-center bg-slate-950 rounded-xl border border-border-subtle">
            Belum ada catatan keterlibatan eksternal/oikumene
          </p>
        )}
      </div>
    </section>
  );
};
