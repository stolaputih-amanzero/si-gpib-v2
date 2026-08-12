'use client';

import React from 'react';
import Link from 'next/link';
import { OrganizationPeopleViewModel } from '@/types/organizationViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { Users, User, ArrowUpRight, BadgeCheck } from 'lucide-react';

interface OrgPeopleSectionProps {
  people: OrganizationPeopleViewModel;
}

export const OrgPeopleSection: React.FC<OrgPeopleSectionProps> = ({ people }) => {
  return (
    <section id="people" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-high flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-primary" />
          SDM &amp; Personel Organisasi
        </h2>
      </div>

      <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-5 shadow-xs space-y-4">
        {/* Active KMJ Card */}
        {people.kmj.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={people.kmj.reason} label={people.kmj.label} />
        ) : people.kmj.type === 'DATA' && people.kmj.value ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4" />
              Ketua Majelis Jemaat (KMJ) / Penanggung Jawab Aktif
            </div>
            <Link 
              href={`/people/${people.kmj.value.id_person}`}
              className="flex items-center justify-between group text-sm font-bold text-text-high hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors min-h-[44px]"
              aria-label={`Buka profil ${people.kmj.value.nama_lengkap}`}
            >
              <span>{people.kmj.value.nama_lengkap}</span>
              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            </Link>
          </div>
        ) : (
          <p className="text-xs text-text-disabled italic">Belum ada KMJ aktif terdaftar.</p>
        )}

        {/* Pelayan List */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Daftar Pelayan &amp; Pendeta Jemaat
          </div>

          {people.pelayanList.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={people.pelayanList.reason} label={people.pelayanList.label} />
          ) : people.pelayanList.type === 'EMPTY' ? (
            <p className="text-xs text-text-disabled italic py-2">{people.pelayanList.label}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {people.pelayanList.value.map((person) => (
                <Link
                  key={person.id_person}
                  href={`/people/${person.id_person}`}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border-subtle hover:border-brand-primary/40 hover:bg-surface-sunken transition-all group min-h-[56px]"
                  aria-label={`Buka profil ${person.nama_lengkap}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted shrink-0 border border-border-subtle">
                      <User className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-text-high group-hover:text-brand-primary truncate transition-colors">
                        {person.nama_lengkap}
                      </div>
                      <div className="text-xs text-text-muted">
                        {person.role_label}
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-brand-primary shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
