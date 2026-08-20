'use client';

import React from 'react';
import { ProfileViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { Users, PhoneCall, ShieldCheck, Heart } from 'lucide-react';

interface FamilySectionProps {
  profile: ProfileViewModel;
  isSelfPerson?: boolean;
}

export const FamilySection: React.FC<FamilySectionProps> = ({ profile, isSelfPerson = false }) => {
  return (
    <section id="keluarga" className="scroll-mt-36 md:scroll-mt-28 space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-text-high flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-primary" />
          Data Keluarga &amp; Kontak Darurat
        </h2>
        {isSelfPerson && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            Pribadi (Privat)
          </span>
        )}
      </div>

      <div className="bg-surface-elevated border border-border-subtle rounded-2xl shadow-xs overflow-hidden divide-y divide-border-subtle/60">
        {/* Data Anggota Keluarga */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Anggota Keluarga Terdaftar</span>
          </div>

          {profile.keluarga.type === 'DATA' ? (
            <div className="divide-y divide-border-subtle/40 -mx-4 sm:-mx-5 px-4 sm:px-5">
              {profile.keluarga.value.map((member, idx) => (
                <div key={member.id_keluarga || `kel-${idx}`} className="py-2.5 flex justify-between items-center text-xs">
                  <span className="font-bold text-text-high text-sm">{member.nama_anggota}</span>
                  <span className="text-text-muted font-medium bg-surface-sunken px-2.5 py-1 rounded-md border border-border-subtle">{member.hubungan}</span>
                </div>
              ))}
            </div>
          ) : profile.keluarga.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={profile.keluarga.reason} label={profile.keluarga.label} />
          ) : (
            <p className="text-xs italic text-text-disabled py-2">
              {profile.keluarga.label}
            </p>
          )}
        </div>

        {/* Kontak Darurat */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
            <PhoneCall className="w-3.5 h-3.5 text-brand-primary" />
            <span>Kontak Darurat</span>
          </div>

          {profile.kontakDarurat.type === 'DATA' ? (
            <div className="divide-y divide-border-subtle/40 -mx-4 sm:-mx-5 px-4 sm:px-5">
              {profile.kontakDarurat.value.map((contact, i) => (
                <div key={contact.nama || `contact-${i}`} className="py-2.5 flex justify-between items-center text-xs">
                  <span className="font-bold text-text-high text-sm">{contact.nama} ({contact.hubungan})</span>
                  <span className="text-brand-primary font-sans tabular-nums font-bold bg-brand-primary/10 px-2.5 py-1 rounded-md border border-brand-primary/20">{contact.no_telp}</span>
                </div>
              ))}
            </div>
          ) : profile.kontakDarurat.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={profile.kontakDarurat.reason} label={profile.kontakDarurat.label} />
          ) : (
            <p className="text-xs italic text-text-disabled py-2">
              {profile.kontakDarurat.label}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
