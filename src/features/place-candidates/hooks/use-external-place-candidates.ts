import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { placeCandidateApi } from "../api/place-candidate-api";
import { placeCandidateQueryKeys } from "../query-keys";
import type {
  ExternalPlaceCandidate,
  ExternalPlaceCandidateParams,
} from "../types/place-candidate.types";

const DEFAULT_EXTERNAL_PLACE_LIMIT = 10;

type NormalizedExternalPlaceCandidateParams = Required<ExternalPlaceCandidateParams>;
type ExternalPlaceCandidatesQueryKey = ReturnType<typeof placeCandidateQueryKeys.external>;

type UseExternalPlaceCandidatesOptions = {
  roomId: string | null;
  params: ExternalPlaceCandidateParams;
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<
      ExternalPlaceCandidate[],
      unknown,
      ExternalPlaceCandidate[],
      ExternalPlaceCandidatesQueryKey
    >,
    "queryKey" | "queryFn" | "enabled"
  >;
};

function normalizeExternalPlaceCandidateParams(
  params: ExternalPlaceCandidateParams,
): NormalizedExternalPlaceCandidateParams {
  return {
    keyword: params.keyword.trim(),
    region: params.region?.trim() ?? "",
    categoryGroupCode: params.categoryGroupCode?.trim() ?? "",
    limit: params.limit ?? DEFAULT_EXTERNAL_PLACE_LIMIT,
  };
}

export function useExternalPlaceCandidates({
  roomId,
  params,
  enabled = true,
  queryOptions,
}: UseExternalPlaceCandidatesOptions) {
  const resolvedRoomId = roomId ?? "__missing-room__";
  const normalizedParams = normalizeExternalPlaceCandidateParams(params);

  return useQuery({
    queryKey: placeCandidateQueryKeys.external(resolvedRoomId, normalizedParams),
    queryFn: () => {
      if (!roomId) {
        throw new Error("roomId is required");
      }

      return placeCandidateApi.searchExternal(roomId, normalizedParams);
    },
    enabled: enabled && Boolean(roomId) && normalizedParams.keyword.length > 0,
    ...(queryOptions ?? {}),
  });
}
