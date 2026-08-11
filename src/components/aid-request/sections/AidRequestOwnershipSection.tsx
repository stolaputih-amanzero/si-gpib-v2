'use client';

import React from 'react';
import { AidRequestHeaderViewModel } from '@/types/aidRequestViewModel.types';
import { MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface AidRequestOwnershipSectionProps {
  header: AidRequestHeaderViewModel;
}

export const AidRequestOwnershipSection: React.FC<AidRequestOwnershipSectionProps> = ({ header }) => {
  return (
    <section id="ownership" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          Konteks Organisasi Pemohon & Cross-Link
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Pemohon Utama</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">{header.ownership.nama_organisasi}</div>
            <div className="text-xs text-slate-500">Level Organisasi: {header.ownership.org_level.replace('_', ' ')}</div>
          </div>

          <Link 
            href={`/dashboard/org/${header.ownership.id_pos}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-100 transition-colors shrink-0"
          >
            <span>Buka Organization Workspace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
