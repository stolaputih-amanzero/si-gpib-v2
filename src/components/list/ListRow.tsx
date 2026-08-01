'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';

export interface ListRowProps {
  icon?: React.ReactNode;
  iconClassName?: string;
  iconVariant?: 'brand' | 'accent' | 'default' | 'none';
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  badge?: React.ReactNode;
  trailing?: React.ReactNode;
  action?: React.ReactNode;
  showChevron?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
  testId?: string;
}

export function ListRow({
  icon,
  iconClassName,
  iconVariant = 'brand',
  title,
  subtitle,
  meta,
  badge,
  trailing,
  action,
  showChevron = true,
  href,
  onClick,
  className,
  testId = 'list-row',
}: ListRowProps) {
  let chipClass = 'bg-surface-brand text-brand-600';
  if (iconVariant === 'accent') {
    chipClass = 'bg-surface-accent text-accent-600';
  } else if (iconVariant === 'default') {
    chipClass = 'bg-surface-sunken text-ink-secondary';
  } else if (iconVariant === 'none') {
    chipClass = '';
  }

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, select')) return;
    if (onClick) {
      haptic.light();
      onClick();
    }
  };

  const content = (
    <>
      {/* Left Icon Chip (44x44px) */}
      {icon && (
        <div
          className={cn(
            'h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs font-semibold text-lg min-h-[44px] min-w-[44px]',
            chipClass,
            iconClassName
          )}
        >
          {icon}
        </div>
      )}

      {/* Middle Content */}
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="truncate text-base font-semibold text-ink-primary leading-snug">
            {title || <span className="text-ink-disabled italic">Tanpa nama</span>}
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

      {/* Right Trailing Node / Action / Chevron */}
      {(trailing || action || showChevron) && (
        <div className="flex items-center gap-2 shrink-0 self-center">
          {action}
          {trailing || (showChevron && <ChevronRight className="h-5 w-5 text-ink-tertiary shrink-0" />)}
        </div>
      )}
    </>
  );

  const containerClasses = cn(
    'tap flex items-start gap-3 px-4 py-4 hairline-b min-h-[76px] select-none transition-colors',
    (onClick || href) && 'cursor-pointer active:bg-surface-sunken/60 hover:bg-surface-sunken/40',
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={() => haptic.light()}
        className={containerClasses}
        data-testid={testId}
      >
        {content}
      </Link>
    );
  }

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
      className={containerClasses}
      data-testid={testId}
    >
      {content}
    </div>
  );
}
