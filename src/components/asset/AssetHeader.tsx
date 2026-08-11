'use client';

import React, { useState } from 'react';
import { AssetHeaderViewModel } from '@/types/assetViewModel.types';
import { Building, Landmark, Box, Copy, Check, BadgeCheck, MapPin } from 'lucide-react';
import Link from 'next/link';

interface AssetHeaderProps {
  header: AssetHeaderViewModel;
}

export const AssetHeader: React.FC<AssetHeaderProps> = ({ header }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(header.id_asset);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tanah':
        return <Landmark className="w-8 h-8 md:w-10 md:h-10 text-emerald-600 dark:text-emerald-400" />;
      case 'bangunan':
        return <Building className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400" />;
      case 'bergerak':
        return <Box className="w-8 h-8 md:w-10 md:h-10 text-amber-600 dark:text-amber-400" />;
      default:
        return <Building className="w-8 h-8 md:w-10 md:h-10 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'tanah':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'bangunan':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'bergerak':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-xs space-y-4">
      {/* Primary Identity Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Category Icon Badge */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
          {getCategoryIcon(header.identity.kategori)}
        </div>

        {/* Identity & Canonical Name */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {header.identity.nama_aset}
            </h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeColor(header.identity.kategori)}`}>
              <BadgeCheck className="w-3.5 h-3.5" />
              <span className="capitalize">Kategori: {header.identity.kategori}</span>
            </span>
          </div>

          {/* Descriptive Ownership Context */}
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
            {header.ownership.nama_organisasi && (
              <Link 
                href={`/dashboard/org/${header.ownership.id_pos}`}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                Pemilik: {header.ownership.nama_organisasi} ({header.ownership.org_level.replace('_', ' ')})
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Technical Identity Affordance & Status */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 font-mono text-slate-400 dark:text-slate-500">
          <span>ID: {header.id_asset}</span>
          <button 
            onClick={handleCopyId}
            className="p-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            title="Salin Asset ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <span className="text-[11px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          Canonical Asset Detail
        </span>
      </div>
    </header>
  );
};
