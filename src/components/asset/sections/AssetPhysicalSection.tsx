'use client';

import React from 'react';
import { AssetPhysicalViewModel } from '@/types/assetViewModel.types';
import { Ruler, CheckCircle } from 'lucide-react';

interface AssetPhysicalSectionProps {
  physical: AssetPhysicalViewModel;
}

export const AssetPhysicalSection: React.FC<AssetPhysicalSectionProps> = ({ physical }) => {
  return (
    <section id="physical" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Ruler className="w-5 h-5 text-blue-500" />
          Spesifikasi & Kondisi Fisik
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {/* Luas Tanah */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 font-medium">Luas Tanah (m²)</div>
            {physical.luasM2.type === 'DATA' ? (
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{physical.luasM2.value} m²</div>
            ) : (
              <div className="text-xs text-slate-400 italic mt-1">{physical.luasM2.label}</div>
            )}
          </div>

          {/* Fungsi Bangunan */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 font-medium">Fungsi Utama</div>
            {physical.fungsi.type === 'DATA' ? (
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{physical.fungsi.value}</div>
            ) : (
              <div className="text-xs text-slate-400 italic mt-1">{physical.fungsi.label}</div>
            )}
          </div>

          {/* Merk / Tipe / Jenis */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 font-medium">Merk / Tipe / Jenis</div>
            {physical.merkTipe.type === 'DATA' ? (
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{physical.merkTipe.value}</div>
            ) : (
              <div className="text-xs text-slate-400 italic mt-1">{physical.merkTipe.label}</div>
            )}
          </div>

          {/* Tahun Perolehan */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 font-medium">Tahun Perolehan</div>
            {physical.thnPerolehan.type === 'DATA' ? (
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{physical.thnPerolehan.value}</div>
            ) : (
              <div className="text-xs text-slate-400 italic mt-1">{physical.thnPerolehan.label}</div>
            )}
          </div>

          {/* Kondisi Fisik */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 col-span-1 sm:col-span-2">
            <div className="text-xs text-slate-500 font-medium">Kondisi Fisik Terakhir</div>
            {physical.kondisi.type === 'DATA' ? (
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                {physical.kondisi.value}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic mt-1">{physical.kondisi.label}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
