import { STORAGE_KEYS } from "@/shared/config/storage";

let hasShownInMemory = false;

/**
 * 앱 세션에서 런치 스플래시가 이미 노출됐는지 확인.
 * - 메모리: 동일 런타임 재마운트 방지
 * - sessionStorage: 라우터 재생성/경로 복귀 시에도 1회 보장
 */
export function hasShownLaunchSplash(): boolean {
  if (hasShownInMemory) return true;

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEYS.launchSplashShown);
    if (stored === "1") {
      hasShownInMemory = true;
      return true;
    }
  } catch {
    // private mode 등에서 sessionStorage 접근 실패 시 메모리 기준으로만 동작
  }

  return false;
}

/** 런치 스플래시를 "노출 완료" 상태로 기록 */
export function markLaunchSplashShown(): void {
  hasShownInMemory = true;
  try {
    window.sessionStorage.setItem(STORAGE_KEYS.launchSplashShown, "1");
  } catch {
    // no-op
  }
}
