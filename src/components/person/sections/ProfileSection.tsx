'use client';

import React from 'react';
import { ProfileViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { User, Phone, Mail, MapPin, Calendar, Users, PhoneCall } from 'lucide-react';
import { FieldRenderState } from '../../../types/personViewModel.types';

interface ProfileSectionProps {
  profile: ProfileViewModel;
}

function renderFieldRow(label: string, icon: React.ReactNode, state: FieldRenderState<any>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 gap-2 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      
      {state.type === 'DATA' ? (
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{String(state.value)}</span>
      ) : state.type === 'PRIVACY_MASKED' ? (
        <PrivacyStateNotice reason={state.reason} label={state.label} compact />
      ) : (
        <span className="text-xs italic text-slate-400">{state.label}</span>
      )}
    </div>
  );
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile }) => {
  return (
    <section id="profile" className="scroll-mt-24 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Profil & Data Kontak</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sub-Card 1: Data Pribadi & Kontak */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Kontak & Demografi</h3>
          
          <div className="space-y-2">
            {renderFieldRow('No. WhatsApp / HP', <Phone className="w-3.5 h-3.5 text-slate-400" />, profile.noHp)}
            {renderFieldRow('Email', <Mail className="w-3.5 h-3.5 text-slate-400" />, profile.email)}
            {renderFieldRow('Tanggal Lahir', <Calendar className="w-3.5 h-3.5 text-slate-400" />, profile.tanggalLahir)}
            {renderFieldRow('Alamat Tinggal', <MapPin className="w-3.5 h-3.5 text-slate-400" />, profile.alamatTinggal)}
          </div>
        </div>

        {/* Sub-Card 2: Keluarga & Kontak Darurat */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Keluarga & Kontak Darurat</h3>
          
          {/* Keluarga Node */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Data Keluarga</span>
            </div>

            {profile.keluarga.type === 'DATA' ? (
              <div className="space-y-1.5">
                {profile.keluarga.value.map((member) => (
                  <div key={member.id_keluarga} className="text-xs p-2 rounded bg-slate-50 dark:bg-slate-800 flex justify-between">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{member.nama_anggota}</span>
                    <span className="text-slate-500">{member.hubungan}</span>
                  </div>
                ))}
              </div>
            ) : profile.keluarga.type === 'PRIVACY_MASKED' ? (
              <PrivacyStateNotice reason={profile.keluarga.reason} label={profile.keluarga.label} />
            ) : (
              <p className="text-xs italic text-slate-400 p-2 border border-dashed border-slate-200 dark:border-slate-800 rounded">
                {profile.keluarga.label}
              </p>
            )}
          </div>

          {/* Kontak Darurat Node */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
              <span>Kontak Darurat</span>
            </div>

            {profile.kontakDarurat.type === 'DATA' ? (
              <div className="space-y-1.5">
                {profile.kontakDarurat.value.map((contact, i) => (
                  <div key={i} className="text-xs p-2 rounded bg-slate-50 dark:bg-slate-800 flex justify-between">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{contact.nama} ({contact.hubungan})</span>
                    <span className="text-slate-500">{contact.no_telp}</span>
                  </div>
                ))}
              </div>
            ) : profile.kontakDarurat.type === 'PRIVACY_MASKED' ? (
              <PrivacyStateNotice reason={profile.kontakDarurat.reason} label={profile.kontakDarurat.label} />
            ) : (
              <p className="text-xs italic text-slate-400 p-2 border border-dashed border-slate-200 dark:border-slate-800 rounded">
                {profile.kontakDarurat.label}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
