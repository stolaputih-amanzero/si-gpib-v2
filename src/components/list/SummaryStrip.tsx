'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SummaryMetric {
  label: string;
  value: number | string | null | undefined;
  icon?: React.ReactNode;
}

export interface SummaryItem {
  label: string;
  value: number | string | null | undefined;
  icon?: React.ReactNode;
}

export interface SummaryStripProps {
  metrics?: SummaryMetric[];
  items?: SummaryItem[];
  className?: string;
}

export function SummaryStrip({ metrics, items, className }: SummaryStripProps) {
  const metricList = metrics || items || [];
  if (!metricList || metricList.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-4 sm:gap-6 px-4 py-2 select-none overflow-x-auto no-scrollbar', className)}>
      {metricList.map((item, index) => {
        const displayVal =
          item.value !== null && item.value !== undefined && item.value !== ''
            ? item.value
            : '0';

        return (
          <React.Fragment key={item.label}>
            {index > 0 && <span className="text-ink-disabled font-bold text-sm shrink-0">·</span>}
            <div className="flex items-baseline gap-1.5 shrink-0">
              {item.icon && <span className="mr-0.5 self-center shrink-0">{item.icon}</span>}
              <span className="font-display text-xl font-semibold text-ink-primary tnum leading-none">
                {displayVal}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
                {item.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
