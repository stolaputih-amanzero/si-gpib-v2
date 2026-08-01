'use client';

import { LucideIcon, SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'ghost' | 'outline';
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const handleActionClick = () => {
    haptic.light();
    if (action?.onClick) {
      action.onClick();
    }
  };

  return (
    <div className={cn('py-16 px-4 text-center flex flex-col items-center justify-center space-y-3 select-none', className)}>
      {/* Tonal Icon Chip */}
      <div className="h-16 w-16 rounded-2xl bg-surface-sunken text-ink-tertiary flex items-center justify-center shadow-xs border border-border-subtle/50 mb-1">
        <Icon className="h-8 w-8 stroke-[1.75]" />
      </div>

      <h3 className="text-base font-semibold text-ink-primary">{title}</h3>

      {description && (
        <p className="text-sm text-ink-tertiary max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <div className="pt-2">
          {action.href ? (
            <a
              href={action.href}
              onClick={handleActionClick}
              className={cn(
                'inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-xs',
                action.variant === 'ghost'
                  ? 'bg-transparent text-brand-600 hover:bg-surface-brand'
                  : action.variant === 'outline'
                  ? 'border border-border-subtle bg-surface-1 text-ink-primary hover:bg-surface-sunken'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              )}
            >
              {action.label}
            </a>
          ) : (
            <button
              type="button"
              onClick={handleActionClick}
              className={cn(
                'inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-xs',
                action.variant === 'ghost'
                  ? 'bg-transparent text-brand-600 hover:bg-surface-brand'
                  : action.variant === 'outline'
                  ? 'border border-border-subtle bg-surface-base text-ink-primary hover:bg-surface-sunken'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              )}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
