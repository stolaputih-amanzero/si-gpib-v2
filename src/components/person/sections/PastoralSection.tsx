'use client';

import React from 'react';
import { PastoralViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { HeartHandshake, Calendar, FileText, Lock, Clock, Sparkles } from 'lucide-react';

interface PastoralSectionProps {
  pastoral: PastoralViewModel;
}

export const PastoralSection: React.FC<PastoralSectionProps> = ({ pastoral }) => {
  return (
    <section id="pastoral" className="scroll-mt-36 md:scroll-mt-28 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
              Pelayanan &amp; Aktivitas Pastoral
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Catatan rekam jejak giat pastoral &amp; perjumpaan jemaat
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Upcoming Schedules */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Jadwal Pelayanan Mendatang</span>
            </h3>
          </div>

          {pastoral.upcomingSchedules.type === 'DATA' ? (
            <div className="space-y-3">
              {pastoral.upcomingSchedules.value.map((sch) => (
                <div key={sch.id_jadwal} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                  <div className="flex items-center justify-between font-semibold text-sm text-slate-900 dark:text-slate-100">
                    <span>{sch.nama_kegiatan}</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
                      {sch.tanggal}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {sch.lokasi}
                  </p>
                </div>
              ))}
            </div>
          ) : pastoral.upcomingSchedules.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={pastoral.upcomingSchedules.reason} label={pastoral.upcomingSchedules.label} />
          ) : (
            <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-1">
              <Calendar className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs italic text-slate-400">{pastoral.upcomingSchedules.label}</p>
            </div>
          )}
        </div>

        {/* Card 2: Pastoral Logs Timeline */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Rekam Giat Pastoral</span>
            </h3>
            {pastoral.pastoralLogs.type === 'DATA' && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                {pastoral.pastoralLogs.value.length} Kegiatan Terbaca
              </span>
            )}
          </div>

          {pastoral.pastoralLogs.type === 'DATA' ? (
            <div className="space-y-3.5">
              {pastoral.pastoralLogs.value.map((log) => (
                <div 
                  key={log.id_log} 
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100/70 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        {log.tipe_layanan}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{log.tanggal}</span>
                    </div>
                  </div>

                  {/* Notes Callout Box */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                    {log.notes.type === 'DATA' ? (
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border-l-4 border-l-indigo-500 border-y border-r border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catatan Pelayanan:</span>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                          {log.notes.value}
                        </p>
                      </div>
                    ) : log.notes.type === 'PRIVACY_MASKED' ? (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 font-medium">
                        <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
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
            <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-1">
              <FileText className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs italic text-slate-400">{pastoral.pastoralLogs.label}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
