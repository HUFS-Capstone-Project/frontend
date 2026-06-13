import { getRuntimeAuthChannel } from "@/features/auth/lib/auth-channel";
import { isAndroidCapacitorApp } from "@/features/auth/lib/capacitor-platform";
import { startAndroidGoogleOAuthLogin } from "@/features/auth/lib/mobile-oauth";

function resolveGoogleLoginUrl(): string | undefined {
  const raw = import.meta.env.VITE_WEB_GOOGLE_LOGIN_URL;
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function handleGoogleLogin(): Promise<boolean> {
  if (isAndroidCapacitorApp()) {
    try {
      await startAndroidGoogleOAuthLogin();
      return true;
    } catch (error) {
      console.error("[udidura] Google OAuth start failed", error);
      return false;
    }
  }

  const url = resolveGoogleLoginUrl();
  if (!url) {
    if (import.meta.env.DEV) {
      const hint =
        getRuntimeAuthChannel() === "mobile"
          ? "VITE_MOBILE_API_BASE_URL=https://your-api.example.com/api"
          : "VITE_WEB_GOOGLE_LOGIN_URL=http://localhost:8080/oauth2/authorization/google?client=web";
      console.warn(
        `[udidura] Google OAuth start URL is not configured.\n` + `.env.local: ${hint}`,
      );
    }
    return false;
  }
  window.location.href = url;
  return true;
}

