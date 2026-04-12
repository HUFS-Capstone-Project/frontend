import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { hasShownLaunchSplash, markLaunchSplashShown } from "@/features/splash/lib/launch-splash";
import { useAuthStore } from "@/store/auth-store";

import { SplashScreenPage } from "./SplashScreenPage";

const SPLASH_DEFAULT_DURATION_MS = 2200;
const SPLASH_REDUCED_MOTION_DURATION_MS = 500;

export function EntryPage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  const [showSplash, setShowSplash] = useState<boolean>(() => !hasShownLaunchSplash());

  useEffect(() => {
    if (!showSplash) return;

    // 시작 시점에 바로 기록해, 라우트 재마운트 시에도 스플래시 1회 노출을 보장한다.
    markLaunchSplashShown();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReducedMotion
      ? SPLASH_REDUCED_MOTION_DURATION_MS
      : SPLASH_DEFAULT_DURATION_MS;

    const timeoutId = window.setTimeout(() => {
      setShowSplash(false);
    }, duration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreenPage />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // persist 상의 로그인 상태는 있으나, accessToken 복구(useInitAuth) 대기 중
  if (!accessToken) {
    return null;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding/nickname" replace />;
  }

  return <Navigate to="/room" replace />;
}
