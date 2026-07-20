'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Loader2 } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  error?: string;
  disabledMessage?: string;
  emptyMessage?: string;
}

export function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = '-- Pilih --',
  searchPlaceholder = 'Cari...',
  disabled = false,
  isLoading = false,
  loadingText = 'Memuat...',
  error,
  disabledMessage,
  emptyMessage = 'Tidak ada data ditemukan',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset highlighted index & query when popover state changes
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options with performance monitoring
  const filteredOptions = useMemo(() => {
    const startTime = performance.now();
    const q = query.toLowerCase().trim();

    const filtered = !q
      ? options
      : options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(q) ||
            (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
        );

    const duration = performance.now() - startTime;
    if (duration > 100) {
      console.warn(`[SearchableSelect] Search took ${duration.toFixed(2)}ms for ${options.length} items`);
    }

    return filtered;
  }, [options, query]);

  // Reset highlight index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="space-y-1.5 w-full relative" ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <label className="text-xs font-semibold text-text-high flex items-center justify-between">
          <span>{label}</span>
          {isLoading && (
            <span className="text-[11px] text-text-muted flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> {loadingText}
            </span>
          )}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full min-h-[44px] px-3.5 rounded-xl border bg-surface-base text-left text-sm font-medium transition-colors flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-60 disabled:cursor-not-allowed ${
          error
            ? 'border-error text-error focus:ring-error'
            : isOpen
            ? 'border-brand-primary ring-2 ring-brand-primary/20'
            : 'border-border-subtle text-text-high'
        }`}
      >
        <span className={`truncate ${!selectedOption ? 'text-text-muted font-normal' : 'text-text-high'}`}>
          {isLoading
            ? loadingText
            : disabled && disabledMessage
            ? disabledMessage
            : selectedOption
            ? selectedOption.label
            : placeholder}
        </span>

        <div className="flex items-center gap-1.5 shrink-0 text-text-muted">
          {value && !disabled && !isLoading && (
            <span
              onClick={handleClear}
              className="p-1 hover:bg-surface-hover rounded-full transition-colors text-text-muted hover:text-text-high"
              title="Hapus pilihan"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Popover Menu */}
      {isOpen && !disabled && !isLoading && (
        <div className="absolute z-50 left-0 right-0 top-[calc(100%+6px)] bg-surface-elevated border border-border-subtle rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Box */}
          <div className="p-2 border-b border-border-subtle bg-surface-base sticky top-0">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 text-xs bg-surface-elevated rounded-lg border border-border-subtle text-text-high placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 text-text-muted hover:text-text-high p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div ref={listRef} className="max-h-60 overflow-y-auto p-1 space-y-0.5 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-text-muted">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = index === highlightedIndex;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                        : isHighlighted
                        ? 'bg-surface-hover text-text-high'
                        : 'text-text-high hover:bg-surface-hover'
                    }`}
                  >
                    <div className="truncate">
                      <div>{opt.label}</div>
                      {opt.sublabel && (
                        <div className="text-[10px] text-text-muted font-normal">{opt.sublabel}</div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0 text-brand-primary" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  );
}
