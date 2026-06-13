import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";

import { isAndroidCapacitorApp } from "@/features/auth/lib/capacitor-platform";
import { clearMobileAuthArtifacts } from "@/features/auth/lib/mobile-auth-cleanup";
import { completeMobileLoginAfterExchange } from "@/features/auth/lib/mobile-login";
import { mobileOAuthCodeVerifierStorage } from "@/features/auth/lib/mobile-oauth-code-verifier-storage";
import { setMobileOAuthUserError } from "@/features/auth/lib/mobile-oauth-error";
import { generateCodeChallenge, generateCodeVerifier } from "@/features/auth/lib/mobile-oauth-pkce";
import { APP_ROUTES } from "@/shared/config/routes";
import { useAuthStore } from "@/store/auth-store";

const MOBILE_CALLBACK_PROTOCOL = "udidura:";
const MOBILE_CALLBACK_HOST = "auth";
const MOBILE_CALLBACK_PATH = "/callback";
const GOOGLE_OAUTH_PATH = "/oauth2/authorization/google";

type RegisterMobileOAuthCallbackOptions = {
  navigate: (path: string) => void | Promise<void>;
};

let callbackListenerRegistered = false;
let callbackInFlight = false;

export async function startAndroidGoogleOAuthLogin(): Promise<void> {
  if (!isAndroidCapacitorApp()) {
    throw new Error("Android Capacitor runtime is required for mobile OAuth login");
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const loginUrl = buildAndroidGoogleOAuthUrl(codeChallenge);

  await mobileOAuthCodeVerifierStorage.setCodeVerifier(codeVerifier);

  try {
    await Browser.open({ url: loginUrl });
  } catch (error) {
    await mobileOAuthCodeVerifierStorage.removeCodeVerifier();
    throw error;
  }
}

export function registerMobileOAuthCallbackHandler(
  options: RegisterMobileOAuthCallbackOptions,
): void {
  if (!isAndroidCapacitorApp() || callbackListenerRegistered) {
    return;
  }

  callbackListenerRegistered = true;

  void App.addListener("appUrlOpen", async (event) => {
    let callbackUrl: URL;

    try {
      callbackUrl = new URL(event.url);
    } catch (error) {
      console.error("[udidura] Invalid mobile OAuth callback URL", error);
      return;
    }

    if (!isMobileOAuthCallback(callbackUrl)) {
      return;
    }

    await closeBrowserQuietly();

    if (callbackInFlight) {
      return;
    }
    callbackInFlight = true;

    try {
      const oauthError = callbackUrl.searchParams.get("error");
      if (oauthError) {
        throw new Error(`OAuth callback error: ${oauthError}`);
      }

      const code = callbackUrl.searchParams.get("code");
      if (!code) {
        throw new Error("OAuth callback code is missing");
      }

      const codeVerifier = await mobileOAuthCodeVerifierStorage.getCodeVerifier();
      if (!codeVerifier) {
        throw new Error("PKCE code verifier is missing");
      }

      await completeMobileLoginAfterExchange({ code, codeVerifier });
      await mobileOAuthCodeVerifierStorage.removeCodeVerifier();

      const destination = useAuthStore.getState().hasCompletedOnboarding
        ? APP_ROUTES.room
        : APP_ROUTES.onboardingNickname;
      await options.navigate(destination);
    } catch (error) {
      console.error("[udidura] Mobile Google login failed", error);
      await clearMobileAuthArtifacts();
      setMobileOAuthUserError();
      useAuthStore.getState().logout();
      await options.navigate(APP_ROUTES.login);
    } finally {
      callbackInFlight = false;
    }
  });
}

function buildAndroidGoogleOAuthUrl(codeChallenge: string): string {
  const baseUrl = resolveMobileGoogleOAuthBaseUrl();
  if (!baseUrl) {
    throw new Error("VITE_MOBILE_API_BASE_URL or VITE_MOBILE_GOOGLE_LOGIN_URL is required");
  }

  const url = new URL(baseUrl);
  url.searchParams.set("client", "app");
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  return url.toString();
}

function resolveMobileGoogleOAuthBaseUrl(): string | null {
  const configuredLoginUrl = normalizeAbsoluteUrl(import.meta.env.VITE_MOBILE_GOOGLE_LOGIN_URL);
  if (configuredLoginUrl) return configuredLoginUrl;

  const apiBaseUrl = normalizeAbsoluteUrl(import.meta.env.VITE_MOBILE_API_BASE_URL);
  if (!apiBaseUrl) return null;

  const url = new URL(apiBaseUrl);
  url.pathname = stripTrailingApiSegment(url.pathname) + GOOGLE_OAUTH_PATH;
  url.search = "";
  url.hash = "";
  return url.toString();
}

function normalizeAbsoluteUrl(raw: string | undefined): string | null {
  if (typeof raw !== "string") return null;

  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;

  try {
    return new URL(trimmed).toString();
  } catch {
    return null;
  }
}

function stripTrailingApiSegment(pathname: string): string {
  return pathname.replace(/\/api\/?$/, "").replace(/\/$/, "");
}

function isMobileOAuthCallback(url: URL): boolean {
  return (
    url.protocol === MOBILE_CALLBACK_PROTOCOL &&
    url.host === MOBILE_CALLBACK_HOST &&
    url.pathname === MOBILE_CALLBACK_PATH
  );
}

async function closeBrowserQuietly(): Promise<void> {
  try {
    await Browser.close();
  } catch {
    // Browser may already be closed after the app is resumed by the deep link.
  }
}
