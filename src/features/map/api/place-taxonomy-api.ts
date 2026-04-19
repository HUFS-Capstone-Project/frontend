import { api } from "@/shared/api/axios";

import type { ApiResponse, PlaceFilterData } from "./place-taxonomy-types";

const PLACE_TAXONOMY_PATH = "/v1/place-taxonomy";

export const placeTaxonomyApi = {
  getPlaceFilterOptions: async (): Promise<PlaceFilterData> => {
    const response = await api.get<ApiResponse<PlaceFilterData>>(PLACE_TAXONOMY_PATH, {
      headers: {
        Accept: "application/json",
      },
    });

    const payload = response.data;
    if (!payload.success || !payload.data) {
      throw new Error(payload.message ?? "필터 옵션 조회 실패");
    }

    return payload.data;
  },
};
