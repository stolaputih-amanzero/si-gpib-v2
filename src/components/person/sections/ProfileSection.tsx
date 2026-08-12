'use client';

import React from 'react';
import { ProfileViewModel, FieldRenderState } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { User, Phone, Mail, MapPin, Calendar, Users, PhoneCall, ShieldCheck } from 'lucide-react';

interface ProfileSectionProps {
  profile: ProfileViewModel;
  isSelfPerson?: boolean;
}

function renderFieldRow(label: string, icon: React.ReactNode, state: FieldRenderState<any>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-950 gap-2 border border-slate-800/80 min-h-[44px]">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      
      {state.type === 'DATA' ? (
        <span className="text-sm font-semibold text-slate-100 font-sans tabular-nums">{String(state.value)}</span>
      ) : state.type === 'PRIVACY_MASKED' ? (
        <PrivacyStateNotice reason={state.reason} label={state.label} compact />
      ) : (
        <span className="text-xs italic text-slate-500">{state.label}</span>
      )}
    </div>
  );
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile, isSelfPerson = false }) => {
  return (
    <section id="profile" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          Profil &amp; Data Kontak
        </h2>
        {isSelfPerson && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Pribadi
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sub-Card 1: Data Pribadi & Kontak */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Kontak &amp; Demografi</h3>
          
          <div className="space-y-2">
            {renderFieldRow('No. WhatsApp / HP', <Phone className="w-3.5 h-3.5 text-blue-400" />, profile.noHp)}
            {renderFieldRow('Email', <Mail className="w-3.5 h-3.5 text-blue-400" />, profile.email)}
            {renderFieldRow('Tanggal Lahir', <Calendar className="w-3.5 h-3.5 text-blue-400" />, profile.tanggalLahir)}
            {renderFieldRow('Alamat Tinggal', <MapPin className="w-3.5 h-3.5 text-blue-400" />, profile.alamatTinggal)}
          </div>
        </div>

        {/* Sub-Card 2: Keluarga & Kontak Darurat */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Keluarga &amp; Kontak Darurat</span>
            {isSelfPerson && (
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Akses Pemilik</span>
            )}
          </h3>
          
          {/* Keluarga Node */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Data Keluarga (`t_keluarga_pendeta`)</span>
            </div>

            {profile.keluarga.type === 'DATA' ? (
              <div className="space-y-2">
                {profile.keluarga.value.map((member, idx) => (
                  <div key={member.id_keluarga || `kel-${idx}`} className="text-xs p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                    <span className="font-bold text-slate-100">{member.nama_anggota}</span>
                    <span className="text-slate-400 font-medium">{member.hubungan}</span>
                  </div>
                ))}
              </div>
            ) : profile.keluarga.type === 'PRIVACY_MASKED' ? (
              <PrivacyStateNotice reason={profile.keluarga.reason} label={profile.keluarga.label} />
            ) : (
              <p className="text-xs italic text-slate-500 p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-center">
                {profile.keluarga.label}
              </p>
            )}
          </div>

          {/* Kontak Darurat Node */}
          <div className="space-y-2 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              <span>Kontak Darurat</span>
            </div>

            {profile.kontakDarurat.type === 'DATA' ? (
              <div className="space-y-2">
                {profile.kontakDarurat.value.map((contact, i) => (
                  <div key={contact.nama || `contact-${i}`} className="text-xs p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                    <span className="font-bold text-slate-100">{contact.nama} ({contact.hubungan})</span>
                    <span className="text-slate-400 font-sans tabular-nums font-medium">{contact.no_telp}</span>
                  </div>
                ))}
              </div>
            ) : profile.kontakDarurat.type === 'PRIVACY_MASKED' ? (
              <PrivacyStateNotice reason={profile.kontakDarurat.reason} label={profile.kontakDarurat.label} />
            ) : (
              <p className="text-xs italic text-slate-500 p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-center">
                {profile.kontakDarurat.label}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
