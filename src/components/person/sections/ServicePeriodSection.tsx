'use client';

import React from 'react';
import { RolesViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { CalendarCheck } from 'lucide-react';

interface ServicePeriodSectionProps {
  roles: RolesViewModel;
}

export const ServicePeriodSection: React.FC<ServicePeriodSectionProps> = ({ roles }) => {
  return (
    <section id="periode" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-high flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-brand-primary" />
          Periode Pelayanan Presbiter / Pelayan
        </h2>
      </div>

      <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-3">
        {roles.assignments.type === 'DATA' ? (
          <div className="space-y-2">
            {roles.assignments.value.map((asg) => (
              <div key={asg.id_assignment} className="p-3.5 rounded-xl bg-surface-sunken border border-border-subtle text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-text-high">{asg.jabatan}</div>
                  <div className="text-text-muted mt-0.5">{asg.organization_name}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-primary font-sans tabular-nums block">
                    {asg.start_date || 'Aktif'}
                  </span>
                  <span className="text-[10px] text-text-disabled block font-sans tabular-nums">
                    {asg.end_date ? `s.d. ${asg.end_date}` : 'Periode Berjalan'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : roles.assignments.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={roles.assignments.reason} label={roles.assignments.label} />
        ) : (
          <p className="text-xs italic text-text-disabled p-4 text-center bg-surface-sunken rounded-xl border border-border-subtle">
            {roles.assignments.label}
          </p>
        )}
      </div>
    </section>
  );
};
