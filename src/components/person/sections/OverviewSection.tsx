'use client';

import React from 'react';
import { OverviewViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { LayoutDashboard, Building, Activity, ShieldCheck, HeartHandshake } from 'lucide-react';

interface OverviewSectionProps {
  overview: OverviewViewModel;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ overview }) => {
  return (
    <section id="overview" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-high flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-brand-primary" />
          Ringkasan (Overview)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Current Role Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
            <Building className="w-4 h-4 text-brand-primary" />
            <span>Jabatan &amp; Organisasi</span>
          </div>
          {overview.currentRoleLabel.type === 'DATA' ? (
            <div>
              <p className="text-base font-bold text-text-high">
                {overview.currentRoleLabel.value}
              </p>
              {overview.organizationName.type === 'DATA' && (
                <p className="text-xs text-text-muted mt-0.5">{overview.organizationName.value}</p>
              )}
            </div>
          ) : (
            <p className="text-sm italic text-text-disabled">Belum ada jabatan</p>
          )}
        </div>

        {/* Active Status Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
            <Activity className="w-4 h-4 text-brand-primary" />
            <span>Status Layanan</span>
          </div>
          {overview.isActive.type === 'DATA' ? (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              overview.isActive.value ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-surface-sunken text-text-muted border-border-subtle'
            }`}>
              {overview.isActive.value ? '● Aktif Layanan' : '○ Tidak Aktif'}
            </span>
          ) : overview.isActive.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={overview.isActive.reason} label={overview.isActive.label} compact />
          ) : (
            <p className="text-xs text-text-disabled">Status tidak tersedia</p>
          )}
        </div>

        {/* Pastoral Activity Count Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4 text-brand-primary" />
            <span>Aktivitas Pastoral</span>
          </div>
          {overview.recentPastoralCount.type === 'DATA' ? (
            <p className="text-base font-bold text-text-high font-sans tabular-nums">
              {overview.recentPastoralCount.value} Kegiatan
            </p>
          ) : overview.recentPastoralCount.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={overview.recentPastoralCount.reason} label={overview.recentPastoralCount.label} compact />
          ) : (
            <p className="text-xs text-text-disabled">0 Kegiatan</p>
          )}
        </div>

        {/* Affiliation Origin */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-brand-primary" />
            <span>Afiliasi Organisasi</span>
          </div>
          {overview.affiliationOrigin.type === 'DATA' ? (
            <p className="text-base font-bold text-text-high">
              {overview.affiliationOrigin.value}
            </p>
          ) : (
            <p className="text-xs text-text-disabled">Organik GPIB</p>
          )}
        </div>
      </div>
    </section>
  );
};
