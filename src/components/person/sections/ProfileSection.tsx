'use client';

import React from 'react';
import { ProfileViewModel, FieldRenderState } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { User, Phone, Mail, MapPin, Calendar, ShieldCheck, MapPinned } from 'lucide-react';

interface ProfileSectionProps {
  profile: ProfileViewModel;
}

function renderFieldRow(label: string, icon: React.ReactNode, state: FieldRenderState<any>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-sunken gap-2 border border-border-subtle min-h-[44px]">
      <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
        {icon}
        <span>{label}</span>
      </div>
      
      {state.type === 'DATA' ? (
        <span className="text-sm font-semibold text-text-high font-sans tabular-nums">{String(state.value)}</span>
      ) : state.type === 'PRIVACY_MASKED' ? (
        <PrivacyStateNotice reason={state.reason} label={state.label} compact />
      ) : (
        <span className="text-xs italic text-text-disabled">{state.label}</span>
      )}
    </div>
  );
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile }) => {
  return (
    <section id="profile" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-high flex items-center gap-2">
          <User className="w-5 h-5 text-brand-primary" />
          Data Pribadi &amp; Kontak
        </h2>
      </div>

      <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Informasi Data Pribadi</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {profile.gender && renderFieldRow('Jenis Kelamin', <User className="w-3.5 h-3.5 text-brand-primary" />, profile.gender)}
          {renderFieldRow('Tempat Lahir', <MapPinned className="w-3.5 h-3.5 text-brand-primary" />, profile.tempatLahir)}
          {renderFieldRow('Tanggal Lahir & Umur', <Calendar className="w-3.5 h-3.5 text-brand-primary" />, profile.tanggalLahir)}
          {profile.nik && renderFieldRow('No. KTP (NIK)', <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />, profile.nik)}
          {renderFieldRow('No. WhatsApp / HP', <Phone className="w-3.5 h-3.5 text-brand-primary" />, profile.noHp)}
          {renderFieldRow('Email Resmi', <Mail className="w-3.5 h-3.5 text-brand-primary" />, profile.email)}
          {renderFieldRow('Alamat Tinggal', <MapPin className="w-3.5 h-3.5 text-brand-primary" />, profile.alamatTinggal)}
        </div>
      </div>
    </section>
  );
};
