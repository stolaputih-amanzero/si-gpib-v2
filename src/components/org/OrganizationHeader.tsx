'use client';

import React, { useState } from 'react';
import { OrganizationHeaderViewModel } from '@/types/organizationViewModel.types';
import { Building2, Copy, Check, BadgeCheck, MapPin, User } from 'lucide-react';

interface OrganizationHeaderProps {
  header: OrganizationHeaderViewModel;
}

export const OrganizationHeader: React.FC<OrganizationHeaderProps> = ({ header }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(header.id_org);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'MUPEL':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'JEMAAT_INDUK':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'POS_PELKES':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-xs space-y-4">
      {/* Primary Identity Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Org Icon Badge */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <Building2 className="w-8 h-8 md:w-10 md:h-10" />
        </div>

        {/* Identity & Canonical Name */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {header.identity.nama}
            </h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getLevelBadgeColor(header.identity.org_level)}`}>
              <BadgeCheck className="w-3.5 h-3.5" />
              {header.identity.org_level.replace('_', ' ')}
            </span>
          </div>

          {/* Descriptive Hierarchy Context */}
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
            {header.parentName && (
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {header.parentName}
              </span>
            )}
            {header.kmjName && (
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <User className="w-3.5 h-3.5 text-blue-500" />
                KMJ/PJ: <span className="font-semibold text-slate-800 dark:text-slate-200">{header.kmjName}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Technical Identity Affordance & Status */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 font-mono text-slate-400 dark:text-slate-500">
          <span>ID: {header.id_org}</span>
          <button 
            onClick={handleCopyId}
            className="p-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            title="Salin Organization ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <span className="text-[11px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          Canonical Organization Identity
        </span>
      </div>
    </header>
  );
};
