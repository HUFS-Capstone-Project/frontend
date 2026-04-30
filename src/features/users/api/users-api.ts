import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";
import type { CommonResponse } from "@/shared/types/api-types";

import { normalizeUserMe, type UserMe, type UserMeResponse } from "../types/user-me";

export const usersApi = {
  getMe: async (): Promise<UserMe> => {
    const res = await api.get<CommonResponse<UserMeResponse>>(API_PATHS.users.me);
    return normalizeUserMe(res.data.data);
  },
};
