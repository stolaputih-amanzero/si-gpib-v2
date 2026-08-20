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
    <div className="flex items-center justify-between py-3.5 px-4 sm:px-6 hover:bg-surface-sunken/30 transition-colors">
      <div className="flex items-center gap-3 text-xs font-semibold text-text-muted shrink-0">
        <div className="size-8 rounded-lg bg-surface-sunken flex items-center justify-center text-text-secondary border border-border-subtle/50">
          {icon}
        </div>
        <span className="text-text-secondary">{label}</span>
      </div>
      
      <div className="text-right min-w-0 pl-4">
        {state.type === 'DATA' ? (
          <span className="text-xs sm:text-sm font-bold text-text-high font-sans tabular-nums truncate block">
            {String(state.value)}
          </span>
        ) : state.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={state.reason} label={state.label} compact />
        ) : (
          <span className="text-xs italic text-text-disabled">{state.label}</span>
        )}
      </div>
    </div>
  );
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile }) => {
  return (
    <section id="profile" className="scroll-mt-36 md:scroll-mt-28 space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-text-high flex items-center gap-2">
          <User className="w-4 h-4 text-brand-primary" />
          Data Pribadi &amp; Kontak
        </h2>
      </div>

      <div className="bg-surface-elevated border border-border-subtle rounded-2xl shadow-xs overflow-hidden divide-y divide-border-subtle/60">
        {profile.gender && renderFieldRow('Jenis Kelamin', <User className="w-4 h-4 text-brand-primary" />, profile.gender)}
        {renderFieldRow('Tempat Lahir', <MapPinned className="w-4 h-4 text-brand-primary" />, profile.tempatLahir)}
        {renderFieldRow('Tanggal Lahir & Umur', <Calendar className="w-4 h-4 text-brand-primary" />, profile.tanggalLahir)}
        {profile.nik && renderFieldRow('No. KTP (NIK)', <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />, profile.nik)}
        {renderFieldRow('No. WhatsApp / HP', <Phone className="w-4 h-4 text-brand-primary" />, profile.noHp)}
        {renderFieldRow('Email Resmi', <Mail className="w-4 h-4 text-brand-primary" />, profile.email)}
        {renderFieldRow('Alamat Tinggal', <MapPin className="w-4 h-4 text-brand-primary" />, profile.alamatTinggal)}
      </div>
    </section>
  );
};
