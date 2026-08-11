'use client';

import React from 'react';
import { AidRequestStatus } from '@/types/aidRequest.types';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface AidRequestWorkflowProgressProps {
  status: AidRequestStatus;
}

interface StepItem {
  id: AidRequestStatus;
  label: string;
  sublabel: string;
}

const STEPS: StepItem[] = [
  { id: 'Draft', label: 'Draft', sublabel: 'Pemohon' },
  { id: 'Pending_KMJ', label: 'Verifikasi KMJ', sublabel: 'Jemaat Induk' },
  { id: 'Pending_Mupel', label: 'Verifikasi Mupel', sublabel: 'Pengurus Mupel' },
  { id: 'Pending_Sinode', label: 'Verifikasi Sinode', sublabel: 'Majelis Sinode' },
  { id: 'Approved', label: 'Disetujui', sublabel: 'Final' }
];

export const AidRequestWorkflowProgress: React.FC<AidRequestWorkflowProgressProps> = ({ status }) => {
  const isRejected = status === 'Rejected';

  const getStepState = (stepId: AidRequestStatus) => {
    if (isRejected) {
      return stepId === 'Draft' ? 'COMPLETED' : 'REJECTED';
    }

    const order: AidRequestStatus[] = ['Draft', 'Pending_KMJ', 'Pending_Mupel', 'Pending_Sinode', 'Approved'];
    const currentIndex = order.indexOf(status);
    const stepIndex = order.indexOf(stepId);

    if (stepIndex < currentIndex) return 'COMPLETED';
    if (stepIndex === currentIndex) return 'CURRENT';
    return 'UPCOMING';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-blue-500" />
          Tahapan Lifecycle Pengajuan Bantuan
        </h3>

        {isRejected && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            Pengajuan Ditolak
          </span>
        )}
      </div>

      {/* Progress Bar / Steps Container */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
        {STEPS.map((step, idx) => {
          const state = getStepState(step.id);
          return (
            <div key={step.id} className="relative flex flex-col items-start p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[11px] font-mono font-semibold text-slate-400">Step 0{idx + 1}</span>
                {state === 'COMPLETED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : state === 'CURRENT' ? (
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                ) : isRejected ? (
                  <XCircle className="w-4 h-4 text-rose-400 opacity-40" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />
                )}
              </div>

              <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                {step.label}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {step.sublabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
