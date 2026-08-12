'use client';

import React from 'react';
import { RolesViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { Layers } from 'lucide-react';

interface ServiceFieldSectionProps {
  roles: RolesViewModel;
}

export const ServiceFieldSection: React.FC<ServiceFieldSectionProps> = ({ roles }) => {
  return (
    <section id="bidang" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-high flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-primary" />
          Bidang Pelayanan &amp; Penugasan Relawan
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
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 text-[11px]">
                  {asg.role_type || 'Relawan'}
                </span>
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
