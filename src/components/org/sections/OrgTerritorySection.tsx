'use client';

import React from 'react';
import { OrganizationTerritoryViewModel } from '@/types/organizationViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { Map, AlertTriangle, Lightbulb } from 'lucide-react';

interface OrgTerritorySectionProps {
  territory: OrganizationTerritoryViewModel;
}

export const OrgTerritorySection: React.FC<OrgTerritorySectionProps> = ({ territory }) => {
  return (
    <section id="territory" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-high flex items-center gap-2">
          <Map className="w-5 h-5 text-brand-primary" />
          Wilayah, Potensi &amp; Kerawanan
        </h2>
      </div>

      <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-5 shadow-xs space-y-5">
        {/* Kerawanan Wilayah */}
        <div className="space-y-2 pt-3 border-t border-border-subtle">
          <div className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Kerawanan Wilayah
          </div>

          {territory.kerawanan.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={territory.kerawanan.reason} label={territory.kerawanan.label} />
          ) : territory.kerawanan.type === 'EMPTY' ? (
            <p className="text-xs text-text-disabled italic py-1">{territory.kerawanan.label}</p>
          ) : (
            <div className="space-y-2">
              {territory.kerawanan.value.map((k) => (
                <div key={k.id_risiko} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex justify-between items-center min-h-[44px]">
                  <span className="font-bold text-text-high">{k.jenis_risiko || k.kategori || 'Risiko Wilayah'}</span>
                  <span className="text-amber-500 text-[11px] font-bold uppercase tracking-wider">{k.frekuensi || 'Rutin'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Potensi Wilayah */}
        <div className="space-y-2 pt-3 border-t border-border-subtle">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4" />
            Potensi Pelayanan &amp; SDA/SDM
          </div>

          {territory.potensi.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={territory.potensi.reason} label={territory.potensi.label} />
          ) : territory.potensi.type === 'EMPTY' ? (
            <p className="text-xs text-text-disabled italic py-1">{territory.potensi.label}</p>
          ) : (
            <div className="space-y-2">
              {territory.potensi.value.map((p) => (
                <div key={p.id_potensi} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="font-bold text-text-high">{p.nama_potensi || 'Potensi Wilayah'}</div>
                  {p.deskripsi && <div className="text-text-muted mt-1">{p.deskripsi}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
