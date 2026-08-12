'use client';

import React from 'react';
import { OrganizationHistoryViewModel } from '@/types/organizationViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { History, GitCommit } from 'lucide-react';

interface OrgHistorySectionProps {
  history: OrganizationHistoryViewModel;
}

export const OrgHistorySection: React.FC<OrgHistorySectionProps> = ({ history }) => {
  return (
    <section id="riwayat" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          Riwayat &amp; Status Operasional
        </h2>
      </div>

      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xs">
        {history.events.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={history.events.reason} label={history.events.label} />
        ) : history.events.type === 'EMPTY' ? (
          <p className="text-sm text-slate-500 italic text-center py-4">{history.events.label}</p>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {history.events.value.map((evt) => (
              <div key={evt.id_histori} className="relative flex items-start justify-between gap-4">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-blue-400">
                  <GitCommit className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-100">{evt.deskripsi}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{evt.jenis_perubahan}</div>
                </div>
                <span className="text-xs font-bold text-slate-400 font-sans tabular-nums bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                  {evt.tgl}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
