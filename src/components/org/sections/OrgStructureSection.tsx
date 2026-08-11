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
    <section id="structure" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-500" />
          Struktur & Topologi Organisasi
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-5">
        {structState.type === 'PRIVACY_MASKED' ? (
          <PrivacyStateNotice reason={structState.reason} label={structState.label} />
        ) : structState.type === 'EMPTY' ? (
          <p className="text-sm text-slate-400 italic text-center py-4">{structState.label}</p>
        ) : (
          <div className="space-y-4">
            {/* Parent Node (Ancestors) */}
            {structState.value.parent && (
              <div className="p-3.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Organisasi Induk (Parent)
                </div>
                <Link 
                  href={`/dashboard/org/${structState.value.parent.id_org}`}
                  className="flex items-center justify-between group text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{structState.value.parent.nama}</span>
                    <span className="text-xs font-normal text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {structState.value.parent.org_level.replace('_', ' ')}
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </Link>
              </div>
            )}

            {/* Child Nodes */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sub-Organisasi / Unit Bawahan ({structState.value.children?.length || 0})
              </div>

              {!structState.value.children || structState.value.children.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">Tidak ada unit bawahan langsung.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {structState.value.children.map((child) => (
                    <Link
                      key={child.id_org}
                      href={`/dashboard/org/${child.id_org}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                          {child.nama}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {child.id_org}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0 transition-colors" />
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
