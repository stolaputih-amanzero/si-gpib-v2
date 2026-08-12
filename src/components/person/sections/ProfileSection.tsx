'use client';

import React from 'react';
import { ProfileViewModel, FieldRenderState } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { User, Phone, Mail, MapPin, Calendar } from 'lucide-react';

interface ProfileSectionProps {
  profile: ProfileViewModel;
}

function renderFieldRow(label: string, icon: React.ReactNode, state: FieldRenderState<any>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-950 gap-2 border border-border-subtle min-h-[44px]">
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

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile }) => {
  return (
    <section id="profile" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          Profil &amp; Kontak Utama
        </h2>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Demografi &amp; Akses Kontak</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {renderFieldRow('No. WhatsApp / HP', <Phone className="w-3.5 h-3.5 text-blue-400" />, profile.noHp)}
          {renderFieldRow('Email Resmi', <Mail className="w-3.5 h-3.5 text-blue-400" />, profile.email)}
          {renderFieldRow('Tanggal Lahir', <Calendar className="w-3.5 h-3.5 text-blue-400" />, profile.tanggalLahir)}
          {renderFieldRow('Alamat Tinggal', <MapPin className="w-3.5 h-3.5 text-blue-400" />, profile.alamatTinggal)}
        </div>
      </div>
    </section>
  );
};
