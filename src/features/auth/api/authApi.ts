import { api } from "@/shared/api/axios";
import type { CommonResponse } from "@/shared/types/api.types";

import type { UserProfile } from "../types";

/** Bearer 공통(`/me` 등). 로그인·쿠키는 webAuthApi / mobileAuthApi. */
export const authApi = {
  getMe: async (): Promise<CommonResponse<UserProfile>> => {
    const res = await api.get<CommonResponse<UserProfile>>("/v1/auth/me");
    return res.data;
  },

  logoutAll: async (): Promise<void> => {
    await api.post("/v1/auth/logout-all");
  },
};
