/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_ENV: "development" | "production" | "test";
  /** 백엔드가 내려주는 구글 OAuth 시작 URL (미설정 시 로그인 페이지에서 안내) */
  readonly VITE_GOOGLE_LOGIN_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
