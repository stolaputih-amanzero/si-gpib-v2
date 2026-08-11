'use client';

import React from 'react';
import { AidRequestProposalViewModel } from '@/types/aidRequestViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { FileCheck, DollarSign, AlignLeft } from 'lucide-react';

interface AidRequestProposalSectionProps {
  proposal: AidRequestProposalViewModel;
}

export const AidRequestProposalSection: React.FC<AidRequestProposalSectionProps> = ({ proposal }) => {
  const formatCurrency = (val: number | null) => {
    if (val === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <section id="proposal" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-500" />
          Rincian Proposal, Biaya & RAB
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        {proposal.biaya.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={proposal.biaya.reason} label={proposal.biaya.label} />
        ) : (
          <div className="space-y-4">
            {/* Nominal Biaya Card */}
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Estimasi Total Biaya / RAB Pengajuan
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {proposal.biaya.type === 'DATA' ? formatCurrency(proposal.biaya.value) : 'Belum diisi'}
              </div>
            </div>

            {/* Keterangan & Rincian */}
            <div className="space-y-1.5 pt-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-blue-500" />
                Uraian & Keterangan Pengajuan
              </div>
              {proposal.keterangan.type === 'EMPTY' ? (
                <p className="text-xs text-slate-400 italic py-2">{proposal.keterangan.label}</p>
              ) : proposal.keterangan.type === 'DATA' ? (
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  {proposal.keterangan.value}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
