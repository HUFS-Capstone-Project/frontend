import { isAxiosError } from "axios";

import { API_PATHS } from "@/shared/api/api-paths";
import { ensureCsrfCookie, webAuthClient } from "@/shared/api/web-auth-client";
import { getCookie, XSRF_COOKIE_NAME } from "@/shared/lib/cookie";
import type { CommonResponse } from "@/shared/types/api-types";

import type { AuthTokenBootstrapResponse, TokenResponse } from "../types";

/** 웹: 쿠키 세션 + CSRF. 부트스트랩 ensureCsrfCookie→refresh→getMe, 콜백 ensureCsrfCookie→exchangeTicket(data.token·me). */
export const webAuthApi = {
  /** GET /v1/auth/csrf로 `XSRF-TOKEN` 쿠키를 최신화(값은 쿠키에서만 사용). */
  ensureCsrfCookie: async (): Promise<void> => {
    await ensureCsrfCookie();
  },

  /** OAuth 콜백: ticket → `data.token.accessToken`, `data.me` */
  exchangeTicket: async (ticket: string): Promise<CommonResponse<AuthTokenBootstrapResponse>> => {
    const res = await webAuthClient.post<CommonResponse<AuthTokenBootstrapResponse>>(
      API_PATHS.auth.webExchangeTicket,
      { ticket },
    );
    return res.data;
  },

  /** refresh 쿠키 → `data.accessToken` */
  refresh: async (): Promise<CommonResponse<TokenResponse>> => {
    const res = await webAuthClient.post<CommonResponse<TokenResponse>>(API_PATHS.auth.refresh);
    return res.data;
  },

  /**
   * 웹 세션 로그아웃 — 멱등. 성공 시 **`204 No Content`(본문 없음)**.
   * CSRF: `ensureCsrfCookie({ forceRefresh: true })` 후 `XSRF-TOKEN` ↔ `X-XSRF-TOKEN` (인터셉터).
   */
  logout: async (): Promise<void> => {
    await ensureCsrfCookie({ forceRefresh: true });
    if (!getCookie(XSRF_COOKIE_NAME)) {
      throw new Error("CSRF cookie unavailable after refresh");
    }

    try {
      await webAuthClient.post(API_PATHS.auth.logout);
    } catch (e) {
      if (isAxiosError(e)) {
        const data = e.response?.data as { detail?: string; message?: string } | undefined;
        const detail =
          (typeof data?.detail === "string" && data.detail) ||
          (typeof data?.message === "string" && data.message) ||
          "";
        throw new Error(detail || `Logout failed: ${e.response?.status ?? "unknown"}`);
      }
      throw e;
    }
  },
};
