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
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <LayoutDashboard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Overview</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Current Role Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Building className="w-4 h-4 text-slate-400" />
            <span>Jabatan & Organisasi</span>
          </div>
          {overview.currentRoleLabel.type === 'DATA' ? (
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {overview.currentRoleLabel.value}
              </p>
              {overview.organizationName.type === 'DATA' && (
                <p className="text-xs text-slate-500">{overview.organizationName.value}</p>
              )}
            </div>
          ) : (
            <p className="text-sm italic text-slate-400">Belum ada jabatan</p>
          )}
        </div>

        {/* Active Status Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Activity className="w-4 h-4 text-slate-400" />
            <span>Status Layanan</span>
          </div>
          {overview.isActive.type === 'DATA' ? (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              overview.isActive.value ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-slate-100 text-slate-700'
            }`}>
              {overview.isActive.value ? '● Aktif Layanan' : '○ Tidak Aktif'}
            </span>
          ) : overview.isActive.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={overview.isActive.reason} label={overview.isActive.label} compact />
          ) : (
            <p className="text-xs text-slate-400">Status tidak tersedia</p>
          )}
        </div>

        {/* Pastoral Activity Count Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <HeartHandshake className="w-4 h-4 text-slate-400" />
            <span>Aktivitas Pastoral</span>
          </div>
          {overview.recentPastoralCount.type === 'DATA' ? (
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {overview.recentPastoralCount.value} Kegiatan
            </p>
          ) : overview.recentPastoralCount.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={overview.recentPastoralCount.reason} label={overview.recentPastoralCount.label} compact />
          ) : (
            <p className="text-xs text-slate-400">0 Kegiatan</p>
          )}
        </div>

        {/* Affiliation Origin */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Afiliasi Organisasi</span>
          </div>
          {overview.affiliationOrigin.type === 'DATA' ? (
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {overview.affiliationOrigin.value}
            </p>
          ) : (
            <p className="text-xs text-slate-400">Organik GPIB</p>
          )}
        </div>
      </div>
    </section>
  );
};
