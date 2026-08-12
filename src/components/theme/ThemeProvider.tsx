'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode, useEffect } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

function ThemeTransitionObserver() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const root = document.documentElement;
    let isInitial = true;

    // Skip initial page mount to avoid FOUC / transition on load
    const timer = setTimeout(() => {
      isInitial = false;
    }, 500);

    const observer = new MutationObserver((mutations) => {
      if (isInitial) return;

      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          if (!root.classList.contains('theme-transitioning')) {
            root.classList.add('theme-transitioning');
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              root.classList.remove('theme-transitioning');
            }, 400);
          }
        }
      }
    });

    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => {
      clearTimeout(timer);
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return null;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="si-gpib-theme"
    >
      <ThemeTransitionObserver />
      {children}
    </NextThemesProvider>
  );
}
