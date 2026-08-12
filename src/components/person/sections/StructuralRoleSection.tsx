'use client';

import React from 'react';
import { RolesViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { Award } from 'lucide-react';

interface StructuralRoleSectionProps {
  roles: RolesViewModel;
}

export const StructuralRoleSection: React.FC<StructuralRoleSectionProps> = ({ roles }) => {
  return (
    <section id="jabatan" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-high flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-primary" />
          Jabatan Struktural &amp; Penunjukan (`t_jabatan_struktural`)
        </h2>
      </div>

      <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-3">
        {roles.assignments.type === 'DATA' ? (
          <div className="space-y-2">
            {roles.assignments.value.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-surface-sunken border border-border-subtle text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-text-high">{item.jabatan}</div>
                  <div className="text-text-muted mt-0.5">{item.organization_name}</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20 text-[11px]">
                  {item.role_type}
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
