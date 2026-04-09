/**
 * API baseURL — `VITE_*`는 dev는 `.env.local`, 배포는 `.env.production`(또는 CI)에서 설정.
 *
 * - 웹·공통 `getApiBaseURL` / `getWebAuthBaseURL`: `VITE_API_BASE_URL` 있으면 그 값, 없으면 `/api`(로컬에서 Vite 프록시→8080).
 * - `getMobileAuthBaseURL`: `VITE_API_BASE_URL_MOBILE` 우선, 없으면 위와 동일.
 *
 * 조합 요약:
 * - 로컬 Web ↔ 로컬 BE: `VITE_API_BASE_URL` 비움. OAuth는 localhost:8080.
 * - 로컬 Web ↔ 운영 BE: `.env.local`에 `VITE_API_BASE_URL`·`VITE_GOOGLE_LOGIN_URL` 운영 URL.
 * - 로컬 Mobile ↔ 로컬 BE: `VITE_API_BASE_URL_MOBILE` = 에뮬/실기 호스트(예: `10.0.2.2:8080/api`).
 * - 로컬 Mobile ↔ 운영 BE: `VITE_API_BASE_URL_MOBILE` = 운영 API.
 * - 운영 Web/Mobile ↔ 운영 BE: 빌드 시 `VITE_API_BASE_URL`(필요 시 `VITE_API_BASE_URL_MOBILE`) = 운영 URL.
 */

function resolveViteApiBaseURL(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (typeof raw === "string" && raw.trim() !== "") {
    return raw.trim();
  }
  return "/api";
}

export function getApiBaseURL(): string {
  return resolveViteApiBaseURL();
}

export function getWebAuthBaseURL(): string {
  return resolveViteApiBaseURL();
}

export function getMobileAuthBaseURL(): string {
  const mobile = import.meta.env.VITE_API_BASE_URL_MOBILE;
  if (typeof mobile === "string" && mobile.trim() !== "") {
    return mobile.trim();
  }
  return resolveViteApiBaseURL();
}
