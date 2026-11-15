import { QueryClient } from '@tanstack/react-query';

const isTransientFailure = (error) => {
  if (!error) return true;
  const status = Number(error.status || error.response?.status);
  if (status >= 400 && status < 500 && status !== 408 && status !== 429) return false;
  return (
    error.name === 'AbortError' ||
    error.name === 'TimeoutError' ||
    error.name === 'TypeError' ||
    status === 408 ||
    status === 429 ||
    status >= 500 ||
    !Number.isFinite(status)
  );
};

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => failureCount < 2 && isTransientFailure(error),
      retryDelay: (attempt) => Math.min(700 * (2 ** attempt), 4000),
      staleTime: 30 * 1000,
    },
    mutations: {
      retry: (failureCount, error) => failureCount < 1 && isTransientFailure(error),
      retryDelay: 1000,
    },
  },
});
