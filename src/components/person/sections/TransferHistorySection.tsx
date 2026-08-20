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
        <h2 className="text-lg font-bold text-text-high flex items-center gap-2">
          <History className="w-5 h-5 text-brand-primary" />
          Riwayat Mutasi Pelayanan
        </h2>
      </div>

      <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-3">
        {roles.mutations.type === 'DATA' ? (
          <div className="space-y-2">
            {roles.mutations.value.map((mut) => (
              <div key={mut.id_mutasi} className="p-3.5 rounded-xl bg-surface-sunken border border-border-subtle text-xs space-y-1">
                <div className="flex items-center justify-between text-text-muted">
                  <span className="font-bold text-text-high">{mut.jenis_mutasi}</span>
                  <span className="font-sans tabular-nums">{mut.tanggal_mutasi}</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-text-high">
                  <span>{mut.asal_organisasi}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                  <span>{mut.tujuan_organisasi}</span>
                </div>
              </div>
            ))}
          </div>
        ) : roles.mutations.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={roles.mutations.reason} label={roles.mutations.label} />
        ) : (
          <p className="text-xs italic text-text-disabled p-4 text-center bg-surface-sunken rounded-xl border border-border-subtle">
            {roles.mutations.label}
          </p>
        )}
      </div>
    </section>
  );
};
