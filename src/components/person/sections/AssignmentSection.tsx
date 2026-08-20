'use client';

import React from 'react';
import { RolesViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { Briefcase, CheckCircle2 } from 'lucide-react';

interface AssignmentSectionProps {
  roles: RolesViewModel;
}

export const AssignmentSection: React.FC<AssignmentSectionProps> = ({ roles }) => {
  return (
    <section id="roles" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-high flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-brand-primary" />
          Penugasan Pelayanan
        </h2>
      </div>

      <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-3">
        {roles.assignments.type === 'DATA' ? (
          <div className="space-y-2.5">
            {roles.assignments.value.map((asg) => (
              <div 
                key={asg.id_assignment}
                className="p-3.5 rounded-xl bg-surface-sunken border border-border-subtle space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded border border-brand-primary/20">
                    {asg.role_type}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                    asg.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-surface-elevated text-text-muted border-border-subtle'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {asg.status}
                  </span>
                </div>

                <p className="text-sm font-bold text-text-high">{asg.jabatan}</p>
                <p className="text-xs text-text-muted">{asg.organization_name}</p>
                
                {asg.start_date && (
                  <p className="text-[11px] text-text-muted pt-1 font-sans tabular-nums">
                    TMT: {asg.start_date} {asg.end_date ? `s.d. ${asg.end_date}` : '(Sekarang)'}
                  </p>
                )}
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
