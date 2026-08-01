'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';

export interface ListRowProps {
  icon?: React.ReactNode;
  iconVariant?: 'brand' | 'accent' | 'default';
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ListRow({
  icon,
  iconVariant = 'brand',
  title,
  subtitle,
  meta,
  badge,
  action,
  showChevron = true,
  onClick,
  className,
}: ListRowProps) {
  let chipClass = 'bg-surface-brand text-brand-600';
  if (iconVariant === 'accent') {
    chipClass = 'bg-surface-accent text-accent-600';
  } else if (iconVariant === 'default') {
    chipClass = 'bg-surface-sunken text-ink-secondary';
  }

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, select')) return;
    if (onClick) {
      haptic.light();
      onClick();
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'tap flex items-start gap-3 px-4 py-4 hairline-b min-h-[76px] select-none transition-colors',
        onClick && 'cursor-pointer active:bg-surface-sunken/60 hover:bg-surface-sunken/40',
        className
      )}
    >
      {/* Left Icon Chip (44x44px) */}
      {icon && (
        <div
          className={cn(
            'h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs font-semibold text-lg',
            chipClass
          )}
        >
          {icon}
        </div>
      )}

      {/* Middle Content */}
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="truncate text-base font-semibold text-ink-primary leading-snug">
            {title || <span className="text-ink-disabled italic">Pos tanpa nama</span>}
          </span>
          {badge}
        </div>

        {subtitle && (
          <div className="text-sm text-ink-secondary mt-0.5 truncate leading-normal">
            {subtitle}
          </div>
        )}

        {meta && (
          <div className="text-sm text-ink-tertiary mt-1 tnum leading-normal truncate">
            {meta}
          </div>
        )}
      </div>

      {/* Right Trailing Action / Chevron */}
      {(action || showChevron) && (
        <div className="flex items-center gap-2 shrink-0 self-center">
          {action}
          {showChevron && <ChevronRight className="h-5 w-5 text-ink-tertiary shrink-0" />}
        </div>
      )}
    </div>
  );
}
