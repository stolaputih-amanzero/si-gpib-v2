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
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
  };

  return (
    <section id="aid-requests" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-high flex items-center gap-2">
          <HandHeart className="w-5 h-5 text-brand-primary" />
          Pengajuan Bantuan Context
        </h2>
        <Link
          href="/aid-requests"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-sunken hover:bg-surface-sunken/80 text-brand-primary border border-border-subtle transition-colors min-h-[44px]"
          aria-label="Buka Antrean Persetujuan Bantuan"
        >
          <span>Antrean Persetujuan Bantuan</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-5 shadow-xs space-y-4">
        {/* Aggregate Lifecycle Stats */}
        {aidRequests.totalCount.type === 'DATA' && (
          <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-surface-sunken border border-border-subtle">
            <div>
              <div className="text-xs text-text-muted font-medium">Total Ajuan</div>
              <div className="text-base font-bold text-text-high font-sans tabular-nums">
                {aidRequests.totalCount.value}
              </div>
            </div>
            <div>
              <div className="text-xs text-amber-500 font-medium flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                Aktif
              </div>
              <div className="text-base font-bold text-amber-500 font-sans tabular-nums">
                {aidRequests.activeCount.type === 'DATA' ? aidRequests.activeCount.value : 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Disetujui
              </div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-sans tabular-nums">
                {aidRequests.approvedCount.type === 'DATA' ? aidRequests.approvedCount.value : 0}
              </div>
            </div>
          </div>
        )}

        {/* Item Projections */}
        {aidRequests.items.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={aidRequests.items.reason} label={aidRequests.items.label} />
        ) : aidRequests.items.type === 'EMPTY' ? (
          <p className="text-sm text-text-disabled italic text-center py-4">{aidRequests.items.label}</p>
        ) : (
          <div className="space-y-2">
            {aidRequests.items.value.map((item) => (
              <Link
                key={item.id_ajuan}
                href={`/aid-requests/${item.id_ajuan}`}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border-subtle hover:border-brand-primary/40 hover:bg-surface-sunken transition-all group min-h-[56px]"
                aria-label={`Detail ajuan bantuan ${item.jenis_bantuan}`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-text-high group-hover:text-brand-primary truncate transition-colors">
                      {item.jenis_bantuan}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted mt-0.5 font-sans tabular-nums">
                    {item.biaya ? `Estimasi: Rp ${item.biaya.toLocaleString('id-ID')} • ` : ''}Urgensi: {item.urgensi || 'Normal'}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-brand-primary shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
