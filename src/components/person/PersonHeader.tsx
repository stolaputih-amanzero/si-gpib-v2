'use client';

import React, { useState } from 'react';
import { PersonHeaderViewModel } from '../../types/personViewModel.types';
import { User, Copy, Check, Building2, BadgeCheck } from 'lucide-react';

interface PersonHeaderProps {
  header: PersonHeaderViewModel;
}

export const PersonHeader: React.FC<PersonHeaderProps> = ({ header }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(header.id_person);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = [
    header.identity.gelar_depan,
    header.identity.nama_lengkap,
    header.identity.gelar_belakang
  ].filter(Boolean).join(' ');

  return (
    <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-xs space-y-4">
      {/* Primary Identity Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          {header.identity.foto_url ? (
            <img 
              src={header.identity.foto_url} 
              alt={displayName} 
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-primary-500/20"
            />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
              <User className="w-8 h-8 md:w-10 md:h-10" />
            </div>
          )}
          
          {/* Status Indicator */}
          {header.isActive !== null && (
            <span 
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                header.isActive ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
              title={header.isActive ? 'Status: Aktif' : 'Status: Tidak Aktif'}
            />
          )}
        </div>

        {/* Identity & Canonical Name */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {displayName}
            </h1>
            {header.isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <BadgeCheck className="w-3.5 h-3.5" />
                Aktif
              </span>
            )}
          </div>

          {/* Descriptive Role Metadata (Role is NOT identity) */}
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
            {header.primaryRoleLabel && (
              <span className="font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                {header.primaryRoleLabel}
              </span>
            )}
            {header.organizationName && (
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Building2 className="w-3.5 h-3.5" />
                {header.organizationName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Technical Identity Affordance */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 font-mono text-slate-400 dark:text-slate-500">
          <span>ID: {header.id_person}</span>
          <button 
            onClick={handleCopyId}
            className="p-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            title="Salin Person ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <span className="text-[11px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          Universal Identity (B1/B2)
        </span>
      </div>
    </header>
  );
};
