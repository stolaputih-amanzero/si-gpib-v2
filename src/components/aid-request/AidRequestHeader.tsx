'use client';

import React, { useState } from 'react';
import { AidRequestHeaderViewModel } from '@/types/aidRequestViewModel.types';
import { FileText, Copy, Check, MapPin, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface AidRequestHeaderProps {
  header: AidRequestHeaderViewModel;
}

export const AidRequestHeader: React.FC<AidRequestHeaderProps> = ({ header }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(header.id_ajuan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      case 'Pending_KMJ':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Pending_Mupel':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'Pending_Sinode':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'Mendesak':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300';
      case 'Tinggi':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300';
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon Badge */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
          <FileText className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Identity & Canonical Name */}
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {header.identity.jenis_bantuan}
            </h1>

            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeColor(header.workflow.status)}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>Status: {header.workflow.status.replace('_', ' ')}</span>
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getUrgencyBadgeColor(header.identity.urgensi)}`}>
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Urgensi: {header.identity.urgensi}</span>
            </span>
          </div>

          {/* Ownership Context */}
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
            {header.ownership.nama_organisasi && (
              <Link 
                href={`/dashboard/org/${header.ownership.id_pos}`}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                Pemohon: {header.ownership.nama_organisasi} ({header.ownership.org_level.replace('_', ' ')})
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Technical Identity Affordance & Status */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 font-mono text-slate-400 dark:text-slate-500">
          <span>ID Ajuan: {header.id_ajuan}</span>
          <button 
            onClick={handleCopyId}
            className="p-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            title="Salin ID Ajuan"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <span className="text-[11px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-sans">
          Stateful Workflow Entity
        </span>
      </div>
    </header>
  );
};
