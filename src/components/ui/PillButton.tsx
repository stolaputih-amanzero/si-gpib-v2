import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const PillButton = React.forwardRef<HTMLButtonElement, PillButtonProps>(
  (
    {
      className,
      variant = 'gold',
      size = 'md',
      icon,
      iconPosition = 'right',
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      gold: 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-sm hover:shadow-md hover:shadow-amber-600/20 active:scale-[0.98]',
      outline:
        'bg-surface-1 border border-stone-200 dark:border-stone-800 text-ink-primary hover:bg-surface-sunken hover:border-stone-300 dark:hover:border-stone-700 active:scale-[0.98]',
      ghost:
        'bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-surface-sunken/60 active:scale-[0.98]',
      dark: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm active:scale-[0.98]',
    };

    const sizeStyles = {
      sm: 'px-3.5 py-1.5 text-xs font-semibold gap-1.5',
      md: 'px-5 py-2.5 text-sm font-semibold gap-2',
      lg: 'px-7 py-3.5 text-base font-semibold gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-all duration-180 select-none whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1.5" />
        ) : (
          icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {!isLoading && icon && iconPosition === 'right' && (
          <span className="shrink-0 transition-transform duration-180 group-hover:translate-x-0.5">
            {icon}
          </span>
        )}
      </button>
    );
  }
);
PillButton.displayName = 'PillButton';
