'use client';

import React, { useState } from 'react';
import { OrganizationHeaderViewModel } from '@/types/organizationViewModel.types';
import { Building2, Copy, Check, BadgeCheck, MapPin, User, Church } from 'lucide-react';
import { useActiveContext } from '@/stores/active-context';

interface OrganizationHeaderProps {
  header: OrganizationHeaderViewModel;
}

export const OrganizationHeader: React.FC<OrganizationHeaderProps> = ({ header }) => {
  const [copied, setCopied] = useState(false);
  const { activeContextId } = useActiveContext();

  const handleCopyId = () => {
    navigator.clipboard.writeText(header.id_org);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'MUPEL':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'JEMAAT_INDUK':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'POS_PELKES':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const isBajemPhase = header.identity.nama.toLowerCase().includes('bajem');
  const isActiveContextUnit = activeContextId === header.id_org;

  return (
    <header className="bg-surface-elevated border border-border-subtle rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
      {/* Primary Identity Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Org Icon Badge */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
          <Building2 className="w-8 h-8 md:w-10 md:h-10" />
        </div>

        {/* Identity & Canonical Name */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-text-high tracking-tight">
              {header.identity.nama}
            </h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getLevelBadgeColor(header.identity.org_level)}`}>
              <BadgeCheck className="w-3.5 h-3.5" />
              {header.identity.org_level.replace('_', ' ')}
            </span>
            {isBajemPhase && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Fase Bajem
              </span>
            )}
            {isActiveContextUnit && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary/20 text-brand-primary border border-brand-primary/40">
                <Church className="w-3.5 h-3.5 text-brand-primary" />
                Konteks Aktif
              </span>
            )}
          </div>

          {/* Descriptive Hierarchy Context */}
          <div className="flex items-center gap-3 text-sm text-text-muted flex-wrap">
            {header.parentName && (
              <span className="flex items-center gap-1 font-medium text-text-high">
                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                {header.parentName}
              </span>
            )}
            {header.kmjName && (
              <span className="flex items-center gap-1 text-text-muted">
                <User className="w-3.5 h-3.5 text-brand-primary" />
                KMJ/PJ: <span className="font-semibold text-text-high">{header.kmjName}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Technical Identity Affordance & Status */}
      <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-2 font-mono text-text-muted">
          <span>ID: {header.id_org}</span>
          <button 
            type="button"
            onClick={handleCopyId}
            className="p-1 hover:text-text-high transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg"
            title="Salin Organization ID"
            aria-label="Salin Organization ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <span className="text-[11px] bg-surface-sunken text-text-high px-2 py-0.5 rounded border border-border-subtle font-medium">
          Identitas Organisasi Kanonis
        </span>
      </div>
    </header>
  );
};
