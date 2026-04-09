/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 웹: API base (미설정 시 `/api` + Vite 프록시) */
  readonly VITE_WEB_API_BASE_URL?: string;

  /** 모바일: API base — `getRuntimeAuthChannel()==='mobile'`일 때 `getApiBaseURL()` 우선 */
  readonly VITE_MOBILE_API_BASE_URL?: string;

  readonly VITE_APP_ENV: "development" | "production" | "test";

  /** 웹: Google OAuth 시작 URL */
  readonly VITE_WEB_GOOGLE_LOGIN_URL?: string;

  /** 모바일: Google OAuth 시작 URL — 없으면 `VITE_WEB_GOOGLE_LOGIN_URL`로 폴백 */
  readonly VITE_MOBILE_GOOGLE_LOGIN_URL?: string;

  /** 모바일 플로우 로컬 테스트 등 — `getRuntimeAuthChannel()`와 함께 사용 */
  readonly VITE_AUTH_CHANNEL?: "web" | "mobile";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
