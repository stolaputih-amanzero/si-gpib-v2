'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';

export interface InfoBlockProps {
  icon?: React.ReactNode;
  label: string;
  value?: React.ReactNode | string | number | null;
  href?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  className?: string;
  testId?: string;
}

export function InfoBlock({
  icon,
  label,
  value,
  href,
  onClick,
  trailing,
  className,
  testId = 'info-block',
}: InfoBlockProps) {
  // Golden Rule: Absence != Damage. If value is null, undefined, or empty string, DO NOT RENDER.
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const isInteractive = Boolean(href || onClick);

  const handleClick = () => {
    if (onClick) {
      haptic.light();
      onClick();
    }
  };

  const content = (
    <div
      data-testid={testId}
      className={cn(
        'flex items-center justify-between py-3.5 px-4 min-h-[48px] border-b border-border-subtle/60 transition-colors',
        isInteractive && 'hover:bg-surface-sunken/60 cursor-pointer active:scale-[0.995]',
        className
      )}
      onClick={isInteractive ? handleClick : undefined}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        {icon && (
          <div className="h-9 w-9 rounded-xl bg-surface-sunken/80 text-brand-primary flex items-center justify-center shrink-0 shadow-2xs">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-0.5">
          <span className="text-xs font-semibold text-text-muted block leading-tight">
            {label}
          </span>
          <div className="text-sm font-semibold text-text-high leading-snug break-words">
            {value}
          </div>
        </div>
      </div>

      <div className="flex items-center shrink-0">
        {trailing ? (
          trailing
        ) : isInteractive ? (
          <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block select-none" onClick={() => haptic.selection()}>
        {content}
      </Link>
    );
  }

  return content;
}

export default InfoBlock;
