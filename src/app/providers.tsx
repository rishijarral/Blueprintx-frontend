"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui";
import { ErrorBoundary } from "@/components/common";
import { AuthProvider } from "@/contexts/AuthContext";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Optimized React Query configuration for performance
 */
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data considered fresh for 5 minutes - reduces API calls significantly
            staleTime: 5 * 60 * 1000,
            // Keep unused data in cache for 30 minutes - faster back navigation
            gcTime: 30 * 60 * 1000,
            // Only retry once to fail fast
            retry: 1,
            retryDelay: 1000,
            // Don't refetch on window focus by default (too aggressive)
            refetchOnWindowFocus: false,
            // Refetch when coming back online
            refetchOnReconnect: true,
            // Don't refetch on mount if data exists
            refetchOnMount: false,
          },
          mutations: {
            // Don't retry mutations - let user retry manually
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <ToastProvider>{children}</ToastProvider>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}
