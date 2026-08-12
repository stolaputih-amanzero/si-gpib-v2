'use client';

import React from 'react';
import Link from 'next/link';
import { OrganizationStructureViewModel } from '@/types/organizationViewModel.types';
import { PrivacyStateNotice } from '@/components/person/PrivacyStateNotice';
import { Network, ChevronRight, Layers, ArrowUpRight } from 'lucide-react';

interface OrgStructureSectionProps {
  structure: OrganizationStructureViewModel;
}

export const OrgStructureSection: React.FC<OrgStructureSectionProps> = ({ structure }) => {
  const structState = structure.structure;

  return (
    <section id="identitas" className="scroll-mt-36 md:scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-400" />
          Identitas &amp; Struktur Organisasi
        </h2>
      </div>

      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-5">
        {structState.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={structState.reason} label={structState.label} />
        ) : structState.type === 'EMPTY' ? (
          <p className="text-sm text-slate-500 italic text-center py-4">{structState.label}</p>
        ) : (
          <div className="space-y-4">
            {/* Parent Node (Ancestors) */}
            {structState.value.parent && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Organisasi Induk (Parent)
                </div>
                <Link 
                  href={`/org/${structState.value.parent.id_org}`}
                  className="flex items-center justify-between group text-sm font-bold text-slate-100 hover:text-blue-400 transition-colors min-h-[44px]"
                  aria-label={`Buka organisasi induk ${structState.value.parent.nama}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{structState.value.parent.nama}</span>
                    <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {structState.value.parent.org_level.replace('_', ' ')}
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </Link>
              </div>
            )}

            {/* Child Nodes */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Sub-Organisasi / Unit Bawahan (<span className="font-sans tabular-nums">{structState.value.children?.length || 0}</span>)
              </div>

              {!structState.value.children || structState.value.children.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">Tidak ada unit bawahan langsung.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {structState.value.children.map((child) => (
                    <Link
                      key={child.id_org}
                      href={`/org/${child.id_org}`}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-800/60 transition-all group min-h-[56px]"
                      aria-label={`Buka unit ${child.nama}`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-sm font-bold text-slate-100 group-hover:text-blue-400 truncate transition-colors">
                          {child.nama}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {child.id_org}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 shrink-0 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
