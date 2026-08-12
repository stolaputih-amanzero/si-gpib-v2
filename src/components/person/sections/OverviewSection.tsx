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
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-blue-400" />
          Ringkasan (Overview)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Current Role Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Building className="w-4 h-4 text-blue-400" />
            <span>Jabatan &amp; Organisasi</span>
          </div>
          {overview.currentRoleLabel.type === 'DATA' ? (
            <div>
              <p className="text-base font-bold text-slate-100">
                {overview.currentRoleLabel.value}
              </p>
              {overview.organizationName.type === 'DATA' && (
                <p className="text-xs text-slate-400 mt-0.5">{overview.organizationName.value}</p>
              )}
            </div>
          ) : (
            <p className="text-sm italic text-slate-500">Belum ada jabatan</p>
          )}
        </div>

        {/* Active Status Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Status Layanan</span>
          </div>
          {overview.isActive.type === 'DATA' ? (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              overview.isActive.value ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {overview.isActive.value ? '● Aktif Layanan' : '○ Tidak Aktif'}
            </span>
          ) : overview.isActive.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={overview.isActive.reason} label={overview.isActive.label} compact />
          ) : (
            <p className="text-xs text-slate-500">Status tidak tersedia</p>
          )}
        </div>

        {/* Pastoral Activity Count Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4 text-blue-400" />
            <span>Aktivitas Pastoral</span>
          </div>
          {overview.recentPastoralCount.type === 'DATA' ? (
            <p className="text-base font-bold text-slate-100 font-sans tabular-nums">
              {overview.recentPastoralCount.value} Kegiatan
            </p>
          ) : overview.recentPastoralCount.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={overview.recentPastoralCount.reason} label={overview.recentPastoralCount.label} compact />
          ) : (
            <p className="text-xs text-slate-500">0 Kegiatan</p>
          )}
        </div>

        {/* Affiliation Origin */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Afiliasi Organisasi</span>
          </div>
          {overview.affiliationOrigin.type === 'DATA' ? (
            <p className="text-base font-bold text-slate-100">
              {overview.affiliationOrigin.value}
            </p>
          ) : (
            <p className="text-xs text-slate-500">Organik GPIB</p>
          )}
        </div>
      </div>
    </section>
  );
};
