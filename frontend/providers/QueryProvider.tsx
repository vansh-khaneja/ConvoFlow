'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a client instance per component mount
  // This ensures SSR compatibility with Next.js
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: how long data is considered fresh (10 seconds)
            staleTime: 10 * 1000,
            
            // Cache time: how long unused data stays in cache (5 minutes)
            gcTime: 5 * 60 * 1000,
            
            // Refetch on window focus to keep data fresh
            refetchOnWindowFocus: true,
            
            // Refetch on mount if data is stale
            refetchOnMount: true,
            
            // Retry failed requests 1 time
            retry: 1,
            
            // Retry delay
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

