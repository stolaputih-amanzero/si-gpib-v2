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
    <section id="overview" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-500" />
          Overview Organisasi
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alamat & Geolocation Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-blue-500" />
            Lokasi & Alamat Resmi
          </div>
          
          {overview.alamat.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={overview.alamat.reason} label={overview.alamat.label} />
          ) : overview.alamat.type === 'EMPTY' ? (
            <p className="text-sm text-slate-400 italic">{overview.alamat.label}</p>
          ) : (
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {overview.alamat.value}
            </p>
          )}

          {overview.geolocation.type === 'DATA' && (
            <div className="text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800">
              Lat: {overview.geolocation.value.latitude.toFixed(6)}, Long: {overview.geolocation.value.longitude.toFixed(6)}
            </div>
          )}
        </div>

        {/* Status Operasional & Tanggal Berdiri Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-blue-500" />
            Informasi Pendirian & Statistik
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Tanggal Berdiri</span>
              {overview.tglBerdiri.type === 'DATA' ? (
                <span className="font-medium text-slate-900 dark:text-slate-100">{overview.tglBerdiri.value}</span>
              ) : (
                <span className="text-slate-400 italic text-xs">{overview.tglBerdiri.label}</span>
              )}
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">KMJ / Penanggung Jawab</span>
              {overview.kmjNama.type === 'DATA' ? (
                <span className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  {overview.kmjNama.value}
                </span>
              ) : (
                <span className="text-slate-400 italic text-xs">{overview.kmjNama.label}</span>
              )}
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-500">Total Pelayan Terdaftar</span>
              {overview.totalPelayanCount.type === 'DATA' ? (
                <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {overview.totalPelayanCount.value} orang
                </span>
              ) : (
                <span className="text-slate-400 italic text-xs">{overview.totalPelayanCount.label}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
