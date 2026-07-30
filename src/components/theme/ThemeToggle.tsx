'use client';

import { useSmoothTheme } from '@/hooks/useSmoothTheme';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { haptic } from '@/lib/haptic/vibrate';

const THEMES = [
  { value: 'light', label: 'Terang', icon: Sun },
  { value: 'dark', label: 'Gelap', icon: Moon },
  { value: 'system', label: 'Sistem', icon: Monitor },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useSmoothTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={cn('h-12 w-full max-w-sm rounded-xl bg-surface-sunken animate-pulse', className)} />;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-xl bg-surface-sunken p-1.5 border border-line-subtle w-full max-w-sm',
        className
      )}
      role="radiogroup"
      aria-label="Pilih tema tampilan"
    >
      {THEMES.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => {
              haptic.selection();
              setTheme(value);
            }}
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            type="button"
            className={cn(
              'flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-fast motion-reduce:transition-none select-none tap',
              isActive
                ? 'bg-surface-1 text-ink-primary shadow-xs border border-line-hairline'
                : 'text-ink-tertiary hover:text-ink-secondary active:scale-[0.97]'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
