'use client';

import React from 'react';
import { PastoralViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { Calendar, Clock } from 'lucide-react';

interface ActivitiesSectionProps {
  pastoral: PastoralViewModel;
}

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({ pastoral }) => {
  return (
    <section id="aktivitas" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Aktivitas &amp; Jadwal Pelayanan
        </h2>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-4">
        {pastoral.upcomingSchedules.type === 'DATA' ? (
          <div className="space-y-3">
            {pastoral.upcomingSchedules.value.map((sch) => (
              <div key={sch.id_jadwal} className="p-3.5 rounded-xl bg-slate-950 border border-border-subtle space-y-1.5">
                <div className="flex items-center justify-between font-bold text-sm text-slate-100 gap-2">
                  <span className="truncate">{sch.nama_kegiatan}</span>
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-sans tabular-nums shrink-0">
                    {sch.tanggal}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                  <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{sch.lokasi}</span>
                </p>
              </div>
            ))}
          </div>
        ) : pastoral.upcomingSchedules.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={pastoral.upcomingSchedules.reason} label={pastoral.upcomingSchedules.label} />
        ) : (
          <p className="text-xs italic text-slate-500 p-4 text-center bg-slate-950 rounded-xl border border-border-subtle">
            {pastoral.upcomingSchedules.label}
          </p>
        )}
      </div>
    </section>
  );
};
