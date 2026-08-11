'use client';

import React from 'react';
import { AssetValuationViewModel } from '@/types/assetViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { Coins } from 'lucide-react';

interface AssetValuationSectionProps {
  valuation: AssetValuationViewModel;
}

export const AssetValuationSection: React.FC<AssetValuationSectionProps> = ({ valuation }) => {
  const formatCurrency = (val: number | null) => {
    if (val === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <section id="valuation" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Coins className="w-5 h-5 text-blue-500" />
          Valuasi & Pembiayaan Aset
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        {valuation.nilaiEst.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={valuation.nilaiEst.reason} label={valuation.nilaiEst.label} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="p-3.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Estimasi Nilai Pasar</div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                {valuation.nilaiEst.type === 'DATA' ? formatCurrency(valuation.nilaiEst.value) : 'Belum diestimasi'}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Nilai Buku / Perolehan</div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                {valuation.nilaiBuku.type === 'DATA' ? formatCurrency(valuation.nilaiBuku.value) : 'Belum diisi'}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sumber Dana Perolehan</div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {valuation.sumberDana.type === 'DATA' ? valuation.sumberDana.value : 'Belum dicatat'}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
