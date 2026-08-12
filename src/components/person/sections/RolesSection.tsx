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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-400" />
          Penugasan &amp; Jabatan Struktural
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assignments Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>Penugasan Aktif (`t_penugasan_pendeta` / `t_pj_jemaat`)</span>
            </h3>
          </div>

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

        {/* Mutation History Card */}
        <div id="mutasi" className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span>Riwayat Mutasi (`t_riwayat_mutasi_pendeta`)</span>
          </h3>

          {roles.mutations.type === 'DATA' ? (
            <div className="space-y-2">
              {roles.mutations.value.map((mut) => (
                <div key={mut.id_mutasi} className="p-3.5 rounded-xl bg-slate-950 border border-border-subtle text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold text-slate-300">{mut.jenis_mutasi}</span>
                    <span className="font-sans tabular-nums">{mut.tanggal_mutasi}</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-slate-100">
                    <span>{mut.asal_organisasi}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{mut.tujuan_organisasi}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : roles.mutations.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={roles.mutations.reason} label={roles.mutations.label} />
          ) : (
            <p className="text-xs italic text-slate-500 p-4 text-center bg-slate-950 rounded-xl border border-border-subtle">
              {roles.mutations.label}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
