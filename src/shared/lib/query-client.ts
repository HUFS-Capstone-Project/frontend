import { QueryClient } from "@tanstack/react-query";

const defaultStaleTime = 60 * 1000;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: defaultStaleTime,
        retry: (failureCount, error) => {
          const status = getErrorStatus(error);
          if (status === 401 || status === 403 || status === 404) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function getErrorStatus(error: unknown): number | undefined {
  if (error && typeof error === "object" && "response" in error) {
    const res = (error as { response?: { status?: number } }).response;
    return res?.status;
  }
  return undefined;
}
