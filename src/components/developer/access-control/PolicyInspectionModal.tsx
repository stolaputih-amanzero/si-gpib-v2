'use client';

import React from 'react';
import { X, ShieldCheck, Lock, Hash, Clock, FileText, AlertOctagon } from 'lucide-react';
import { PolicyDecisionViewModel } from '@/types/accessControlViewModel.types';

interface PolicyInspectionModalProps {
  decision: PolicyDecisionViewModel | null;
  onClose: () => void;
}

export const PolicyInspectionModal: React.FC<PolicyInspectionModalProps> = ({
  decision,
  onClose
}) => {
  if (!decision) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Inspeksi Hasil Evaluasi PDP</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <Hash className="w-4 h-4 text-purple-500" /> Request ID
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{decision.request_id}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <AlertOctagon className="w-4 h-4 text-purple-500" /> Hasil Keputusan Engine
            </span>
            <span className={`font-bold px-2.5 py-0.5 rounded-full border text-[11px] ${decision.effectBadgeColor}`}>
              {decision.effectLabel}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <FileText className="w-4 h-4 text-purple-500" /> Kode Alasan PDP
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{decision.reason_code}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <Clock className="w-4 h-4 text-purple-500" /> Waktu Evaluasi
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{decision.evaluatedFormatted}</span>
          </div>

          {/* Safe Machine Explanation */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-slate-500 font-semibold">
              <span>Penjelasan Komputasi Keputusan PDP</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero-PII Safe
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] space-y-1">
              <div><span className="text-slate-500">policy_id:</span> "{decision.policy_id || 'NONE'}"</div>
              <div><span className="text-slate-500">policy_version:</span> "{decision.policy_version}"</div>
              <div><span className="text-slate-500">explanation:</span> "{decision.reasonExplanation}"</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
          >
            Tutup Inspection
          </button>
        </div>
      </div>
    </div>
  );
};
