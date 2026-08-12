'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SemanticRowProps {
  leftSlot?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  rightSlot?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isLast?: boolean;
}

/**
 * Surface Normalization Gate V1 — Semantic Row Component (F1.6)
 * Replaces floating card soup for homogeneous list data with full-width rows & 1px hairline dividers.
 */
export function SemanticRow({
  leftSlot,
  title,
  subtitle,
  rightSlot,
  badge,
  onClick,
  className,
  isLast = false,
}: SemanticRowProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between gap-3 px-gutter-mobile md:px-gutter-desktop py-3.5 text-left transition-colors',
        onClick && 'hover:bg-surface-sunken active:bg-surface-sunken/80 cursor-pointer',
        !isLast && 'hairline-b',
        className
      )}
    >
      {/* Left Avatar / Icon Slot */}
      {leftSlot && (
        <div className="shrink-0 flex items-center justify-center">
          {leftSlot}
        </div>
      )}

      {/* Main Title & Subtitle Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-text-high truncate">{title}</span>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {/* Right Action / Trailing Slot */}
      {rightSlot && (
        <div className="shrink-0 flex items-center gap-1.5 text-text-muted">
          {rightSlot}
        </div>
      )}
    </Component>
  );
}

export default SemanticRow;
