'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface QuickSelectChipsProps {
  options?: string[];
  value?: string;
  onChange: (value: string) => void;
  allowCustom?: boolean;
  className?: string;
}

const DEFAULT_OPTIONS = [
  'Kunjungan Jemaat',
  'Ibadah Rumah Tangga',
  'Baptisan Kudus',
  'Pernikahan',
  'Pemakaman / Kematian',
  'Lainnya',
];

export function QuickSelectChips({
  options = DEFAULT_OPTIONS,
  value = '',
  onChange,
  allowCustom = true,
  className,
}: QuickSelectChipsProps) {
  const isValueInOptions = options.includes(value);
  const initialChip = isValueInOptions ? value : value ? 'Lainnya' : '';
  const initialCustomText = isValueInOptions ? '' : value;

  const [selectedChip, setSelectedChip] = useState<string>(initialChip);
  const [customText, setCustomText] = useState<string>(initialCustomText);

  useEffect(() => {
    if (isValueInOptions) {
      setSelectedChip(value);
    } else if (value) {
      setSelectedChip('Lainnya');
      setCustomText(value);
    }
  }, [value, isValueInOptions]);

  const handleChipClick = (chip: string) => {
    setSelectedChip(chip);
    if (chip !== 'Lainnya') {
      onChange(chip);
    } else {
      onChange(customText || 'Lainnya');
    }
  };

  const handleCustomTextChange = (text: string) => {
    setCustomText(text);
    onChange(text.trim() ? text : 'Lainnya');
  };

  return (
    <div className={cn('space-y-3 w-full', className)}>
      {/* Horizontal Scroll Chip Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5">
        {options.map((chip) => {
          const isSelected = selectedChip === chip;
          return (
            <button
              key={chip}
              type="button"
              data-testid={`chip-${chip.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => handleChipClick(chip)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-extrabold transition-all shrink-0 min-h-[44px] flex items-center justify-center border cursor-pointer active:scale-95',
                isSelected
                  ? 'bg-brand-primary text-white border-brand-primary shadow-2xs'
                  : 'bg-surface-1 border-border-subtle text-text-muted hover:bg-surface-sunken hover:text-text-high'
              )}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {/* Dynamic Text Input for "Lainnya" */}
      {selectedChip === 'Lainnya' && allowCustom && (
        <div className="animate-fade-in">
          <input
            type="text"
            data-testid="input-kegiatan"
            value={customText}
            onChange={(e) => handleCustomTextChange(e.target.value)}
            placeholder="Tuliskan jenis kegiatan lainnya..."
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

export default QuickSelectChips;
