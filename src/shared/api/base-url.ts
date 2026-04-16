/**
 * API baseURL — 웹 기본값은 **`/api`** (로컬: Vite 프록시, 프로덕션: Vercel `vercel.json` rewrite).
 * 모바일(Capacitor 등)은 `VITE_MOBILE_API_BASE_URL`로 절대 URL 지정 가능.
 *
 * 프록시 뒤에서도 `Set-Cookie` Domain이 프론트 호스트와 맞지 않으면 쿠키·CSRF가 깨질 수 있음.
 * OAuth: `googleLogin.ts` — `VITE_WEB_GOOGLE_LOGIN_URL` / `VITE_MOBILE_GOOGLE_LOGIN_URL`.
 */

import { getRuntimeAuthChannel } from "@/features/auth/lib/auth-channel";

/** 웹·모바일 폴백 공통 — Vite 프록시 / Vercel rewrite 전제 */
const WEB_API_BASE = "/api";

function resolveExplicitMobileApiBaseURL(): string | undefined {
  const raw = import.meta.env.VITE_MOBILE_API_BASE_URL;
  if (typeof raw === "string" && raw.trim() !== "") {
    return raw.trim();
  }
  return undefined;
}

/** 보호 API 등 — 런타임 채널에 따라 모바일 전용 base 사용 가능 */
export function getApiBaseURL(): string {
  if (getRuntimeAuthChannel() === "mobile") {
    const mobile = resolveExplicitMobileApiBaseURL();
    if (mobile) return mobile;
  }
  return WEB_API_BASE;
}

/** 쿠키 세션·CSRF — `getApiBaseURL()`과 동일한 웹 base */
export function getWebAuthBaseURL(): string {
  return WEB_API_BASE;
}

/** `mobileAuthClient` — 모바일 채널일 때만 `VITE_MOBILE_API_BASE_URL` 등 명시값 사용 (웹 빌드에 모바일 env가 있어도 혼선 방지) */
export function getMobileAuthBaseURL(): string {
  if (getRuntimeAuthChannel() === "mobile") {
    const direct = resolveExplicitMobileApiBaseURL();
    if (direct) return direct;
  }
  return getApiBaseURL();
}
