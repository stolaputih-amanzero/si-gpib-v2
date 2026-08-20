'use client';

import React from 'react';
import { RolesViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { Briefcase, CheckCircle2, Building2 } from 'lucide-react';

interface AssignmentSectionProps {
  roles: RolesViewModel;
}

export const AssignmentSection: React.FC<AssignmentSectionProps> = ({ roles }) => {
  return (
    <section id="roles" className="scroll-mt-36 md:scroll-mt-28 space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-text-high flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-brand-primary" />
          Penugasan Pelayanan
        </h2>
      </div>

      <div className="bg-surface-elevated border border-border-subtle rounded-2xl shadow-xs overflow-hidden">
        {roles.assignments.type === 'DATA' ? (
          <div className="divide-y divide-border-subtle/60">
            {roles.assignments.value.map((asg) => (
              <div 
                key={asg.id_assignment}
                className="p-4 sm:p-5 hover:bg-surface-sunken/30 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded border border-brand-primary/20">
                    {asg.role_type}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                    asg.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-surface-sunken text-text-muted border-border-subtle'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {asg.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm sm:text-base font-bold text-text-high">{asg.jabatan}</p>
                  <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                    <Building2 className="size-3" />
                    <span>{asg.organization_name}</span>
                  </p>
                </div>
                
                {asg.start_date && (
                  <p className="text-[11px] text-text-muted font-sans tabular-nums">
                    TMT: {asg.start_date} {asg.end_date ? `s.d. ${asg.end_date}` : '(Sekarang)'}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : roles.assignments.type === 'PRIVACY_MASKED' ? (
          <div className="p-5">
            <PrivacyStateNotice reason={roles.assignments.reason} label={roles.assignments.label} />
          </div>
        ) : (
          <p className="text-xs italic text-text-disabled p-5 text-center">
            {roles.assignments.label}
          </p>
        )}
      </div>
    </section>
  );
};
