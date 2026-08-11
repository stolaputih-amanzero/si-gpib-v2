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
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-500" />
          Overview & Ringkasan Aset
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Nama & Kategori Card */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              Identitas Utama Aset
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-700/50">
              <span className="text-slate-500">Nama Resmi Aset</span>
              {overview.namaAset.type === 'DATA' ? (
                <span className="font-semibold text-slate-900 dark:text-slate-100">{overview.namaAset.value}</span>
              ) : (
                <span className="text-slate-400 italic text-xs">{overview.namaAset.label}</span>
              )}
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Kategori Identitas</span>
              {overview.kategori.type === 'DATA' ? (
                <span className="font-semibold text-blue-600 dark:text-blue-400 capitalize">{overview.kategori.value}</span>
              ) : (
                <span className="text-slate-400 italic text-xs">{overview.kategori.label}</span>
              )}
            </div>
          </div>

          {/* Kepemilikan Organisasi Card */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              Konteks Kepemilikan Organisasi
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-700/50">
              <span className="text-slate-500">Organisasi Pemilik</span>
              {overview.namaOrganisasi.type === 'DATA' ? (
                <span className="font-semibold text-slate-900 dark:text-slate-100">{overview.namaOrganisasi.value}</span>
              ) : (
                <span className="text-slate-400 italic text-xs">{overview.namaOrganisasi.label}</span>
              )}
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Tingkat Hirarki</span>
              {overview.orgLevel.type === 'DATA' ? (
                <span className="font-medium text-slate-700 dark:text-slate-300">{overview.orgLevel.value.replace('_', ' ')}</span>
              ) : (
                <span className="text-slate-400 italic text-xs">{overview.orgLevel.label}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
