'use client';

import React from 'react';
import { AidRequestProposalViewModel } from '@/types/aidRequestViewModel.types';
import { Building, ExternalLink, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AidRequestAssetsSectionProps {
  proposal: AidRequestProposalViewModel;
}

export const AidRequestAssetsSection: React.FC<AidRequestAssetsSectionProps> = ({ proposal }) => {
  const hasTanah = proposal.idTanah.type === 'DATA';
  const hasBangunan = proposal.idBangunan.type === 'DATA';
  const hasAsetB = proposal.idAsetB.type === 'DATA';
  const hasAnyAsset = hasTanah || hasBangunan || hasAsetB;

  return (
    <section id="assets" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-500" />
          Keterkaitan Aset Fisik Organisasi
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        {!hasAnyAsset ? (
          <p className="text-xs text-slate-400 italic py-2">
            Pengajuan bantuan ini tidak terikat secara khusus dengan aset fisik fisik/bergerak tertentu.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {hasTanah && (
              <Link 
                href={`/assets/${(proposal.idTanah as any).value}`}
                className="p-3 bg-surface-1 rounded-xl border border-border-subtle hover:border-brand-primary transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  <span className="text-sm font-semibold text-text-strong">
                    Tanah #{(proposal.idTanah as any).value}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-primary transition-colors" />
              </Link>
            )}

            {proposal.idBangunan?.type === 'DATA' && (proposal.idBangunan as any).value && (
              <Link 
                href={`/assets/${(proposal.idBangunan as any).value}`}
                className="p-3 bg-surface-1 rounded-xl border border-border-subtle hover:border-brand-primary transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  <span className="text-sm font-semibold text-text-strong">
                    Bangunan #{(proposal.idBangunan as any).value}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-primary transition-colors" />
              </Link>
            )}

            {proposal.idAsetB?.type === 'DATA' && (proposal.idAsetB as any).value && (
              <Link 
                href={`/assets/${(proposal.idAsetB as any).value}`}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-blue-500 transition-colors space-y-1 block"
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>Aset Bergerak</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="font-mono text-slate-500">ID: {(proposal.idAsetB as any).value}</div>
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
