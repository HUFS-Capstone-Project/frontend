import { getRuntimeAuthChannel } from "@/features/auth/lib/auth-channel";

/** 웹: `VITE_WEB_GOOGLE_LOGIN_URL` — 모바일: `VITE_MOBILE_GOOGLE_LOGIN_URL` → 없으면 웹 URL 폴백. 완료 후 `/auth/callback?ticket=...` */
// TODO(모바일 OAuth): 네이티브에서는 `window.location` 대신 `@capacitor/browser` 등으로 외부 브라우저 열고, 딥링크로 앱 복귀 + PKCE(`completeMobileLoginAfterExchange`) 처리.
function resolveGoogleLoginUrl(): string | undefined {
  const mobile = getRuntimeAuthChannel() === "mobile";
  const raw = mobile
    ? (import.meta.env.VITE_MOBILE_GOOGLE_LOGIN_URL ?? import.meta.env.VITE_WEB_GOOGLE_LOGIN_URL)
    : import.meta.env.VITE_WEB_GOOGLE_LOGIN_URL;
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function handleGoogleLogin(): boolean {
  const url = resolveGoogleLoginUrl();
  if (!url) {
    if (import.meta.env.DEV) {
      const hint =
        getRuntimeAuthChannel() === "mobile"
          ? "VITE_MOBILE_GOOGLE_LOGIN_URL=http://localhost:8080/oauth2/authorization/google?client=mobile"
          : "VITE_WEB_GOOGLE_LOGIN_URL=http://localhost:8080/oauth2/authorization/google?client=web";
      console.warn(
        `[udidura] Google OAuth 시작 URL이 설정되지 않았습니다.\n` + `.env.local에 예: ${hint}`,
      );
    }
    return false;
  }
  window.location.href = url;
  return true;
}
