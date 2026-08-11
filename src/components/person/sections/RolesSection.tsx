'use client';

import React from 'react';
import { RolesViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { Briefcase, History, CheckCircle2, ArrowRight } from 'lucide-react';

interface RolesSectionProps {
  roles: RolesViewModel;
}

export const RolesSection: React.FC<RolesSectionProps> = ({ roles }) => {
  return (
    <section id="roles" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Penugasan & Peran Organisasi</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assignments Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Penugasan Aktif & Riwayat Peran</span>
            </h3>
          </div>

          {roles.assignments.type === 'DATA' ? (
            <div className="space-y-2.5">
              {roles.assignments.value.map((asg) => (
                <div 
                  key={asg.id_assignment}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-2 py-0.5 rounded border border-primary-200 dark:border-primary-800">
                      {asg.role_type}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      asg.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {asg.status}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{asg.jabatan}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{asg.organization_name}</p>
                  
                  {asg.start_date && (
                    <p className="text-[11px] text-slate-400 pt-1">
                      TMT: {asg.start_date} {asg.end_date ? `s.d. ${asg.end_date}` : '(Sekarang)'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : roles.assignments.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={roles.assignments.reason} label={roles.assignments.label} />
          ) : (
            <p className="text-xs italic text-slate-400 p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              {roles.assignments.label}
            </p>
          )}
        </div>

        {/* Mutation History Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Mutasi & Perpindahan</span>
          </h3>

          {roles.mutations.type === 'DATA' ? (
            <div className="space-y-2">
              {roles.mutations.value.map((mut) => (
                <div key={mut.id_mutasi} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold">{mut.jenis_mutasi}</span>
                    <span>{mut.tanggal_mutasi}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                    <span>{mut.asal_organisasi}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{mut.tujuan_organisasi}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : roles.mutations.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={roles.mutations.reason} label={roles.mutations.label} />
          ) : (
            <p className="text-xs italic text-slate-400 p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              {roles.mutations.label}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
