'use client';

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag while rendering React component')) {
      return; // Suppress React 19 script tag warning from next-themes
    }
    originalError.apply(console, args);
  };
}

export function SuppressConsoleWarning() {
  return null;
}
