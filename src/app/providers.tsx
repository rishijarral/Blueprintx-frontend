"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastProvider } from "@/components/ui";
import { ErrorBoundary } from "@/components/common";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Optimized React Query configuration for scalability
 * 
 * - Increased staleTime reduces unnecessary refetches
 * - Longer gcTime keeps data in cache for faster navigation
 * - refetchOnWindowFocus: 'always' only for fresh data on tab switch
 * - refetchOnReconnect helps mobile/unstable connections
 */
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data considered fresh for 2 minutes - reduces API calls
            staleTime: 2 * 60 * 1000,
            // Keep unused data in cache for 10 minutes - faster back navigation
            gcTime: 10 * 60 * 1000,
            // Retry failed requests with exponential backoff
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch stale data on window focus (not all data)
            refetchOnWindowFocus: true,
            // Refetch when coming back online
            refetchOnReconnect: true,
            // Don't refetch on mount if data is still fresh
            refetchOnMount: true,
            // Use placeholder data while fetching (reduces layout shift)
            placeholderData: (previousData: unknown) => previousData,
          },
          mutations: {
            // Retry mutations once on failure (with delay)
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ToastProvider>{children}</ToastProvider>
      </ErrorBoundary>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
