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

export function ThemeToggle({ className, iconOnly = true }: { className?: string; iconOnly?: boolean }) {
  const { theme, setTheme } = useSmoothTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={cn('h-8 w-24 rounded-xl bg-surface-sunken animate-pulse', className)} />;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center p-1 rounded-xl bg-surface-1 border border-stone-200/80 dark:border-stone-800 shadow-2xs gap-0.5 shrink-0',
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
            aria-label={`Tema ${label}`}
            title={`Tema ${label}`}
            type="button"
            className={cn(
              'flex items-center justify-center rounded-lg transition-all select-none cursor-pointer',
              iconOnly ? 'p-1.5 min-w-[32px] min-h-[32px]' : 'gap-1.5 px-2.5 py-1 text-xs font-semibold',
              isActive
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30 shadow-2xs'
                : 'text-ink-tertiary hover:text-ink-primary hover:bg-stone-100 dark:hover:bg-stone-800/60'
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!iconOnly && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default ThemeToggle;
