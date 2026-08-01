'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';

export interface FilterChip {
  key: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export interface FilterChipsProps {
  items: FilterChip[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

export function FilterChips({
  items = [],
  active,
  onChange,
  className,
}: FilterChipsProps) {
  const handleSelect = (key: string) => {
    haptic.selection();
    if (onChange) onChange(key);
  };

  return (
    <div
      role="group"
      aria-label="Filter kategori"
      className={cn(
        'flex gap-2 overflow-x-auto no-scrollbar px-4 py-3 items-center select-none',
        className
      )}
    >
      {items.map((opt) => {
        const itemKey = opt.key;
        const isSelected = itemKey === active;
        return (
          <button
            key={itemKey}
            type="button"
            aria-pressed={isSelected}
            onClick={() => handleSelect(itemKey)}
            className={cn(
              'tap h-11 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center gap-1.5 shrink-0 border min-w-[44px]',
              isSelected
                ? 'bg-surface-brand text-brand-600 font-semibold border-brand-500/30 shadow-2xs'
                : 'bg-surface-sunken text-ink-secondary border-transparent hover:bg-surface-sunken/80 hover:text-ink-primary'
            )}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
            {typeof opt.count === 'number' && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full tnum font-semibold transition-colors',
                  isSelected
                    ? 'bg-brand-600/10 text-brand-600'
                    : 'bg-surface-base text-ink-tertiary'
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
