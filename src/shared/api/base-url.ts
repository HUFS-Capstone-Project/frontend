/**
 * API baseURL — `VITE_*`는 dev는 `.env.local`, 배포는 `.env.production`(또는 CI)에서 설정.
 *
 * - **웹**: `VITE_WEB_API_BASE_URL` → 없으면 `/api`(로컬 Vite 프록시→8080, 프로덕션은 `vercel.json`의 `/api` rewrite).
 * - **프로덕션 웹(Vercel)**: same-origin CSRF를 위해 `VITE_WEB_API_BASE_URL`을 **비우거나 설정하지 않고** `/api`만 쓰는 것을 권장.
 *   (대시보드에 절대 URL이 남아 있으면 크로스 오리진으로 다시 호출됨.)
 * - **모바일**(Capacitor·`VITE_AUTH_CHANNEL=mobile`): `VITE_MOBILE_API_BASE_URL` 우선,
 *   없으면 웹과 동일하게 `VITE_WEB_API_BASE_URL`·`/api`.
 * - **웹 인증 전용** `getWebAuthBaseURL`: 항상 웹용 `VITE_WEB_API_BASE_URL` (쿠키·CSRF 도메인).
 *
 * **백엔드(프록시 배포 시)**: `Set-Cookie`의 `Domain`이 API 호스트(예: Render)에만 고정되면 브라우저가 프론트 origin에 쿠키를 저장하지 않음.
 * Vercel origin에서 세션·`XSRF-TOKEN`이 잡히도록 Domain/Path/SameSite를 조정해야 함.
 *
 * OAuth URL: `googleLogin.ts` — `VITE_WEB_GOOGLE_LOGIN_URL` / `VITE_MOBILE_GOOGLE_LOGIN_URL`.
 */

import { getRuntimeAuthChannel } from "@/features/auth/lib/auth-channel";

function resolveViteWebApiBaseURL(): string {
  const raw = import.meta.env.VITE_WEB_API_BASE_URL;
  if (typeof raw === "string" && raw.trim() !== "") {
    return raw.trim();
  }
  return "/api";
}

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
  return resolveViteWebApiBaseURL();
}

/** 쿠키 세션·CSRF — 웹 백엔드 호스트만 (모바일 채널에서도 동일 env 키) */
export function getWebAuthBaseURL(): string {
  return resolveViteWebApiBaseURL();
}

/** `mobileAuthClient` — 모바일 채널일 때만 `VITE_MOBILE_API_BASE_URL` 등 명시값 사용 (웹 빌드에 모바일 env가 있어도 혼선 방지) */
export function getMobileAuthBaseURL(): string {
  if (getRuntimeAuthChannel() === "mobile") {
    const direct = resolveExplicitMobileApiBaseURL();
    if (direct) return direct;
  }
  return getApiBaseURL();
}
