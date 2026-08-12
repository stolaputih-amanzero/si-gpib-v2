'use client';

import React from 'react';
import Link from 'next/link';
import { OrganizationPastoralViewModel } from '@/types/organizationViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { BookOpen, Calendar, Plus, ArrowUpRight, Clock } from 'lucide-react';

interface OrgPastoralSectionProps {
  pastoral: OrganizationPastoralViewModel;
}

export const OrgPastoralSection: React.FC<OrgPastoralSectionProps> = ({ pastoral }) => {
  return (
    <section id="pastoral" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          Pelayanan Pastoral
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href="/projections/pastoral-dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors min-h-[44px]"
            aria-label="Lihat Dashboard Pastoral"
          >
            <span>Dashboard Pastoral</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {pastoral.canCreate && (
            <Link
              href="/dashboard/aktivitas"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors min-h-[44px]"
              aria-label="Catat Log Pastoral Baru"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Log Pastoral</span>
            </Link>
          )}
        </div>
      </div>

      <div className="bg-slate-900/90 border border-border-subtle rounded-2xl p-5 shadow-xs space-y-5">
        {/* Worship Schedule Sub-section */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-400" />
            Jadwal Ibadah Resmi (`t_jadwal_ibadah`)
          </div>

          {pastoral.jadwalIbadah.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={pastoral.jadwalIbadah.reason} label={pastoral.jadwalIbadah.label} />
          ) : pastoral.jadwalIbadah.type === 'EMPTY' ? (
            <p className="text-xs text-slate-500 italic py-1">{pastoral.jadwalIbadah.label}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {pastoral.jadwalIbadah.value.map((item) => (
                <div key={item.id_jadwal} className="p-3.5 rounded-xl bg-slate-950 border border-border-subtle text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-100">{item.nama_ibadah}</div>
                    <div className="text-slate-400 mt-0.5">{item.hari}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 font-sans tabular-nums flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.jam}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log Pastoral Sub-section */}
        <div className="space-y-2 pt-3 border-t border-border-subtle">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-400" />
            Jejak &amp; Log Pastoral (`t_log_pastoral`)
          </div>

          {pastoral.logs.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={pastoral.logs.reason} label={pastoral.logs.label} />
          ) : pastoral.logs.type === 'EMPTY' ? (
            <p className="text-xs text-slate-500 italic py-1">{pastoral.logs.label}</p>
          ) : (
            <div className="space-y-2">
              {pastoral.logs.value.map((log) => (
                <Link
                  key={log.id_log}
                  href={`/dashboard/aktivitas?id=${log.id_log}`}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border-subtle hover:border-blue-500/40 hover:bg-slate-800/60 transition-all group min-h-[56px]"
                  aria-label={`Buka detail log pastoral ${log.jenis_kegiatan}`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                        {log.jenis_kegiatan}
                      </span>
                      <span className="text-xs font-bold text-slate-400 font-sans tabular-nums bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {log.tgl}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {log.ringkasan} {log.lokasi ? `• ${log.lokasi}` : ''}
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
