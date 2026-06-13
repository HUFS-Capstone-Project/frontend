import { isAndroidCapacitorApp } from "@/features/auth/lib/capacitor-platform";

export type AuthChannel = "web" | "mobile";

/**
 * Runtime auth channel.
 * - default: web cookie/CSRF
 * - `VITE_AUTH_CHANNEL=mobile`: local mobile API-path testing
 * - Android Capacitor app: mobile bearer-token flow
 */
export function getRuntimeAuthChannel(): AuthChannel {
  if (import.meta.env.VITE_AUTH_CHANNEL === "mobile") {
    return "mobile";
  }
  if (isAndroidCapacitorApp()) {
    return "mobile";
  }
  return "web";
}

