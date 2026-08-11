'use client';

import React from 'react';
import { AidRequestOverviewViewModel } from '@/types/aidRequestViewModel.types';
import { FileText, AlertCircle, Clock } from 'lucide-react';

interface AidRequestOverviewSectionProps {
  overview: AidRequestOverviewViewModel;
}

export const AidRequestOverviewSection: React.FC<AidRequestOverviewSectionProps> = ({ overview }) => {
  return (
    <section id="overview" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Overview Ringkasan Pengajuan Bantuan
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Main Info */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              Detail Pokok Bantuan
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-700/50">
              <span className="text-slate-500">Jenis Bantuan</span>
              {overview.jenisBantuan.type === 'DATA' ? (
                <span className="font-semibold text-slate-900 dark:text-slate-100">{overview.jenisBantuan.value}</span>
              ) : (
                <span className="text-slate-400 italic text-xs">{overview.jenisBantuan.label}</span>
              )}
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Tingkat Urgensi</span>
              {overview.urgensi.type === 'DATA' ? (
                <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {overview.urgensi.value}
                </span>
              ) : (
                <span className="text-slate-400 italic text-xs">{overview.urgensi.label}</span>
              )}
            </div>
          </div>

          {/* Workflow & Org Status */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              Status Logistik & Pemohon
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-700/50">
              <span className="text-slate-500">Organisasi Pemohon</span>
              {overview.namaOrganisasi.type === 'DATA' ? (
                <span className="font-semibold text-slate-900 dark:text-slate-100">{overview.namaOrganisasi.value}</span>
              ) : (
                <span className="text-slate-400 italic text-xs">{overview.namaOrganisasi.label}</span>
              )}
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Status Workflow Saat Ini</span>
              {overview.statusWorkflow.type === 'DATA' ? (
                <span className="font-bold text-blue-600 dark:text-blue-400">{overview.statusWorkflow.value.replace('_', ' ')}</span>
              ) : (
                <span className="text-slate-400 italic text-xs">{overview.statusWorkflow.label}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
