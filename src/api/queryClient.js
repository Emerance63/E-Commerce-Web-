import { QueryClient } from '@tanstack/react-query';

// Configure TanStack Query Client with sensible defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep inactive data in cache for 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Prevent refetching when switching browser tabs
      retry: 1, // Only retry failed requests once
    },
  },
});
