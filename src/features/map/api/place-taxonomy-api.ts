import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";

import type { ApiResponse, PlaceFilterData } from "./place-taxonomy-types";

export const placeTaxonomyApi = {
  getPlaceFilterOptions: async (): Promise<PlaceFilterData> => {
    const response = await api.get<ApiResponse<PlaceFilterData>>(API_PATHS.placeTaxonomy, {
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
