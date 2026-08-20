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
    <section id="competencies" className="scroll-mt-36 md:scroll-mt-28 space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-text-high flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-brand-primary" />
          Kapasitas &amp; Kompetensi
        </h2>
      </div>

      <div className="bg-surface-elevated border border-border-subtle rounded-2xl shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-subtle/60">
          {/* Skills Column */}
          <div className="p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-brand-primary" />
              <span>Keahlian &amp; Spesialisasi</span>
            </h3>

            {competencies.skills.type === 'DATA' ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {competencies.skills.value.map((skill, i) => {
                  const label = typeof skill === 'string' ? skill : (skill as any)?.nama || String(skill);
                  return (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-brand-primary/10 text-xs font-bold text-brand-primary border border-brand-primary/20">
                      {label}
                    </span>
                  );
                })}
              </div>
            ) : competencies.skills.type === 'PRIVACY_MASKED' ? (
              <PrivacyStateNotice reason={competencies.skills.reason} label={competencies.skills.label} />
            ) : (
              <p className="text-xs italic text-text-disabled py-2">
                {competencies.skills.label}
              </p>
            )}
          </div>

          {/* Education Column */}
          <div className="p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-brand-primary" />
              <span>Pendidikan Formal</span>
            </h3>

            {competencies.education.type === 'DATA' ? (
              <div className="space-y-2.5 pt-1">
                {competencies.education.value.map((edu, i) => (
                  <div key={i} className="text-xs space-y-0.5 pb-2 border-b border-border-subtle/40 last:border-0 last:pb-0">
                    <p className="font-bold text-text-high text-sm">{edu.jenjang} {edu.jurusan ? `- ${edu.jurusan}` : ''}</p>
                    <p className="text-text-muted">{edu.institusi} {edu.tahun_lulus ? `(${edu.tahun_lulus})` : ''}</p>
                  </div>
                ))}
              </div>
            ) : competencies.education.type === 'PRIVACY_MASKED' ? (
              <PrivacyStateNotice reason={competencies.education.reason} label={competencies.education.label} />
            ) : (
              <p className="text-xs italic text-text-disabled py-2">
                {competencies.education.label}
              </p>
            )}
          </div>

          {/* Certifications Column */}
          <div className="p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-brand-primary" />
              <span>Sertifikasi &amp; Pelatihan</span>
            </h3>

            {competencies.certifications.type === 'DATA' ? (
              <div className="space-y-2.5 pt-1">
                {competencies.certifications.value.map((cert, i) => (
                  <div key={i} className="text-xs space-y-0.5 pb-2 border-b border-border-subtle/40 last:border-0 last:pb-0">
                    <p className="font-bold text-text-high text-sm">{cert.nama_sertifikasi}</p>
                    <p className="text-text-muted">{cert.penerbit} ({cert.tahun})</p>
                  </div>
                ))}
              </div>
            ) : competencies.certifications.type === 'PRIVACY_MASKED' ? (
              <PrivacyStateNotice reason={competencies.certifications.reason} label={competencies.certifications.label} />
            ) : (
              <p className="text-xs italic text-text-disabled py-2">
                {competencies.certifications.label}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
