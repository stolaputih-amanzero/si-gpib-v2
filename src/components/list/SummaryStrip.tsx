'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface SummaryMetric {
  label: string;
  value: number | string | null | undefined;
  icon?: ReactNode;
}

export interface SummaryStripProps {
  metrics: SummaryMetric[];
  className?: string;
}

function CountUpValue({ value }: { value: number | string | null | undefined }) {
  const [displayValue, setDisplayValue] = useState<number | string>(() => {
    if (value === null || value === undefined || value === '') return '0';
    if (typeof value === 'number') return 0;
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? value : 0;
  });

  useEffect(() => {
    if (value === null || value === undefined || value === '') {
      setDisplayValue('0');
      return;
    }
    if (typeof value !== 'number') {
      const parsed = parseFloat(String(value));
      if (isNaN(parsed)) {
        setDisplayValue(value);
        return;
      }
    }

    const target = typeof value === 'number' ? value : parseFloat(String(value));
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplayValue(target);
      return;
    }

    const duration = 600;
    const startTime = performance.now();
    let animId: number;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * easeOut);
      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(update);
      } else {
        setDisplayValue(target);
      }
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [value]);

  return <>{displayValue}</>;
}

export function SummaryStrip({ metrics = [], className }: SummaryStripProps) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-4 sm:gap-6 px-4 py-2 select-none overflow-x-auto no-scrollbar',
        className
      )}
    >
      {metrics.map((item, index) => {
        const isNullOrEmpty =
          item.value === null || item.value === undefined || item.value === '';

        return (
          <React.Fragment key={item.label}>
            {index > 0 && (
              <span className="text-ink-disabled font-bold text-sm shrink-0 select-none">
                ·
              </span>
            )}
            <div className="flex items-baseline gap-1.5 shrink-0">
              {item.icon && (
                <span className="mr-0.5 self-center shrink-0 text-brand-600">
                  {item.icon}
                </span>
              )}
              <span className="font-display text-xl font-semibold text-ink-primary tnum leading-none">
                {isNullOrEmpty ? '0' : <CountUpValue value={item.value} />}
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
