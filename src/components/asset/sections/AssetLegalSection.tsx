'use client';

import React from 'react';
import { AssetLegalViewModel } from '@/types/assetViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { FileText, ShieldCheck, Download } from 'lucide-react';

interface AssetLegalSectionProps {
  legal: AssetLegalViewModel;
}

export const AssetLegalSection: React.FC<AssetLegalSectionProps> = ({ legal }) => {
  return (
    <section id="legal" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Legalitas & Dokumen Sertifikat
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        {legal.statusHukum.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={legal.statusHukum.reason} label={legal.statusHukum.label} />
        ) : (
          <div className="space-y-4">
            {/* Status Hukum & No Sertifikat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Hukum Kepemilikan</div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {legal.statusHukum.type === 'DATA' ? legal.statusHukum.value : 'Belum diisi'}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nomor Sertifikat / Registrasi</div>
                <div className="text-base font-mono font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {legal.noSertifikat.type === 'DATA' ? legal.noSertifikat.value : 'Belum tercatat'}
                </div>
              </div>
            </div>

            {/* Dokumen Lampiran */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dokumen & Lampiran Terkait</div>

              {legal.lampiranFiles.type === 'EMPTY' ? (
                <p className="text-xs text-slate-400 italic py-2">{legal.lampiranFiles.label}</p>
              ) : legal.lampiranFiles.type === 'DATA' && legal.lampiranFiles.value.length > 0 ? (
                <div className="space-y-2">
                  {legal.lampiranFiles.value.map((file) => (
                    <div key={file.id_lampiran} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{file.nama_file}</span>
                      </div>
                      {file.url && (
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Unduh
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
