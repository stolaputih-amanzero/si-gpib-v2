import * as React from 'react';
import { cn } from '@/lib/utils';

export interface StatusPillProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'gold' | 'emerald' | 'blue' | 'neutral' | 'ruby';
  dot?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
}

export const StatusPill = React.forwardRef<HTMLDivElement, StatusPillProps>(
  (
    {
      className,
      variant = 'gold',
      dot = true,
      pulse = false,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      gold: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/25',
      emerald: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25',
      blue: 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/25',
      neutral: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700',
      ruby: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/25',
    };

    const dotColorStyles = {
      gold: 'bg-amber-500',
      emerald: 'bg-emerald-500',
      blue: 'bg-blue-500',
      neutral: 'bg-stone-400',
      ruby: 'bg-rose-500',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase select-none transition-colors',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {dot && (
          <span className="relative flex size-2 shrink-0">
            {pulse && (
              <span
                className={cn(
                  'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                  dotColorStyles[variant]
                )}
              />
            )}
            <span
              className={cn('relative inline-flex size-2 rounded-full', dotColorStyles[variant])}
            />
          </span>
        )}
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </div>
    );
  }
);
StatusPill.displayName = 'StatusPill';
