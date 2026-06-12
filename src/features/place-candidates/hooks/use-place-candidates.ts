import {
  type InfiniteData,
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";

import { placeCandidateApi } from "../api/place-candidate-api";
import { placeCandidateQueryKeys } from "../query-keys";
import type {
  PlaceCandidateParams,
  PlaceCandidateSearchResponse,
} from "../types/place-candidate.types";

const DEFAULT_PLACE_CANDIDATE_LIMIT = 15;

type NormalizedPlaceCandidateParams = Omit<PlaceCandidateParams, "page"> & {
  keyword: string;
  limit: number;
};
type PlaceCandidatesQueryKey = ReturnType<typeof placeCandidateQueryKeys.search>;

type UsePlaceCandidatesOptions = {
  roomId: string | null;
  params: PlaceCandidateParams;
  enabled?: boolean;
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      PlaceCandidateSearchResponse,
      Error,
      InfiniteData<PlaceCandidateSearchResponse, number>,
      PlaceCandidatesQueryKey,
      number
    >,
    "queryKey" | "queryFn" | "enabled" | "initialPageParam" | "getNextPageParam"
  >;
};

function normalizePlaceCandidateParams(
  params: PlaceCandidateParams,
): NormalizedPlaceCandidateParams {
  return {
    keyword: params.keyword.trim(),
    region: params.region?.trim(),
    kakaoCategoryGroupCode: params.kakaoCategoryGroupCode?.trim(),
    limit: params.limit ?? DEFAULT_PLACE_CANDIDATE_LIMIT,
  };
}

export function usePlaceCandidates({
  roomId,
  params,
  enabled = true,
  queryOptions,
}: UsePlaceCandidatesOptions) {
  const resolvedRoomId = roomId ?? "__missing-room__";
  const normalizedParams = normalizePlaceCandidateParams(params);

  return useInfiniteQuery<
    PlaceCandidateSearchResponse,
    Error,
    InfiniteData<PlaceCandidateSearchResponse, number>,
    PlaceCandidatesQueryKey,
    number
  >({
    queryKey: placeCandidateQueryKeys.search(resolvedRoomId, normalizedParams),
    queryFn: ({ pageParam }) => {
      if (!roomId) {
        throw new Error("roomId is required");
      }

      return placeCandidateApi.search(roomId, {
        ...normalizedParams,
        page: pageParam,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextPage ?? undefined) : undefined,
    enabled: enabled && Boolean(roomId) && normalizedParams.keyword.length > 0,
    ...(queryOptions ?? {}),
  });
}
