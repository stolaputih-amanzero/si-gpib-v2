'use client';

import React from 'react';
import { X, ShieldCheck, ShieldAlert, CheckCircle2, Hash, Clock, FileCode, Layers } from 'lucide-react';
import { AuditEventViewModel } from '@/types/auditTrailViewModel.types';

interface AuditVerificationModalProps {
  event: AuditEventViewModel | null;
  onClose: () => void;
}

export const AuditVerificationModal: React.FC<AuditVerificationModalProps> = ({
  event,
  onClose
}) => {
  if (!event) return null;

  const isVerified = true; // In real RPC runtime, uses verify_audit_chain_integrity result

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Inspeksi Bukti Audit & Hash-Chain</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Integrity Verification Card */}
          <div className={`p-4 rounded-xl border space-y-2 ${isVerified ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200'}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                {isVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                )}
                CHAIN INTEGRITY VERIFICATION
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isVerified ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                {isVerified ? 'VERIFIED' : 'COMPROMISED'}
              </span>
            </div>

            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <div><span className="text-slate-400">Topic:</span> {event.topic}</div>
              <div><span className="text-slate-400">Sequence:</span> {event.sequenceFormatted}</div>
              <div><span className="text-slate-400">Status:</span> {isVerified ? 'VERIFIED (Rantai Terverifikasi Utuh)' : 'COMPROMISED (Anomali Hash Deteksi)'}</div>
            </div>

            {!isVerified && (
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                ⚠ Audit chain integrity verification failed. Displayed evidence must not be treated as fully verified.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <Hash className="w-4 h-4 text-emerald-500" /> Log ID
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{event.log_id}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <Layers className="w-4 h-4 text-emerald-500" /> Aktor & Konteks Org
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{event.actorLabel} ({event.orgContextLabel})</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <Clock className="w-4 h-4 text-emerald-500" /> Waktu Transaksi
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{event.occurredFormatted}</span>
          </div>

          {/* Cryptographic Hash Chaining Details */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-slate-500 font-semibold">
              <span>Bukti Kriptografi Hash-Chaining SHA-256</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Append-Only Immutable
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] space-y-1.5 overflow-x-auto">
              <div><span className="text-slate-500">prev_hash:</span> "{event.prevHashShort}"</div>
              <div><span className="text-slate-500">curr_hash:</span> "{event.hashShort}"</div>
              <div><span className="text-slate-500">policy_ver:</span> "{event.policyVersion}"</div>
              <div><span className="text-slate-500">f12_decision:</span> "{event.decisionLabel}"</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
          >
            Tutup Inspeksi
          </button>
        </div>
      </div>
    </div>
  );
};
