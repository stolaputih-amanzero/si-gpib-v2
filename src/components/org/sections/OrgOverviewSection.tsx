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
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-400" />
          Ringkasan Organisasi
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alamat & Geolocation Card */}
        <div className="bg-slate-900/90 border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-blue-400" />
            Lokasi &amp; Alamat Resmi
          </div>
          
          {overview.alamat.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={overview.alamat.reason} label={overview.alamat.label} />
          ) : overview.alamat.type === 'EMPTY' ? (
            <p className="text-sm text-slate-500 italic">{overview.alamat.label}</p>
          ) : (
            <p className="text-sm text-slate-200 font-medium leading-relaxed">
              {overview.alamat.value}
            </p>
          )}

          {overview.geolocation.type === 'DATA' && (
            <div className="text-xs font-sans tabular-nums text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-border-subtle">
              Lat: {overview.geolocation.value.latitude.toFixed(6)}, Long: {overview.geolocation.value.longitude.toFixed(6)}
            </div>
          )}
        </div>

        {/* Status Operasional & Tanggal Berdiri Card */}
        <div className="bg-slate-900/90 border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-blue-400" />
            Informasi Pendirian &amp; Statistik
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border-subtle">
              <span className="text-slate-400">Tanggal Berdiri</span>
              {overview.tglBerdiri.type === 'DATA' ? (
                <span className="font-semibold text-slate-100 font-sans tabular-nums">{overview.tglBerdiri.value}</span>
              ) : (
                <span className="text-slate-500 italic text-xs">{overview.tglBerdiri.label}</span>
              )}
            </div>

            <div className="flex justify-between items-center py-2 border-b border-border-subtle">
              <span className="text-slate-400">KMJ / Penanggung Jawab</span>
              {overview.kmjNama.type === 'DATA' ? (
                <span className="font-semibold text-blue-400 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  {overview.kmjNama.value}
                </span>
              ) : (
                <span className="text-slate-500 italic text-xs">{overview.kmjNama.label}</span>
              )}
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400">Total Pelayan Terdaftar</span>
              {overview.totalPelayanCount.type === 'DATA' ? (
                <span className="font-bold text-slate-100 flex items-center gap-1 font-sans tabular-nums">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {overview.totalPelayanCount.value} orang
                </span>
              ) : (
                <span className="text-slate-500 italic text-xs">{overview.totalPelayanCount.label}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
