'use client';

import React from 'react';
import { AssetOverviewViewModel } from '@/types/assetViewModel.types';
import { Building, MapPin, Tag } from 'lucide-react';

interface AssetOverviewSectionProps {
  overview: AssetOverviewViewModel;
}

export const AssetOverviewSection: React.FC<AssetOverviewSectionProps> = ({ overview }) => {
  return (
    <section id="overview" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Building className="size-4 text-blue-600 dark:text-blue-400" />
          <span>Ringkasan Identitas &amp; Kepemilikan Aset</span>
        </h2>
      </div>

      <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-sm">
        {/* Nama Resmi Aset */}
        <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
            <Tag className="size-3.5 text-blue-600 dark:text-blue-400" />
            Nama Resmi Aset
          </span>
          {overview.namaAset.type === 'DATA' ? (
            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 sm:text-right">
              {overview.namaAset.value}
            </span>
          ) : (
            <span className="text-slate-400 italic text-xs sm:text-right">{overview.namaAset.label}</span>
          )}
        </div>

        {/* Kategori Identitas */}
        <div className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
            <Tag className="size-3.5 text-slate-400" />
            Kategori Aset
          </span>
          {overview.kategori.type === 'DATA' ? (
            <span className="font-semibold text-xs text-blue-600 dark:text-blue-400 capitalize sm:text-right">
              {overview.kategori.value}
            </span>
          ) : (
            <span className="text-slate-400 italic text-xs sm:text-right">{overview.kategori.label}</span>
          )}
        </div>

        {/* Organisasi Pemilik */}
        <div className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
            <MapPin className="size-3.5 text-blue-600 dark:text-blue-400" />
            Organisasi Pemilik
          </span>
          {overview.namaOrganisasi.type === 'DATA' ? (
            <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 sm:text-right">
              {overview.namaOrganisasi.value}
            </span>
          ) : (
            <span className="text-slate-400 italic text-xs sm:text-right">{overview.namaOrganisasi.label}</span>
          )}
        </div>

        {/* Tingkat Hirarki */}
        <div className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
            <Building className="size-3.5 text-slate-400" />
            Tingkat Hirarki
          </span>
          {overview.orgLevel.type === 'DATA' ? (
            <span className="font-medium text-xs text-slate-700 dark:text-slate-300 sm:text-right">
              {overview.orgLevel.value.replace('_', ' ')}
            </span>
          ) : (
            <span className="text-slate-400 italic text-xs sm:text-right">{overview.orgLevel.label}</span>
          )}
        </div>
      </div>
    </section>
  );
};
