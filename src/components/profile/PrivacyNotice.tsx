'use client';

import { Lock, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PrivacyNoticeProps {
  sectionName?: 'keluarga' | 'biometric' | 'aktivitas' | 'umum';
  message?: string;
  className?: string;
}

const DEFAULT_MESSAGES = {
  keluarga: 'Data keluarga bersifat privat dan hanya dapat diakses oleh pemilik akun dan Super User Sinode.',
  biometric: 'Informasi perangkat biometrik bersifat rahasia dan hanya terlihat oleh pemilik akun.',
  aktivitas: 'Jejak aktivitas akun bersifat privat untuk keamanan dan hanya dapat diakses oleh pemilik akun dan Super User Sinode.',
  umum: 'Bagian ini bersifat terbatas untuk menjaga privasi pengguna.',
};

export function PrivacyNotice({ sectionName = 'umum', message, className }: PrivacyNoticeProps) {
  const displayMessage = message || DEFAULT_MESSAGES[sectionName] || DEFAULT_MESSAGES.umum;

  return (
    <div
      className={cn(
        'p-4 rounded-2xl bg-surface-sunken/60 border border-border-subtle text-text-muted text-xs flex items-start gap-3 shadow-2xs',
        className
      )}
    >
      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-500/20">
        <Lock size={16} />
      </div>
      <div className="space-y-0.5 pt-0.5 min-w-0 flex-1">
        <h4 className="font-extrabold text-xs text-text-high flex items-center gap-1.5">
          <ShieldAlert size={13} className="text-amber-500" />
          <span>Privasi Dibatasi</span>
        </h4>
        <p className="leading-relaxed text-text-muted">{displayMessage}</p>
      </div>
    </div>
  );
}

export default PrivacyNotice;
