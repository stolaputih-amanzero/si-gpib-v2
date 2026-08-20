'use client';

import React from 'react';
import { RolesViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { Globe, Building2 } from 'lucide-react';

interface ExternalInvolvementSectionProps {
  roles: RolesViewModel;
}

export const ExternalInvolvementSection: React.FC<ExternalInvolvementSectionProps> = ({ roles }) => {
  return (
    <section id="keterlibatan" className="scroll-mt-36 md:scroll-mt-28 space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-text-high flex items-center gap-2">
          <Globe className="w-4 h-4 text-brand-primary" />
          Keterlibatan Oikumene &amp; Eksternal
        </h2>
      </div>

      <div className="bg-surface-elevated border border-border-subtle rounded-2xl shadow-xs overflow-hidden">
        {roles.assignments.type === 'DATA' ? (
          <div className="divide-y divide-border-subtle/60">
            {roles.assignments.value.map((item, idx) => (
              <div key={idx} className="p-4 sm:p-5 hover:bg-surface-sunken/30 transition-colors flex justify-between items-center gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-text-high">{item.jabatan}</div>
                  <div className="text-xs text-text-muted flex items-center gap-1">
                    <Building2 className="size-3" />
                    <span>{item.organization_name}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-brand-primary/10 text-brand-primary font-bold border border-brand-primary/20 text-xs shrink-0">
                  Oikumene / Eksternal
                </span>
              </div>
            ))}
          </div>
        ) : roles.assignments.type === 'PRIVACY_MASKED' ? (
          <div className="p-5">
            <PrivacyStateNotice reason={roles.assignments.reason} label={roles.assignments.label} />
          </div>
        ) : (
          <p className="text-xs italic text-text-disabled p-5 text-center">
            Belum ada catatan keterlibatan eksternal/oikumene
          </p>
        )}
      </div>
    </section>
  );
};
