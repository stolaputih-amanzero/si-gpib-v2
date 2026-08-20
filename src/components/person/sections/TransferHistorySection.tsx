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
    <section id="mutasi" className="scroll-mt-36 md:scroll-mt-28 space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-text-high flex items-center gap-2">
          <History className="w-4 h-4 text-brand-primary" />
          Riwayat Mutasi Pelayanan
        </h2>
      </div>

      <div className="bg-surface-elevated border border-border-subtle rounded-2xl shadow-xs overflow-hidden">
        {roles.mutations.type === 'DATA' ? (
          <div className="divide-y divide-border-subtle/60">
            {roles.mutations.value.map((mut) => (
              <div key={mut.id_mutasi} className="p-4 sm:p-5 hover:bg-surface-sunken/30 transition-colors space-y-1.5">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span className="font-bold text-text-high bg-surface-sunken px-2 py-0.5 rounded border border-border-subtle">{mut.jenis_mutasi}</span>
                  <span className="font-sans tabular-nums font-semibold">{mut.tanggal_mutasi}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-text-high pt-1 flex-wrap">
                  <span className="text-text-secondary">{mut.asal_organisasi}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                  <span className="text-text-high font-bold">{mut.tujuan_organisasi}</span>
                </div>
              </div>
            ))}
          </div>
        ) : roles.mutations.type === 'PRIVACY_MASKED' ? (
          <div className="p-5">
            <PrivacyStateNotice reason={roles.mutations.reason} label={roles.mutations.label} />
          </div>
        ) : (
          <p className="text-xs italic text-text-disabled p-5 text-center">
            {roles.mutations.label}
          </p>
        )}
      </div>
    </section>
  );
};
