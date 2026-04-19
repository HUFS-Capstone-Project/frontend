import { queryOptions, useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth-store";

import { placeTaxonomyApi } from "../api/place-taxonomy-api";
import type { PlaceFilterData } from "../api/place-taxonomy-types";
import { mapQueryKeys } from "../query-keys";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export function getPlaceFilterOptionsQueryOptions() {
  return queryOptions({
    queryKey: mapQueryKeys.placeFilterOptions(),
    queryFn: placeTaxonomyApi.getPlaceFilterOptions,
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
    retry: 1,
  });
}

type UsePlaceFilterOptionsQueryOptions = {
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<
      PlaceFilterData,
      Error,
      PlaceFilterData,
      ReturnType<typeof mapQueryKeys.placeFilterOptions>
    >,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function usePlaceFilterOptionsQuery(options?: UsePlaceFilterOptionsQueryOptions) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    ...getPlaceFilterOptionsQueryOptions(),
    enabled: (options?.enabled ?? true) && isLoggedIn && Boolean(accessToken),
    ...(options?.queryOptions ?? {}),
  });
}
