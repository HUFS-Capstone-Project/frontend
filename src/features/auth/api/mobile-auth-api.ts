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
      "/v1/auth/mobile/exchange",
      params,
    );
    return res.data;
  },

  refresh: async (params: { refreshToken: string }): Promise<CommonResponse<TokenResponse>> => {
    const res = await mobileAuthClient.post<CommonResponse<TokenResponse>>(
      "/v1/auth/mobile/refresh",
      params,
    );
    return res.data;
  },

  logout: async (params: { refreshToken: string }): Promise<void> => {
    await mobileAuthClient.post<CommonResponse<undefined>>("/v1/auth/mobile/logout", params);
  },
};
