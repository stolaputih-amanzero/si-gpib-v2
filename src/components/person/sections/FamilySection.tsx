'use client';

import React from 'react';
import { ProfileViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { Users, PhoneCall, ShieldCheck } from 'lucide-react';

interface FamilySectionProps {
  profile: ProfileViewModel;
  isSelfPerson?: boolean;
}

export const FamilySection: React.FC<FamilySectionProps> = ({ profile, isSelfPerson = false }) => {
  return (
    <section id="keluarga" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          Keluarga &amp; Kontak Darurat (`t_keluarga_pendeta`)
        </h2>
        {isSelfPerson && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Pribadi (Privat)
          </span>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-4">
        {/* Data Anggota Keluarga */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Anggota Keluarga Terdaftar</span>
          </div>

          {profile.keluarga.type === 'DATA' ? (
            <div className="space-y-2">
              {profile.keluarga.value.map((member, idx) => (
                <div key={member.id_keluarga || `kel-${idx}`} className="text-xs p-3.5 rounded-xl bg-slate-950 border border-border-subtle flex justify-between items-center">
                  <span className="font-bold text-slate-100">{member.nama_anggota}</span>
                  <span className="text-slate-400 font-medium">{member.hubungan}</span>
                </div>
              ))}
            </div>
          ) : profile.keluarga.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={profile.keluarga.reason} label={profile.keluarga.label} />
          ) : (
            <p className="text-xs italic text-slate-500 p-3 bg-slate-950 rounded-xl border border-border-subtle text-center">
              {profile.keluarga.label}
            </p>
          )}
        </div>

        {/* Kontak Darurat */}
        <div className="space-y-2 pt-3 border-t border-border-subtle">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
            <span>Kontak Darurat</span>
          </div>

          {profile.kontakDarurat.type === 'DATA' ? (
            <div className="space-y-2">
              {profile.kontakDarurat.value.map((contact, i) => (
                <div key={contact.nama || `contact-${i}`} className="text-xs p-3.5 rounded-xl bg-slate-950 border border-border-subtle flex justify-between items-center">
                  <span className="font-bold text-slate-100">{contact.nama} ({contact.hubungan})</span>
                  <span className="text-slate-400 font-sans tabular-nums font-medium">{contact.no_telp}</span>
                </div>
              ))}
            </div>
          ) : profile.kontakDarurat.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={profile.kontakDarurat.reason} label={profile.kontakDarurat.label} />
          ) : (
            <p className="text-xs italic text-slate-500 p-3 bg-slate-950 rounded-xl border border-border-subtle text-center">
              {profile.kontakDarurat.label}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
