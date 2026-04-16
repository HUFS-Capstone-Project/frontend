import { api } from "@/shared/api/axios";
import type { CommonResponse } from "@/shared/types/api-types";

import { normalizeUserMe, type UserMe, type UserMeResponse } from "../types/user-me";

const USERS_ME_PATH = "/v1/users/me";

export const usersApi = {
  getMe: async (): Promise<UserMe> => {
    const res = await api.get<CommonResponse<UserMeResponse>>(USERS_ME_PATH);
    return normalizeUserMe(res.data.data);
  },
};
