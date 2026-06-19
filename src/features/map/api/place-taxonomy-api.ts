import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";
import type { CommonResponse } from "@/shared/types/api-types";

import type { PlaceFilterData } from "./place-taxonomy-types";

export const placeTaxonomyApi = {
  getPlaceFilterOptions: async (): Promise<PlaceFilterData> => {
    const response = await api.get<CommonResponse<PlaceFilterData>>(API_PATHS.placeTaxonomy, {
      headers: {
        Accept: "application/json",
      },
    });

    const payload = response.data;
    if (!payload.success) {
      throw new Error(payload.message ?? "필터 옵션 조회 실패");
    }

    return payload.data;
  },
};
