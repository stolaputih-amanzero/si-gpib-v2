'use client';

import React from 'react';
import { OrganizationTerritoryViewModel } from '@/types/organizationViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { Map, AlertTriangle, Lightbulb, Users } from 'lucide-react';

interface OrgTerritorySectionProps {
  territory: OrganizationTerritoryViewModel;
}

export const OrgTerritorySection: React.FC<OrgTerritorySectionProps> = ({ territory }) => {
  return (
    <section id="territory" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Map className="w-5 h-5 text-blue-500" />
          Proyeksi Wilayah, Potensi & Kerawanan
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-5">
        {/* Demografi Pelkat */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-500" />
            Demografi & Pelkat
          </div>

          {territory.demografi.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={territory.demografi.reason} label={territory.demografi.label} />
          ) : territory.demografi.type === 'EMPTY' ? (
            <p className="text-xs text-slate-400 italic py-1">{territory.demografi.label}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {territory.demografi.value.map((d, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{d.kategori_pelkat}</div>
                  <div className="text-slate-500 mt-1">KK: {d.jml_kk || 0} • L: {d.laki || 0} • P: {d.perempuan || 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kerawanan Wilayah */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Kerawanan Wilayah
          </div>

          {territory.kerawanan.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={territory.kerawanan.reason} label={territory.kerawanan.label} />
          ) : territory.kerawanan.type === 'EMPTY' ? (
            <p className="text-xs text-slate-400 italic py-1">{territory.kerawanan.label}</p>
          ) : (
            <div className="space-y-1.5">
              {territory.kerawanan.value.map((k) => (
                <div key={k.id_risiko} className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 text-xs flex justify-between items-center">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{k.jenis_risiko || k.kategori || 'Risiko Wilayah'}</span>
                  <span className="text-amber-700 dark:text-amber-400 text-[11px] font-semibold">{k.frekuensi || 'Rutin'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Potensi Wilayah */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4" />
            Potensi Pelayanan & SDA/SDM
          </div>

          {territory.potensi.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={territory.potensi.reason} label={territory.potensi.label} />
          ) : territory.potensi.type === 'EMPTY' ? (
            <p className="text-xs text-slate-400 italic py-1">{territory.potensi.label}</p>
          ) : (
            <div className="space-y-1.5">
              {territory.potensi.value.map((p) => (
                <div key={p.id_potensi} className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-xs">
                  <div className="font-medium text-slate-800 dark:text-slate-200">{p.nama_potensi || 'Potensi Wilayah'}</div>
                  {p.deskripsi && <div className="text-slate-500 mt-0.5">{p.deskripsi}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
