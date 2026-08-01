'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes stale time for master data
            gcTime: 1000 * 60 * 15, // 15 minutes memory cache retention
            refetchOnWindowFocus: false, // 🔴 Disable auto-refetch on window/keyboard focus
            refetchOnReconnect: false, // 🔴 Disable auto-refetch on reconnect
            refetchOnMount: true, // Refetch on mount only if stale
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
