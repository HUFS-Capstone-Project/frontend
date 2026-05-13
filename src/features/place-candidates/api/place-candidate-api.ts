import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";
import type { CommonResponse } from "@/shared/types/api-types";

import type { PlaceCandidate, PlaceCandidateParams } from "../types/place-candidate.types";

export const placeCandidateApi = {
  search: async (roomId: string, params: PlaceCandidateParams): Promise<PlaceCandidate[]> => {
    const response = await api.get<CommonResponse<PlaceCandidate[]>>(
      API_PATHS.rooms.placeCandidates(roomId),
      {
        params: toPlaceCandidateQueryParams(params),
      },
    );

    return response.data.data;
  },
};

function toPlaceCandidateQueryParams(params: PlaceCandidateParams) {
  return {
    keyword: params.keyword,
    region: params.region,
    categoryGroupCode: params.kakaoCategoryGroupCode,
    limit: params.limit,
  };
}
