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
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-400" />
          Penugasan Organisasi (`t_penugasan_pendeta` / `t_pj_jemaat`)
        </h2>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-3">
        {roles.assignments.type === 'DATA' ? (
          <div className="space-y-2.5">
            {roles.assignments.value.map((asg) => (
              <div 
                key={asg.id_assignment}
                className="p-3.5 rounded-xl bg-slate-950 border border-border-subtle space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                    {asg.role_type}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                    asg.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {asg.status}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-100">{asg.jabatan}</p>
                <p className="text-xs text-slate-400">{asg.organization_name}</p>
                
                {asg.start_date && (
                  <p className="text-[11px] text-slate-400 pt-1 font-sans tabular-nums">
                    TMT: {asg.start_date} {asg.end_date ? `s.d. ${asg.end_date}` : '(Sekarang)'}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : roles.assignments.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={roles.assignments.reason} label={roles.assignments.label} />
        ) : (
          <p className="text-xs italic text-slate-500 p-4 text-center bg-slate-950 rounded-xl border border-border-subtle">
            {roles.assignments.label}
          </p>
        )}
      </div>
    </section>
  );
};
