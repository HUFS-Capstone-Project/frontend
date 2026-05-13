import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { placeCandidateApi } from "../api/place-candidate-api";
import { placeCandidateQueryKeys } from "../query-keys";
import type { PlaceCandidate, PlaceCandidateParams } from "../types/place-candidate.types";

const DEFAULT_PLACE_CANDIDATE_LIMIT = 10;

type NormalizedPlaceCandidateParams = PlaceCandidateParams & {
  keyword: string;
  limit: number;
};
type PlaceCandidatesQueryKey = ReturnType<typeof placeCandidateQueryKeys.search>;

type UsePlaceCandidatesOptions = {
  roomId: string | null;
  params: PlaceCandidateParams;
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<PlaceCandidate[], unknown, PlaceCandidate[], PlaceCandidatesQueryKey>,
    "queryKey" | "queryFn" | "enabled"
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

  return useQuery({
    queryKey: placeCandidateQueryKeys.search(resolvedRoomId, normalizedParams),
    queryFn: () => {
      if (!roomId) {
        throw new Error("roomId is required");
      }

      return placeCandidateApi.search(roomId, normalizedParams);
    },
    enabled: enabled && Boolean(roomId) && normalizedParams.keyword.length > 0,
    ...(queryOptions ?? {}),
  });
}
