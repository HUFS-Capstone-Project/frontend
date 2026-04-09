import { getWebAuthBaseURL } from "@/shared/api/baseURL";
import {
  ensureCsrfToken,
  resolveWebAuthCsrfToken,
  webAuthClient,
} from "@/shared/api/webAuthClient";
import type { CommonResponse } from "@/shared/types/api.types";

import type { AuthTokenBootstrapResponse, TokenResponse } from "../types";

/** base가 상대 경로일 때 `window.location.origin` 붙임. */
function resolveAbsoluteApiUrl(relativePath: string): string {
  const base = getWebAuthBaseURL().replace(/\/$/, "");
  const rel = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  const full = `${base}${rel}`;
  if (full.startsWith("http")) return full;
  if (typeof window === "undefined") return full;
  return `${window.location.origin}${full.startsWith("/") ? full : `/${full}`}`;
}

/** 웹: 쿠키 세션 + CSRF. 부트스트랩 getCsrf→refresh→getMe, 콜백 getCsrf→exchangeTicket(data.token·me). */
export const webAuthApi = {
  getCsrf: async (): Promise<void> => {
    await ensureCsrfToken();
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
   * 웹 세션 로그아웃 — CSRF 처리 **전부 이 함수 안**에서 수행 (호출부는 `logout()`만 호출).
   *
   * - 인터셉터에서 `/logout`을 제외하는 이유: Axios 기본 병합과 겹치지 않게 하고, 본문·헤더를 한 번에 맞추기 위함.
   * - `forceRefresh`: 세션·쿠키 불일치 완화. 항상 필수는 아니나 로그아웃은 실패 시 UX가 크므로 선제 갱신이 안전.
   * - `fetch`: `application/x-www-form-urlencoded` + `_csrf` + `X-XSRF-TOKEN`을 확실히 보내기 위함.
   */
  logout: async (): Promise<void> => {
    const token = await resolveWebAuthCsrfToken({ forceRefresh: true });
    if (!token) {
      throw new Error("CSRF token unavailable");
    }

    /** logout은 axios 인터셉터/transform 영향을 피하고,
     * Spring Security가 기대하는 form-urlencoded + _csrf 형태를
     * 정확히 보장하기 위해 fetch로 직접 전송한다.
     */
    const url = resolveAbsoluteApiUrl("/v1/auth/logout");
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-XSRF-TOKEN": token,
      },
      body: new URLSearchParams({ _csrf: token }).toString(),
    });

    if (!res.ok) {
      let detail = "";
      try {
        const j = (await res.json()) as { detail?: string };
        detail = typeof j.detail === "string" ? j.detail : "";
      } catch {
        /* ignore */
      }
      throw new Error(detail || `Logout failed: ${res.status}`);
    }
  },
};
