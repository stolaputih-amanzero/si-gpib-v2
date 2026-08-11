'use client';

import React from 'react';
import Link from 'next/link';
import { OrganizationAssetsViewModel } from '@/types/organizationViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { Building, ArrowUpRight, Box, Landmark } from 'lucide-react';

interface OrgAssetsSectionProps {
  assets: OrganizationAssetsViewModel;
}

export const OrgAssetsSection: React.FC<OrgAssetsSectionProps> = ({ assets }) => {
  return (
    <section id="assets" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-500" />
          Proyeksi Kapabilitas Aset
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        {/* Aggregate Stats Bar */}
        {assets.totalCount.type === 'DATA' && (
          <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs text-slate-500 font-medium">Tanah</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {assets.totalTanah.type === 'DATA' ? assets.totalTanah.value : 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Bangunan</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {assets.totalBangunan.type === 'DATA' ? assets.totalBangunan.value : 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Bergerak</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {assets.totalBergerak.type === 'DATA' ? assets.totalBergerak.value : 0}
              </div>
            </div>
          </div>
        )}

        {/* Item Projections */}
        {assets.items.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={assets.items.reason} label={assets.items.label} />
        ) : assets.items.type === 'EMPTY' ? (
          <p className="text-sm text-slate-400 italic text-center py-4">{assets.items.label}</p>
        ) : (
          <div className="space-y-2">
            {assets.items.value.map((item) => (
              <Link
                key={item.id_asset}
                href={`/assets/${item.id_asset}`}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    {item.kategori === 'tanah' ? <Landmark className="w-4 h-4" /> : <Box className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                      {item.nama_aset}
                    </div>
                    <div className="text-xs text-slate-400">
                      Kategori: <span className="capitalize">{item.kategori}</span> {item.kondisi ? `• Kondisi: ${item.kondisi}` : ''}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
