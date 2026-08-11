'use client';

import React from 'react';
import { PastoralViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { HeartHandshake, Calendar, FileText, Lock } from 'lucide-react';

interface PastoralSectionProps {
  pastoral: PastoralViewModel;
}

export const PastoralSection: React.FC<PastoralSectionProps> = ({ pastoral }) => {
  return (
    <section id="pastoral" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <HeartHandshake className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pelayanan & Aktivitas Pastoral</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upcoming Schedules Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwal Pelayanan Mendatang</span>
          </h3>

          {pastoral.upcomingSchedules.type === 'DATA' ? (
            <div className="space-y-2">
              {pastoral.upcomingSchedules.value.map((sch) => (
                <div key={sch.id_jadwal} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span>{sch.nama_kegiatan}</span>
                    <span className="text-primary-600 dark:text-primary-400">{sch.tanggal}</span>
                  </div>
                  <p className="text-slate-500">{sch.lokasi}</p>
                </div>
              ))}
            </div>
          ) : pastoral.upcomingSchedules.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={pastoral.upcomingSchedules.reason} label={pastoral.upcomingSchedules.label} />
          ) : (
            <p className="text-xs italic text-slate-400 p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              {pastoral.upcomingSchedules.label}
            </p>
          )}
        </div>

        {/* Pastoral Logs Card (Granular Notes Privacy) */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Catatan Pastoral</span>
          </h3>

          {pastoral.pastoralLogs.type === 'DATA' ? (
            <div className="space-y-3">
              {pastoral.pastoralLogs.value.map((log) => (
                <div key={log.id_log} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>{log.tipe_layanan}</span>
                    <span className="text-slate-500 font-normal">{log.tanggal}</span>
                  </div>

                  {/* Notes Node (Granular Privacy State) */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                    {log.notes.type === 'DATA' ? (
                      <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700 whitespace-pre-line">
                        {log.notes.value}
                      </p>
                    ) : log.notes.type === 'PRIVACY_MASKED' ? (
                      <div className="flex items-center gap-1.5 p-2 rounded bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 font-medium">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>Catatan pastoral ini bersifat rahasia (Self-Only)</span>
                      </div>
                    ) : (
                      <p className="italic text-slate-400">{log.notes.label}</p>
                    )}
                  </div>
                </div>
              ))}

              {pastoral.pagination.has_more && (
                <p className="text-[11px] text-center text-slate-400">
                  Menampilkan {pastoral.pastoralLogs.value.length} kegiatan terakhir
                </p>
              )}
            </div>
          ) : pastoral.pastoralLogs.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={pastoral.pastoralLogs.reason} label={pastoral.pastoralLogs.label} />
          ) : (
            <p className="text-xs italic text-slate-400 p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              {pastoral.pastoralLogs.label}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
