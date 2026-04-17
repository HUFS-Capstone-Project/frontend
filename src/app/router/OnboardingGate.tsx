import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/store/auth-store";

type OnboardingGateProps = {
  children: ReactNode;
};

/**
 * 온보딩 라우트 접근 제어
 * - 비로그인: /login
 * - 온보딩 완료: /room
 * - 온보딩 미완료 로그인 유저만 진입 허용
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (hasCompletedOnboarding) {
    return <Navigate to="/room" replace />;
  }

  return children;
}
