'use client';

import React from 'react';
import { AidRequestApprovalHistoryViewModel } from '@/types/aidRequestViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { History, ShieldCheck, UserCheck, MessageSquare } from 'lucide-react';

interface AidRequestHistorySectionProps {
  approvalHistory: AidRequestApprovalHistoryViewModel;
}

export const AidRequestHistorySection: React.FC<AidRequestHistorySectionProps> = ({ approvalHistory }) => {
  return (
    <section id="history" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-500" />
          Riwayat Persetujuan & Audit Trail Lifecycle
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        {approvalHistory.items.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={approvalHistory.items.reason} label={approvalHistory.items.label} />
        ) : approvalHistory.items.type === 'EMPTY' ? (
          <p className="text-xs text-slate-400 italic py-3 text-center">{approvalHistory.items.label}</p>
        ) : approvalHistory.items.type === 'DATA' && approvalHistory.items.value.length > 0 ? (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 pl-5 space-y-6">
            {approvalHistory.items.value.map((item) => (
              <div key={item.id} className="relative space-y-1">
                {/* Timeline Node */}
                <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900" />

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100 capitalize flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    Aksi: {item.aksi}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(item.created_at).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Peran Penyetuju: <strong className="text-slate-800 dark:text-slate-200 capitalize">{item.role_approver}</strong></span>
                </div>

                {item.catatan && (
                  <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>Catatan: "{item.catatan}"</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};
