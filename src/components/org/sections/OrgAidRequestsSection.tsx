'use client';

import React from 'react';
import Link from 'next/link';
import { OrganizationAidRequestsViewModel } from '@/types/organizationViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { HandHeart, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';

interface OrgAidRequestsSectionProps {
  aidRequests: OrganizationAidRequestsViewModel;
}

export const OrgAidRequestsSection: React.FC<OrgAidRequestsSectionProps> = ({ aidRequests }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <section id="aid-requests" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HandHeart className="w-5 h-5 text-blue-500" />
          Proyeksi Workflow Ajuan Bantuan
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        {/* Aggregate Lifecycle Stats */}
        {aidRequests.totalCount.type === 'DATA' && (
          <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Ajuan</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {aidRequests.totalCount.value}
              </div>
            </div>
            <div>
              <div className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                Aktif
              </div>
              <div className="text-base font-bold text-amber-700 dark:text-amber-400">
                {aidRequests.activeCount.type === 'DATA' ? aidRequests.activeCount.value : 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Disetujui
              </div>
              <div className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                {aidRequests.approvedCount.type === 'DATA' ? aidRequests.approvedCount.value : 0}
              </div>
            </div>
          </div>
        )}

        {/* Item Projections */}
        {aidRequests.items.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={aidRequests.items.reason} label={aidRequests.items.label} />
        ) : aidRequests.items.type === 'EMPTY' ? (
          <p className="text-sm text-slate-400 italic text-center py-4">{aidRequests.items.label}</p>
        ) : (
          <div className="space-y-2">
            {aidRequests.items.value.map((item) => (
              <Link
                key={item.id_ajuan}
                href={`/dashboard/aid-requests/${item.id_ajuan}`}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                      {item.jenis_bantuan}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusBadge(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {item.biaya ? `Estimasi: Rp ${item.biaya.toLocaleString('id-ID')} • ` : ''}Urgensi: {item.urgensi || 'Normal'}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
