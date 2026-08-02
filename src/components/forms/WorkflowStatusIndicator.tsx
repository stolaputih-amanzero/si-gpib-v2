'use client';

import { Check, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WorkflowStatusType =
  | 'Draft'
  | 'Pending_KMJ'
  | 'Pending_Mupel'
  | 'Pending_Sinode'
  | 'Approved'
  | 'Rejected';

export interface WorkflowStatusIndicatorProps {
  status: WorkflowStatusType;
  rejectionNote?: string | null;
  className?: string;
}

const WORKFLOW_STEPS = [
  { key: 'Draft', label: 'Draft' },
  { key: 'Pending_KMJ', label: 'Pending KMJ' },
  { key: 'Pending_Mupel', label: 'Pending Mupel' },
  { key: 'Pending_Sinode', label: 'Pending Sinode' },
  { key: 'Approved', label: 'Disetujui' },
];

export function WorkflowStatusIndicator({
  status = 'Draft',
  rejectionNote,
  className,
}: WorkflowStatusIndicatorProps) {
  const isRejected = status === 'Rejected';

  const getStepIndex = (st: WorkflowStatusType) => {
    switch (st) {
      case 'Draft':
        return 0;
      case 'Pending_KMJ':
        return 1;
      case 'Pending_Mupel':
        return 2;
      case 'Pending_Sinode':
        return 3;
      case 'Approved':
        return 4;
      case 'Rejected':
        return 1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className={cn('w-full space-y-3', className)}>
      {/* 5-Step Progress Bar Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-text-high flex items-center gap-1.5">
          <ShieldCheck size={15} className="text-brand-primary" />
          <span>Status Approval Multi-Level</span>
        </span>
        <span className="text-[11px] font-semibold text-text-tertiary">
          Level: {currentIndex + 1} dari 5
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-surface-sunken/80 rounded-2xl border border-border-subtle overflow-x-auto">
        {WORKFLOW_STEPS.map((step, idx) => {
          const isDone = !isRejected && idx < currentIndex;
          const isCurrent = !isRejected && idx === currentIndex;

          return (
            <div
              key={step.key}
              className={cn(
                'py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center space-y-0.5 min-h-[44px]',
                isCurrent
                  ? 'bg-brand-primary text-white shadow-2xs font-extrabold'
                  : isDone
                  ? 'bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20'
                  : isRejected && idx === 1
                  ? 'bg-red-500/10 text-red-600 font-bold border border-red-500/20'
                  : 'bg-surface-1 text-text-tertiary border border-border-subtle/50'
              )}
            >
              <div className="flex items-center gap-1 text-[11px]">
                {isDone ? (
                  <Check size={12} className="shrink-0 text-emerald-600" />
                ) : isCurrent ? (
                  <Clock size={12} className="shrink-0 text-white animate-pulse" />
                ) : isRejected && idx === 1 ? (
                  <AlertTriangle size={12} className="shrink-0 text-red-600" />
                ) : null}
                <span className="truncate">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rejection Alert Notice */}
      {isRejected && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle size={16} />
            <span>Pengajuan Bantuan Ditolak</span>
          </div>
          <p className="text-[11px] text-red-600/90 leading-relaxed">
            {rejectionNote || 'Catatan: Mohon lengkapi estimasi RAB atau perbaiki rincian proposal.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default WorkflowStatusIndicator;
