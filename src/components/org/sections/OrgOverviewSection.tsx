'use client';

import React from 'react';
import { OrganizationOverviewViewModel } from '@/types/organizationViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { MapPin, Calendar, UserCheck, Building, Users, Globe } from 'lucide-react';

interface OrgOverviewSectionProps {
  overview: OrganizationOverviewViewModel;
}

export const OrgOverviewSection: React.FC<OrgOverviewSectionProps> = ({ overview }) => {
  return (
    <section id="overview" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-2">
          <Building className="size-4 text-amber-600 dark:text-amber-400" />
          <span>Ringkasan Organisasi</span>
        </h2>
      </div>

      <div className="divide-y divide-stone-200/60 dark:divide-stone-800/60 text-sm">
        {/* Lokasi & Alamat */}
        <div className="py-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
          <span className="text-xs font-medium text-ink-secondary flex items-center gap-1.5 shrink-0">
            <MapPin className="size-3.5 text-amber-600 dark:text-amber-400" />
            Lokasi &amp; Alamat Resmi
          </span>
          <div className="sm:text-right">
            {overview.alamat.type === 'PRIVACY_MASKED' ? (
              <PrivacyStateNotice reason={overview.alamat.reason} label={overview.alamat.label} />
            ) : overview.alamat.type === 'EMPTY' ? (
              <span className="text-ink-tertiary italic text-xs">{overview.alamat.label}</span>
            ) : (
              <span className="text-xs font-medium text-ink-primary leading-relaxed">
                {overview.alamat.value}
              </span>
            )}
          </div>
        </div>

        {/* Koordinat Geolocation */}
        {overview.geolocation.type === 'DATA' && (
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
            <span className="text-xs font-medium text-ink-secondary flex items-center gap-1.5 shrink-0">
              <Globe className="size-3.5 text-ink-tertiary" />
              Koordinat GPS
            </span>
            <span className="font-mono text-xs text-ink-primary sm:text-right">
              {overview.geolocation.value.latitude.toFixed(6)}, {overview.geolocation.value.longitude.toFixed(6)}
            </span>
          </div>
        )}

        {/* Tanggal Berdiri */}
        <div className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
          <span className="text-xs font-medium text-ink-secondary flex items-center gap-1.5 shrink-0">
            <Calendar className="size-3.5 text-amber-600 dark:text-amber-400" />
            Tanggal Berdiri
          </span>
          {overview.tglBerdiri.type === 'DATA' ? (
            <span className="font-semibold text-xs text-ink-primary font-sans tabular-nums sm:text-right">
              {overview.tglBerdiri.value}
            </span>
          ) : (
            <span className="text-ink-tertiary italic text-xs sm:text-right">{overview.tglBerdiri.label}</span>
          )}
        </div>

        {/* KMJ / Penanggung Jawab */}
        <div className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
          <span className="text-xs font-medium text-ink-secondary flex items-center gap-1.5 shrink-0">
            <UserCheck className="size-3.5 text-amber-600 dark:text-amber-400" />
            KMJ / Penanggung Jawab
          </span>
          {overview.kmjNama.type === 'DATA' ? (
            <span className="font-bold text-xs text-amber-700 dark:text-amber-400 sm:text-right">
              {overview.kmjNama.value}
            </span>
          ) : (
            <span className="text-ink-tertiary italic text-xs sm:text-right">{overview.kmjNama.label}</span>
          )}
        </div>

        {/* Total Pelayan Terdaftar */}
        <div className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
          <span className="text-xs font-medium text-ink-secondary flex items-center gap-1.5 shrink-0">
            <Users className="size-3.5 text-ink-tertiary" />
            Total Pelayan Terdaftar
          </span>
          {overview.totalPelayanCount.type === 'DATA' ? (
            <span className="font-bold text-xs text-ink-primary font-sans tabular-nums sm:text-right">
              {overview.totalPelayanCount.value} orang
            </span>
          ) : (
            <span className="text-ink-tertiary italic text-xs sm:text-right">{overview.totalPelayanCount.label}</span>
          )}
        </div>
      </div>
    </section>
  );
};
