'use client';

import React, { useState } from 'react';
import { 
  PolicyRuleViewModel, 
  PolicyDecisionViewModel 
} from '@/types/accessControlViewModel.types';
import { Filter, Eye } from 'lucide-react';

interface PolicyRuleGridPanelProps {
  policies: PolicyRuleViewModel[];
  recentDecisions: PolicyDecisionViewModel[];
  onSelectDecision: (decision: PolicyDecisionViewModel) => void;
}

export const PolicyRuleGridPanel: React.FC<PolicyRuleGridPanelProps> = ({
  policies,
  recentDecisions,
  onSelectDecision
}) => {
  const [activeTab, setActiveTab] = useState<'RULES' | 'DECISIONS'>('DECISIONS');
  const [filterEffect, setFilterEffect] = useState<'ALL' | 'ALLOW' | 'DENY'>('ALL');

  const filteredDecisions = recentDecisions.filter(d => {
    if (filterEffect === 'ALL') return true;
    if (filterEffect === 'ALLOW') return d.isAllowed;
    if (filterEffect === 'DENY') return !d.isAllowed;
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Tab Switcher & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('DECISIONS')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'DECISIONS' 
                ? 'bg-purple-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            Stream Hasil Evaluasi PDP ({recentDecisions.length})
          </button>
          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'RULES' 
                ? 'bg-purple-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            Definisi Policy Rules ({policies.length})
          </button>
        </div>

        {activeTab === 'DECISIONS' && (
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
            <button
              onClick={() => setFilterEffect('ALL')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors ${filterEffect === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterEffect('ALLOW')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors ${filterEffect === 'ALLOW' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              ALLOW Only
            </button>
            <button
              onClick={() => setFilterEffect('DENY')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors ${filterEffect === 'DENY' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              DENY Only
            </button>
          </div>
        )}
      </div>

      {/* Tab Content: Decisions Stream */}
      {activeTab === 'DECISIONS' && (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredDecisions.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              Belum ada data evaluasi PDP yang cocok dengan filter.
            </div>
          ) : (
            filteredDecisions.map((dec) => (
              <div
                key={dec.request_id}
                onClick={() => onSelectDecision(dec)}
                className={`p-4 rounded-xl border space-y-2 cursor-pointer transition-all hover:border-purple-300 ${
                  dec.isAllowed
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${dec.effectBadgeColor}`}>
                      {dec.effectLabel}
                    </span>

                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                      {dec.reasonCodeLabel}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {dec.evaluatedFormatted}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-500">REQ: {dec.request_id}</span>
                  <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                  {dec.reasonExplanation}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Policy Rules Definitions */}
      {activeTab === 'RULES' && (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {policies.map((rule) => (
            <div
              key={rule.policy_id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                    {rule.policy_id}
                  </span>
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                    {rule.policy_name}
                  </span>
                </div>

                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {rule.policy_version}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                <div><span className="text-slate-400">Resource:</span> {rule.targetResourceLabel}</div>
                <div><span className="text-slate-400">Actions:</span> {rule.allowedActionsFormatted}</div>
                <div><span className="text-slate-400">Role:</span> {rule.requiredRoleLabel}</div>
                <div><span className="text-slate-400">Scope:</span> {rule.allowedScopeLabel}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
