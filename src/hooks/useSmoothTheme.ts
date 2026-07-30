'use client';

import { useTheme } from 'next-themes';
import { useCallback } from 'react';

/**
 * Custom hook wrapper for next-themes `useTheme`
 * Provides silky smooth & clean theme transitions using View Transitions API
 * with CSS transition class fallbacks for older browsers.
 */
export function useSmoothTheme() {
  const { theme, setTheme, resolvedTheme, ...rest } = useTheme();

  const setSmoothTheme = useCallback(
    (newTheme: string) => {
      if (typeof document === 'undefined') {
        setTheme(newTheme);
        return;
      }

      const doc = document;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Skip all animations if user prefers reduced motion (WCAG 2.1 AA / NFR-31)
      if (prefersReducedMotion) {
        setTheme(newTheme);
        return;
      }

      const root = doc.documentElement;

      // 1. Modern View Transitions API (Chrome 111+, Edge 111+, Safari 18+)
      if (typeof (doc as any).startViewTransition === 'function') {
        root.classList.add('theme-transitioning');
        (doc as any).startViewTransition(() => {
          setTheme(newTheme);
        });
        window.setTimeout(() => {
          root.classList.remove('theme-transitioning');
        }, 400);
        return;
      }

      // 2. CSS Transition Fallback (Firefox and older browsers)
      root.classList.add('theme-transitioning');
      setTheme(newTheme);
      window.setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 400);
    },
    [setTheme]
  );

  return {
    theme,
    setTheme: setSmoothTheme,
    resolvedTheme,
    ...rest,
  };
}
