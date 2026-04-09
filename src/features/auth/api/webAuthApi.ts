import { isAxiosError } from "axios";

import {
  ensureCsrfCookie,
  webAuthClient,
} from "@/shared/api/webAuthClient";
import { getCookie, XSRF_COOKIE_NAME } from "@/shared/lib/cookie";
import type { CommonResponse } from "@/shared/types/api.types";

import type { AuthTokenBootstrapResponse, TokenResponse } from "../types";

/** 웹: 쿠키 세션 + CSRF. 부트스트랩 ensureCsrfCookie→refresh→getMe, 콜백 ensureCsrfCookie→exchangeTicket(data.token·me). */
export const webAuthApi = {
  /** GET /v1/auth/csrf로 `XSRF-TOKEN` 쿠키를 최신화(값은 쿠키에서만 사용). */
  ensureCsrfCookie: async (): Promise<void> => {
    await ensureCsrfCookie();
  },

  /** OAuth 콜백: ticket → `data.token.accessToken`, `data.me` */
  exchangeTicket: async (
    ticket: string,
  ): Promise<CommonResponse<AuthTokenBootstrapResponse>> => {
    const res = await webAuthClient.post<CommonResponse<AuthTokenBootstrapResponse>>(
      "/v1/auth/web/exchange-ticket",
      { ticket },
    );
    return res.data;
  },

  /** refresh 쿠키 → `data.accessToken` */
  refresh: async (): Promise<CommonResponse<TokenResponse>> => {
    const res = await webAuthClient.post<CommonResponse<TokenResponse>>("/v1/auth/refresh");
    return res.data;
  },

  /**
   * 웹 세션 로그아웃 — CSRF는 `ensureCsrfCookie({ forceRefresh: true })`로 쿠키를 맞춘 뒤
   * 다른 unsafe 요청과 동일하게 `webAuthClient` + 인터셉터로 전송.
   * Spring `CsrfFilter`는 보통 `X-XSRF-TOKEN` 헤더만으로 충분하다. JSON 본문이 거부되면
   * `application/x-www-form-urlencoded` + `_csrf`(값은 `getCookie(XSRF_COOKIE_NAME)`만)로 바꿀 수 있다.
   */
  logout: async (): Promise<void> => {
    await ensureCsrfCookie({ forceRefresh: true });
    if (!getCookie(XSRF_COOKIE_NAME)) {
      throw new Error("CSRF cookie unavailable after refresh");
    }

    try {
      await webAuthClient.post("/v1/auth/logout", {});
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
