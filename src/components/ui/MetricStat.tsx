import * as React from 'react';
import { cn } from '@/lib/utils';

export interface MetricStatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  sublabel?: string;
  indicatorActive?: boolean;
}

export const MetricStat = React.forwardRef<HTMLDivElement, MetricStatProps>(
  (
    {
      className,
      label,
      value,
      sublabel,
      indicatorActive = true,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between py-2.5 sm:py-3 border-b border-stone-200/60 dark:border-stone-800/80 last:border-0 group',
          className
        )}
        {...props}
      >
        <div className="flex flex-col space-y-0.5">
          <span className="micro-label text-ink-tertiary group-hover:text-ink-secondary transition-colors">
            {label}
          </span>
          {sublabel && (
            <span className="text-[11px] sm:text-xs text-ink-secondary">
              {sublabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-editorial text-base sm:text-lg lg:text-xl font-bold tracking-tight text-amber-700 dark:text-amber-400 tnum">
            {value}
          </span>
          <span
            className={cn(
              'size-2 rounded-full transition-all duration-300',
              indicatorActive
                ? 'bg-amber-500 ring-4 ring-amber-500/20'
                : 'bg-stone-300 dark:bg-stone-700'
            )}
          />
        </div>
      </div>
    );
  }
);
MetricStat.displayName = 'MetricStat';
