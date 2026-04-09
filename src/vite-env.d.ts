/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API base (미설정 시 `/api` + Vite 프록시) */
  readonly VITE_API_BASE_URL: string;
  /** 모바일 전용 base, 없으면 `VITE_API_BASE_URL` (에뮬: `http://10.0.2.2:8080/api` 등) */
  readonly VITE_API_BASE_URL_MOBILE?: string;

  readonly VITE_APP_ENV: "development" | "production" | "test";

  /** Google OAuth 시작 URL */
  readonly VITE_GOOGLE_LOGIN_URL?: string;

  /** 모바일 플로우 로컬 테스트 등 — `getRuntimeAuthChannel()`와 함께 사용 */
  readonly VITE_AUTH_CHANNEL?: "web" | "mobile";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
