import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";
import type { CommonResponse } from "@/shared/types/api-types";

import type {
  ExternalPlaceCandidate,
  ExternalPlaceCandidateParams,
} from "../types/place-candidate.types";

export const placeCandidateApi = {
  searchExternal: async (
    roomId: string,
    params: Required<ExternalPlaceCandidateParams>,
  ): Promise<ExternalPlaceCandidate[]> => {
    const response = await api.get<CommonResponse<ExternalPlaceCandidate[]>>(
      API_PATHS.rooms.placeCandidatesExternal(roomId),
      {
        params,
      },
    );

    return response.data.data;
  },
};
