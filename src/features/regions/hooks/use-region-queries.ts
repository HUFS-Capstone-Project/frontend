import { useQueries, useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { regionApi } from "../api/region-api";
import { regionQueryKeys } from "../query-keys";
import { REGION_ALL_CODE, type RegionOption } from "../types/region.types";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

type UseSidosQueryOptions = {
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<
      RegionOption[],
      Error,
      RegionOption[],
      ReturnType<typeof regionQueryKeys.sidos>
    >,
    "queryKey" | "queryFn" | "enabled"
  >;
};

type UseSigungusQueryOptions = {
  sidoCode: string | null;
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<
      RegionOption[],
      Error,
      RegionOption[],
      ReturnType<typeof regionQueryKeys.sigungus>
    >,
    "queryKey" | "queryFn" | "enabled"
  >;
};

type UseSigungusQueriesOptions = {
  sidoCodes: string[];
  enabled?: boolean;
};

export function useSidosQuery(options?: UseSidosQueryOptions) {
  return useQuery({
    queryKey: regionQueryKeys.sidos(),
    queryFn: regionApi.getSidos,
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
    retry: 1,
    enabled: options?.enabled ?? true,
    ...(options?.queryOptions ?? {}),
  });
}

export function useSigungusQuery({
  sidoCode,
  enabled = true,
  queryOptions,
}: UseSigungusQueryOptions) {
  const resolvedSidoCode = sidoCode ?? REGION_ALL_CODE;

  return useQuery({
    queryKey: regionQueryKeys.sigungus(resolvedSidoCode),
    queryFn: () => {
      if (!sidoCode || sidoCode === REGION_ALL_CODE) {
        throw new Error("sidoCode is required");
      }

      return regionApi.getSigungus(sidoCode);
    },
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
    retry: 1,
    enabled: enabled && Boolean(sidoCode) && sidoCode !== REGION_ALL_CODE,
    ...(queryOptions ?? {}),
  });
}

export function useSigungusQueries({ sidoCodes, enabled = true }: UseSigungusQueriesOptions) {
  return useQueries({
    queries: sidoCodes.map((sidoCode) => ({
      queryKey: regionQueryKeys.sigungus(sidoCode),
      queryFn: () => regionApi.getSigungus(sidoCode),
      staleTime: ONE_DAY_MS,
      gcTime: ONE_DAY_MS,
      retry: 1,
      enabled: enabled && sidoCode !== REGION_ALL_CODE,
    })),
  });
}
