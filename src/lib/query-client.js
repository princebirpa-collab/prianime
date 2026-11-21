import { QueryClient } from "@tanstack/react-query";

const isTransientFailure = (error) => {
  if (!error) return true;
  const status = Number(error.status || error.response?.status);
  if (status >= 400 && status < 500 && status !== 408 && status !== 429) return false;
  return (
    error.name === "AbortError" ||
    error.name === "TimeoutError" ||
    error.name === "TypeError" ||
    status === 408 ||
    status === 429 ||
    status >= 500 ||
    !Number.isFinite(status)
  );
};

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,
      gcTime: 20 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => failureCount < 1 && isTransientFailure(error),
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    },
    mutations: {
      // Retrying writes can duplicate history/comments/reports after a timeout.
      retry: 0,
    },
  },
});
