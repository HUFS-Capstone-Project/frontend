import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";
import type { CommonResponse } from "@/shared/types/api-types";

import { normalizeUserMe, type UserMe, type UserMeResponse } from "../types/user-me";
import type { NormalizedUserPlaceListParams, UserPlaceListResponse } from "../types/user-place";

export const usersApi = {
  getMe: async (): Promise<UserMe> => {
    const res = await api.get<CommonResponse<UserMeResponse>>(API_PATHS.users.me);
    return normalizeUserMe(res.data.data);
  },

  updateNickname: async (payload: { nickname: string }): Promise<UserMe> => {
    const res = await api.patch<CommonResponse<UserMeResponse>>(API_PATHS.users.nickname, payload);
    return normalizeUserMe(res.data.data);
  },

  getMyPlaces: async (params: NormalizedUserPlaceListParams): Promise<UserPlaceListResponse> => {
    const res = await api.get<CommonResponse<UserPlaceListResponse>>(API_PATHS.users.places, {
      params: toMyPlaceListQueryParams(params),
    });
    return res.data.data;
  },
};

function toMyPlaceListQueryParams(params: NormalizedUserPlaceListParams) {
  const queryParams: Record<string, string | number> = {
    page: params.page,
    size: params.size,
  };

  if (params.keyword.length > 0) queryParams.keyword = params.keyword;
  if (params.category.length > 0) queryParams.category = params.category;
  if (params.categoryCode.length > 0) queryParams.categoryCode = params.categoryCode;
  if (params.tagCode.length > 0 && params.tagCode !== "ALL") queryParams.tagCode = params.tagCode;
  if (params.sidoCode.length > 0) queryParams.sidoCode = params.sidoCode;
  if (params.sigunguCode.length > 0) queryParams.sigunguCode = params.sigunguCode;

  return queryParams;
}
