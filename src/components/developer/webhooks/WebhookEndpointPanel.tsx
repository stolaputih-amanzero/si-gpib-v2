'use client';

import React from 'react';
import { WebhookEndpointViewModel } from '@/types/webhookEngineViewModel.types';
import { Globe, Lock, Tag } from 'lucide-react';

interface WebhookEndpointPanelProps {
  endpoints: WebhookEndpointViewModel[];
}

export const WebhookEndpointPanel: React.FC<WebhookEndpointPanelProps> = ({ endpoints }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Registered Outbound Endpoints ({endpoints.length})
          </h2>
        </div>
        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
          HMAC-SHA256 Signed
        </span>
      </div>

      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
        {endpoints.map((ep) => (
          <div
            key={ep.endpoint_id}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                  {ep.endpoint_id}
                </span>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${ep.statusBadge.color}`}>
                  {ep.statusBadge.label}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span>{ep.maxRetriesFormatted}</span>
                <span>•</span>
                <span>{ep.timeoutFormatted}</span>
              </div>
            </div>

            <div className="font-mono text-xs text-purple-700 dark:text-purple-300 truncate">
              {ep.target_url}
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400">
              {ep.description}
            </div>

            {/* Secret Isolation Display & Event Subscriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-1 text-slate-500 font-mono">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>Signing Secret: </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">••••••••••••</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold ml-1">(Configured ✓)</span>
              </div>

              <div className="flex items-center justify-end gap-1 text-slate-500">
                <Tag className="w-3 h-3 text-slate-400" />
                <span className="truncate">Events: {ep.subscribedEventsFormatted}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
