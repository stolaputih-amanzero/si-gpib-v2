'use client';

import React from 'react';
import { OrganizationOverviewViewModel } from '@/types/organizationViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { MapPin, Calendar, UserCheck, Building, Users } from 'lucide-react';

interface OrgOverviewSectionProps {
  overview: OrganizationOverviewViewModel;
}

export const OrgOverviewSection: React.FC<OrgOverviewSectionProps> = ({ overview }) => {
  return (
    <section id="overview" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-high flex items-center gap-2">
          <Building className="w-5 h-5 text-brand-primary" />
          Ringkasan Organisasi
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alamat & Geolocation Card */}
        <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-brand-primary" />
            Lokasi &amp; Alamat Resmi
          </div>
          
          {overview.alamat.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={overview.alamat.reason} label={overview.alamat.label} />
          ) : overview.alamat.type === 'EMPTY' ? (
            <p className="text-sm text-text-disabled italic">{overview.alamat.label}</p>
          ) : (
            <p className="text-sm text-text-high font-medium leading-relaxed">
              {overview.alamat.value}
            </p>
          )}

          {overview.geolocation.type === 'DATA' && (
            <div className="text-xs font-sans tabular-nums text-text-muted bg-surface-sunken p-2.5 rounded-xl border border-border-subtle">
              Lat: {overview.geolocation.value.latitude.toFixed(6)}, Long: {overview.geolocation.value.longitude.toFixed(6)}
            </div>
          )}
        </div>

        {/* Status Operasional & Tanggal Berdiri Card */}
        <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-brand-primary" />
            Informasi Pendirian &amp; Statistik
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border-subtle">
              <span className="text-text-muted">Tanggal Berdiri</span>
              {overview.tglBerdiri.type === 'DATA' ? (
                <span className="font-semibold text-text-high font-sans tabular-nums">{overview.tglBerdiri.value}</span>
              ) : (
                <span className="text-text-disabled italic text-xs">{overview.tglBerdiri.label}</span>
              )}
            </div>

            <div className="flex justify-between items-center py-2 border-b border-border-subtle">
              <span className="text-text-muted">KMJ / Penanggung Jawab</span>
              {overview.kmjNama.type === 'DATA' ? (
                <span className="font-semibold text-brand-primary flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  {overview.kmjNama.value}
                </span>
              ) : (
                <span className="text-text-disabled italic text-xs">{overview.kmjNama.label}</span>
              )}
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-text-muted">Total Pelayan Terdaftar</span>
              {overview.totalPelayanCount.type === 'DATA' ? (
                <span className="font-bold text-text-high flex items-center gap-1 font-sans tabular-nums">
                  <Users className="w-3.5 h-3.5 text-text-muted" />
                  {overview.totalPelayanCount.value} orang
                </span>
              ) : (
                <span className="text-text-disabled italic text-xs">{overview.totalPelayanCount.label}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
