export type AuthChannel = "web" | "mobile";

/**
 * 런타임 채널 (모바일 확장·로컬 테스트용).
 * - 기본: 웹
 * - `VITE_AUTH_CHANNEL=mobile`: Capacitor 없이 모바일 API 경로 점검 시
 * - Capacitor: `window.Capacitor.isNativePlatform()` — 부트스트랩에서 `authChannel`과 함께 쓰면 됨
 */
export function getRuntimeAuthChannel(): AuthChannel {
  if (import.meta.env.VITE_AUTH_CHANNEL === "mobile") {
    return "mobile";
  }
  if (typeof window !== "undefined") {
    const Cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
      .Capacitor;
    if (Cap?.isNativePlatform?.()) {
      return "mobile";
    }
  }
  return "web";
}
