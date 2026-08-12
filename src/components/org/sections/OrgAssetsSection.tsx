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
        <h2 className="text-lg font-bold text-text-high flex items-center gap-2">
          <Building className="w-5 h-5 text-brand-primary" />
          Aset &amp; Properti Organisasi
        </h2>
      </div>

      <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-5 shadow-xs space-y-4">
        {/* Aggregate Stats Bar */}
        {assets.totalCount.type === 'DATA' && (
          <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-surface-sunken border border-border-subtle">
            <div>
              <div className="text-xs text-text-muted font-medium">Tanah</div>
              <div className="text-base font-bold text-text-high font-sans tabular-nums">
                {assets.totalTanah.type === 'DATA' ? assets.totalTanah.value : 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-muted font-medium">Bangunan</div>
              <div className="text-base font-bold text-text-high font-sans tabular-nums">
                {assets.totalBangunan.type === 'DATA' ? assets.totalBangunan.value : 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-muted font-medium">Bergerak</div>
              <div className="text-base font-bold text-text-high font-sans tabular-nums">
                {assets.totalBergerak.type === 'DATA' ? assets.totalBergerak.value : 0}
              </div>
            </div>
          </div>
        )}

        {/* Item Projections */}
        {assets.items.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={assets.items.reason} label={assets.items.label} />
        ) : assets.items.type === 'EMPTY' ? (
          <p className="text-sm text-text-disabled italic text-center py-4">{assets.items.label}</p>
        ) : (
          <div className="space-y-2">
            {assets.items.value.map((item) => (
              <Link
                key={item.id_asset}
                href={`/assets/${item.id_asset}`}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border-subtle hover:border-brand-primary/40 hover:bg-surface-sunken transition-all group min-h-[56px]"
                aria-label={`Buka detail aset ${item.nama_aset}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 border border-brand-primary/20">
                    {item.kategori === 'tanah' ? <Landmark className="w-4 h-4" /> : <Box className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-text-high group-hover:text-brand-primary truncate transition-colors">
                      {item.nama_aset}
                    </div>
                    <div className="text-xs text-text-muted">
                      Kategori: <span className="capitalize">{item.kategori}</span> {item.kondisi ? `• Kondisi: ${item.kondisi}` : ''}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-brand-primary shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
