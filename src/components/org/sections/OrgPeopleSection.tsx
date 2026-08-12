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
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          SDM &amp; Personel Organisasi
        </h2>
      </div>

      <div className="bg-slate-900/90 border border-border-subtle rounded-2xl p-5 shadow-xs space-y-4">
        {/* Active KMJ Card */}
        {people.kmj.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={people.kmj.reason} label={people.kmj.label} />
        ) : people.kmj.type === 'DATA' && people.kmj.value ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4" />
              Ketua Majelis Jemaat (KMJ) / Penanggung Jawab Aktif
            </div>
            <Link 
              href={`/people/${people.kmj.value.id_person}`}
              className="flex items-center justify-between group text-sm font-bold text-slate-100 hover:text-emerald-400 transition-colors min-h-[44px]"
              aria-label={`Buka profil ${people.kmj.value.nama_lengkap}`}
            >
              <span>{people.kmj.value.nama_lengkap}</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </Link>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Belum ada KMJ aktif terdaftar.</p>
        )}

        {/* Pelayan List */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Daftar Pelayan &amp; Pendeta Jemaat
          </div>

          {people.pelayanList.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={people.pelayanList.reason} label={people.pelayanList.label} />
          ) : people.pelayanList.type === 'EMPTY' ? (
            <p className="text-xs text-slate-500 italic py-2">{people.pelayanList.label}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {people.pelayanList.value.map((person) => (
                <Link
                  key={person.id_person}
                  href={`/people/${person.id_person}`}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border-subtle hover:border-blue-500/40 hover:bg-slate-800/60 transition-all group min-h-[56px]"
                  aria-label={`Buka profil ${person.nama_lengkap}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 border border-slate-700/60">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-100 group-hover:text-blue-400 truncate transition-colors">
                        {person.nama_lengkap}
                      </div>
                      <div className="text-xs text-slate-400">
                        {person.role_label}
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
