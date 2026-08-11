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
    <section id="competencies" className="scroll-mt-24 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <GraduationCap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Kapasitas & Kompetensi SDM</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Skills Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" />
            <span>Keahlian (Skills)</span>
          </h3>

          {competencies.skills.type === 'DATA' ? (
            <div className="flex flex-wrap gap-1.5">
              {competencies.skills.value.map((skill, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
          ) : competencies.skills.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={competencies.skills.reason} label={competencies.skills.label} />
          ) : (
            <p className="text-xs italic text-slate-400 p-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              {competencies.skills.label}
            </p>
          )}
        </div>

        {/* Education Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Pendidikan Formal</span>
          </h3>

          {competencies.education.type === 'DATA' ? (
            <div className="space-y-2">
              {competencies.education.value.map((edu, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs space-y-0.5 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="font-bold text-slate-900 dark:text-slate-100">{edu.jenjang} {edu.jurusan ? `- ${edu.jurusan}` : ''}</p>
                  <p className="text-slate-500">{edu.institusi} {edu.tahun_lulus ? `(${edu.tahun_lulus})` : ''}</p>
                </div>
              ))}
            </div>
          ) : competencies.education.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={competencies.education.reason} label={competencies.education.label} />
          ) : (
            <p className="text-xs italic text-slate-400 p-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              {competencies.education.label}
            </p>
          )}
        </div>

        {/* Certifications Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Sertifikasi & Pelatihan</span>
          </h3>

          {competencies.certifications.type === 'DATA' ? (
            <div className="space-y-2">
              {competencies.certifications.value.map((cert, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs space-y-0.5 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="font-bold text-slate-900 dark:text-slate-100">{cert.nama_sertifikasi}</p>
                  <p className="text-slate-500">{cert.penerbit} ({cert.tahun})</p>
                </div>
              ))}
            </div>
          ) : competencies.certifications.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={competencies.certifications.reason} label={competencies.certifications.label} />
          ) : (
            <p className="text-xs italic text-slate-400 p-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              {competencies.certifications.label}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
