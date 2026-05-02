import { API_PATHS } from "@/shared/api/api-paths";
import { mobileAuthClient } from "@/shared/api/mobile-auth-client";
import type { CommonResponse } from "@/shared/types/api-types";

import type { TokenResponse } from "../types";

/** `mobileAuthClient`: CSRF 없음. 응답은 `data.accessToken`(웹 exchange의 `data.token`과 다름). */
export const mobileAuthApi = {
  exchange: async (params: {
    code: string;
    codeVerifier: string;
  }): Promise<CommonResponse<TokenResponse>> => {
    const res = await mobileAuthClient.post<CommonResponse<TokenResponse>>(
      API_PATHS.auth.mobileExchange,
      params,
    );
    return res.data;
  },

  refresh: async (params: { refreshToken: string }): Promise<CommonResponse<TokenResponse>> => {
    const res = await mobileAuthClient.post<CommonResponse<TokenResponse>>(
      API_PATHS.auth.mobileRefresh,
      params,
    );
    return res.data;
  },

  logout: async (params: { refreshToken: string }): Promise<void> => {
    await mobileAuthClient.post<CommonResponse<undefined>>(API_PATHS.auth.mobileLogout, params);
  },
};
