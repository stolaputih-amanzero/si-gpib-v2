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
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-blue-400" />
          Periode Pelayanan Presbiter / Pelayan
        </h2>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-3">
        {roles.assignments.type === 'DATA' ? (
          <div className="space-y-2">
            {roles.assignments.value.map((asg) => (
              <div key={asg.id_assignment} className="p-3.5 rounded-xl bg-slate-950 border border-border-subtle text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-100">{asg.jabatan}</div>
                  <div className="text-slate-400 mt-0.5">{asg.organization_name}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-400 font-sans tabular-nums block">
                    {asg.start_date || 'Aktif'}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-sans tabular-nums">
                    {asg.end_date ? `s.d. ${asg.end_date}` : 'Periode Berjalan'}
                  </span>
                </div>
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
