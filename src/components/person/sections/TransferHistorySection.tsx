'use client';

import React from 'react';
import { RolesViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { History, ArrowRight } from 'lucide-react';

interface TransferHistorySectionProps {
  roles: RolesViewModel;
}

export const TransferHistorySection: React.FC<TransferHistorySectionProps> = ({ roles }) => {
  return (
    <section id="mutasi" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          Riwayat Mutasi Pendeta (`t_riwayat_mutasi_pendeta`)
        </h2>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-3">
        {roles.mutations.type === 'DATA' ? (
          <div className="space-y-2">
            {roles.mutations.value.map((mut) => (
              <div key={mut.id_mutasi} className="p-3.5 rounded-xl bg-slate-950 border border-border-subtle text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold text-slate-300">{mut.jenis_mutasi}</span>
                  <span className="font-sans tabular-nums">{mut.tanggal_mutasi}</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-slate-100">
                  <span>{mut.asal_organisasi}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{mut.tujuan_organisasi}</span>
                </div>
              </div>
            ))}
          </div>
        ) : roles.mutations.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={roles.mutations.reason} label={roles.mutations.label} />
        ) : (
          <p className="text-xs italic text-slate-500 p-4 text-center bg-slate-950 rounded-xl border border-border-subtle">
            {roles.mutations.label}
          </p>
        )}
      </div>
    </section>
  );
};
