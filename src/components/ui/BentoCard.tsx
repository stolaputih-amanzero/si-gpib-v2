import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gold' | 'glass' | 'sunken';
  padded?: 'sm' | 'md' | 'lg' | 'none';
}

export const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, variant = 'default', padded = 'md', children, ...props }, ref) => {
    const variantStyles = {
      default:
        'bg-surface-1 border border-stone-200/80 dark:border-stone-800/90 shadow-sm hover:shadow-md hover:border-amber-500/25',
      gold:
        'bg-gradient-to-b from-amber-50/40 via-surface-1 to-surface-1 dark:from-amber-950/20 dark:via-surface-1 dark:to-surface-1 border border-amber-500/20 dark:border-amber-500/30 shadow-sm hover:shadow-md hover:border-amber-500/40',
      glass:
        'backdrop-blur-md bg-surface-1/90 dark:bg-surface-1/80 border border-white/40 dark:border-white/10 shadow-sm',
      sunken:
        'bg-surface-sunken border border-border-subtle shadow-inner',
    };

    const paddingStyles = {
      none: '',
      sm: 'p-4 sm:p-5',
      md: 'p-5 sm:p-6 lg:p-7',
      lg: 'p-6 sm:p-8 lg:p-10',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl sm:rounded-3xl transition-all duration-200 text-ink-primary overflow-hidden',
          variantStyles[variant],
          paddingStyles[padded],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BentoCard.displayName = 'BentoCard';

export const BentoHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />
));
BentoHeader.displayName = 'BentoHeader';

export const BentoTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-editorial text-xl sm:text-2xl font-bold tracking-tight text-ink-primary',
      className
    )}
    {...props}
  >
    {children}
  </h3>
));
BentoTitle.displayName = 'BentoTitle';

export const BentoDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs sm:text-sm text-ink-secondary leading-relaxed', className)}
    {...props}
  />
));
BentoDescription.displayName = 'BentoDescription';
