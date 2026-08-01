'use client';

import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';

export interface FilterChipOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterChipsProps {
  options: FilterChipOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function FilterChips({ options, selectedId, onSelect, className }: FilterChipsProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto no-scrollbar px-4 py-2.5 items-center select-none', className)}>
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              haptic.selection();
              onSelect(opt.id);
            }}
            className={cn(
              'tap h-11 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center gap-1.5 shrink-0 border min-w-[44px]',
              isSelected
                ? 'bg-surface-brand text-brand-600 font-semibold border-brand-500/30 shadow-2xs'
                : 'bg-surface-sunken text-ink-secondary border-transparent hover:bg-surface-sunken/80 hover:text-ink-primary'
            )}
          >
            <span>{opt.label}</span>
            {typeof opt.count === 'number' && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full tnum font-semibold',
                  isSelected ? 'bg-brand-600/10 text-brand-600' : 'bg-surface-base text-ink-tertiary'
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
