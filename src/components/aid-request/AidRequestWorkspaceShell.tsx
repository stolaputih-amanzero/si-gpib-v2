'use client';

import React, { useState, useMemo } from 'react';
import { UnifiedAidRequestData } from '@/types/aidRequest.types';
import { adaptAidRequestToViewModel } from '@/adapters/aidRequestViewModelAdapter';
import { transitionAidRequest } from '@/lib/services/aidRequestClient';
import { AidRequestHeader } from './AidRequestHeader';
import { AidRequestWorkflowProgress } from './AidRequestWorkflowProgress';
import { AidRequestNavigationAnchor } from './AidRequestNavigationAnchor';
import { AidRequestOverviewSection } from './sections/AidRequestOverviewSection';
import { AidRequestProposalSection } from './sections/AidRequestProposalSection';
import { AidRequestHistorySection } from './sections/AidRequestHistorySection';
import { AidRequestAssetsSection } from './sections/AidRequestAssetsSection';
import { AidRequestOwnershipSection } from './sections/AidRequestOwnershipSection';
import { Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface AidRequestWorkspaceShellProps {
  initialData: UnifiedAidRequestData;
}

export const AidRequestWorkspaceShell: React.FC<AidRequestWorkspaceShellProps> = ({ initialData }) => {
  const [data, setData] = useState<UnifiedAidRequestData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catatanInput, setCatatanInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pass through UI Anti-Corruption Layer (Adapter)
  const vm = useMemo(() => adaptAidRequestToViewModel(data), [data]);

  const handleAction = async (action: 'submit' | 'approve' | 'reject') => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const requestIdToken = `REQ-${Date.now()}`;

    try {
      const updated = await transitionAidRequest(data.id_ajuan, action, catatanInput, requestIdToken);
      if (updated) {
        setData(updated);
        setCatatanInput('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengubah status pengajuan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const status = data.workflow.status;
  const isTerminal = status === 'Approved' || status === 'Rejected';

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16 space-y-6">
      {/* 1. Header (Identity & Status Banner) */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <AidRequestHeader header={vm.header} />
      </div>

      {/* 2. Visual Progress Tracker */}
      <div className="max-w-6xl mx-auto px-4">
        <AidRequestWorkflowProgress status={vm.header.workflow.status} />
      </div>

      {/* 3. Command Control Bar (State Mutation Dispatcher) */}
      {!isTerminal && (
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Aksi Otorisasi Workflow Saat Ini ({status.replace('_', ' ')})
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input 
                type="text"
                value={catatanInput}
                onChange={(e) => setCatatanInput(e.target.value)}
                placeholder="Tambah catatan persetujuan / verifikasi (opsional)..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {status === 'Draft' && (
                  <button
                    onClick={() => handleAction('submit')}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Kirim Pengajuan</span>
                  </button>
                )}

                {status !== 'Draft' && (
                  <>
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Setujui (Approve)</span>
                    </button>

                    <button
                      onClick={() => handleAction('reject')}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      <span>Tolak (Reject)</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Single Top Sticky Anchor Bar */}
      <div className="max-w-6xl mx-auto px-4">
        <AidRequestNavigationAnchor />
      </div>

      {/* 5. The 5 Progressive Workspace Sections */}
      <main className="max-w-6xl mx-auto px-4 space-y-10">
        <AidRequestOverviewSection overview={vm.overview} />
        <AidRequestProposalSection proposal={vm.proposal} />
        <AidRequestHistorySection approvalHistory={vm.approvalHistory} />
        <AidRequestAssetsSection proposal={vm.proposal} />
        <AidRequestOwnershipSection header={vm.header} />
      </main>
    </div>
  );
};
