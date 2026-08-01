'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SummaryItem {
  label: string;
  value: number | string | null | undefined;
}

export interface SummaryStripProps {
  items: SummaryItem[];
  className?: string;
}

export function SummaryStrip({ items, className }: SummaryStripProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-4 sm:gap-6 px-4 py-2 select-none overflow-x-auto no-scrollbar', className)}>
      {items.map((item, index) => {
        const displayVal =
          item.value !== null && item.value !== undefined && item.value !== ''
            ? item.value
            : '—';

        return (
          <React.Fragment key={item.label}>
            {index > 0 && <span className="text-ink-disabled font-bold text-sm shrink-0">·</span>}
            <div className="flex items-baseline gap-1.5 shrink-0">
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
