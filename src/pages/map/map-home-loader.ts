import { getPlaceFilterOptionsQueryOptions } from "@/features/map/hooks/use-place-filter-options-query";
import { appQueryClient } from "@/shared/lib/query-client";
import { useAuthStore } from "@/store/auth-store";

const MAP_FILTER_PREFETCH_TIMEOUT_MS = 300;

function waitFor(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

export async function mapHomeLoader(): Promise<null> {
  const { isLoggedIn, accessToken } = useAuthStore.getState();

  if (!isLoggedIn || !accessToken) {
    return null;
  }

  const prefetchPromise = appQueryClient
    .prefetchQuery(getPlaceFilterOptionsQueryOptions())
    .catch(() => undefined);

  await Promise.race([prefetchPromise, waitFor(MAP_FILTER_PREFETCH_TIMEOUT_MS)]);

  return null;
}
