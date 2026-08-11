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
    <section id="people" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Proyeksi SDM & Pelayan Organisasi
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        {/* Active KMJ Card */}
        {people.kmj.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={people.kmj.reason} label={people.kmj.label} />
        ) : people.kmj.type === 'DATA' && people.kmj.value ? (
          <div className="p-3.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4" />
              Ketua Majelis Jemaat (KMJ) Aktif
            </div>
            <Link 
              href={`/dashboard/people/${people.kmj.value.id_person}`}
              className="flex items-center justify-between group text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <span>{people.kmj.value.nama_lengkap}</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </Link>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Belum ada KMJ aktif terdaftar.</p>
        )}

        {/* Pelayan List */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Daftar Pelayan & Pendeta Jemaat
          </div>

          {people.pelayanList.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={people.pelayanList.reason} label={people.pelayanList.label} />
          ) : people.pelayanList.type === 'EMPTY' ? (
            <p className="text-xs text-slate-400 italic py-2">{people.pelayanList.label}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {people.pelayanList.value.map((person) => (
                <Link
                  key={person.id_person}
                  href={`/dashboard/people/${person.id_person}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {person.nama_lengkap}
                      </div>
                      <div className="text-xs text-slate-400">
                        {person.role_label}
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
