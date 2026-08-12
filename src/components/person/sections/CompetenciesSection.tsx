'use client';

import React from 'react';
import { CompetenciesViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { GraduationCap, Award, Wrench } from 'lucide-react';

interface CompetenciesSectionProps {
  competencies: CompetenciesViewModel;
}

export const CompetenciesSection: React.FC<CompetenciesSectionProps> = ({ competencies }) => {
  return (
    <section id="competencies" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-400" />
          Kapasitas &amp; Kompetensi SDM (`t_kompetensi_pendeta`)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Skills Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-blue-400" />
            <span>Keahlian &amp; Spesialisasi</span>
          </h3>

          {competencies.skills.type === 'DATA' ? (
            <div className="flex flex-wrap gap-1.5">
              {competencies.skills.value.map((skill, i) => {
                const label = typeof skill === 'string' ? skill : (skill as any)?.nama || String(skill);
                return (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-xs font-bold text-blue-400 border border-blue-500/20">
                    {label}
                  </span>
                );
              })}
            </div>
          ) : competencies.skills.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={competencies.skills.reason} label={competencies.skills.label} />
          ) : (
            <p className="text-xs italic text-slate-500 p-3 text-center bg-slate-950 rounded-xl border border-border-subtle">
              {competencies.skills.label}
            </p>
          )}
        </div>

        {/* Education Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span>Pendidikan Formal</span>
          </h3>

          {competencies.education.type === 'DATA' ? (
            <div className="space-y-2">
              {competencies.education.value.map((edu, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 text-xs space-y-0.5 border border-border-subtle">
                  <p className="font-bold text-slate-100">{edu.jenjang} {edu.jurusan ? `- ${edu.jurusan}` : ''}</p>
                  <p className="text-slate-400">{edu.institusi} {edu.tahun_lulus ? `(${edu.tahun_lulus})` : ''}</p>
                </div>
              ))}
            </div>
          ) : competencies.education.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={competencies.education.reason} label={competencies.education.label} />
          ) : (
            <p className="text-xs italic text-slate-500 p-3 text-center bg-slate-950 rounded-xl border border-border-subtle">
              {competencies.education.label}
            </p>
          )}
        </div>

        {/* Certifications Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-blue-400" />
            <span>Sertifikasi &amp; Pelatihan</span>
          </h3>

          {competencies.certifications.type === 'DATA' ? (
            <div className="space-y-2">
              {competencies.certifications.value.map((cert, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 text-xs space-y-0.5 border border-border-subtle">
                  <p className="font-bold text-slate-100">{cert.nama_sertifikasi}</p>
                  <p className="text-slate-400">{cert.penerbit} ({cert.tahun})</p>
                </div>
              ))}
            </div>
          ) : competencies.certifications.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={competencies.certifications.reason} label={competencies.certifications.label} />
          ) : (
            <p className="text-xs italic text-slate-500 p-3 text-center bg-slate-950 rounded-xl border border-border-subtle">
              {competencies.certifications.label}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
