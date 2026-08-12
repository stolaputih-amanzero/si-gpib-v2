'use client';

import React, { useState } from 'react';
import { PersonHeaderViewModel } from '../../types/personViewModel.types';
import { User, Copy, Check, Building2, BadgeCheck, ShieldCheck } from 'lucide-react';

interface PersonHeaderProps {
  header: PersonHeaderViewModel;
  isSelfPerson?: boolean;
  personType?: 'PENDETA' | 'PELAYAN' | 'RELAWAN';
  assignmentSummary?: string;
}

export const PersonHeader: React.FC<PersonHeaderProps> = ({ 
  header, 
  isSelfPerson = false,
  personType = 'PENDETA',
  assignmentSummary
}) => {
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

  const getMinistryBadgeColor = () => {
    switch (personType) {
      case 'PENDETA':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'PELAYAN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'RELAWAN':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const ministryLabel = personType === 'PENDETA' ? 'Pendeta' : personType === 'PELAYAN' ? 'Pelayan/Presbiter' : 'Relawan';

  return (
    <header className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
      {/* Primary Identity Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          {header.identity.foto_url ? (
            <img 
              src={header.identity.foto_url} 
              alt={displayName} 
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-blue-500/30"
            />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-800 border-2 border-slate-700/80 flex items-center justify-center text-slate-400">
              <User className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
            </div>
          )}
          
          {/* Status Indicator */}
          {header.isActive !== null && (
            <span 
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900 ${
                header.isActive ? 'bg-emerald-500' : 'bg-slate-500'
              }`}
              title={header.isActive ? 'Status: Aktif' : 'Status: Tidak Aktif'}
            />
          )}
        </div>

        {/* Identity & Canonical Name */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              {displayName}
            </h1>
            
            {/* W-8: Ministry Identity Badge ONLY */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getMinistryBadgeColor()}`}>
              <BadgeCheck className="w-3.5 h-3.5" />
              {ministryLabel}
            </span>

            {/* W-7: Self-person "Profil Anda" affordance */}
            {isSelfPerson && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Profil Anda
              </span>
            )}
          </div>

          {/* Assignment Summary Line */}
          <div className="flex items-center gap-2 text-sm text-slate-400 flex-wrap">
            {assignmentSummary ? (
              <span className="text-xs font-medium text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                {assignmentSummary}
              </span>
            ) : header.organizationName && (
              <span className="flex items-center gap-1 text-slate-400 text-xs">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                {header.organizationName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Technical Identity Affordance */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 font-mono text-slate-400">
          <span>ID: {header.id_person}</span>
          <button 
            type="button"
            onClick={handleCopyId}
            className="p-1 hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg"
            title="Salin Person ID"
            aria-label="Salin Person ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <span className="text-[11px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60 font-medium">
          Identitas SDM Kanonis
        </span>
      </div>
    </header>
  );
};
