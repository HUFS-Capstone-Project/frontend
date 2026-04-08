import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

type OnboardingGateProps = {
  children: ReactNode;
};

/**
 * 온보딩은 미로그인(또는 온보딩 미완료) 게스트 플로우 전용.
 * 이미 온보딩까지 끝난 로그인 사용자는 홈으로 보냅니다.
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const hasCompletedOnboarding = useAuthStore(
    (s) => s.hasCompletedOnboarding,
  );

  if (isLoggedIn && hasCompletedOnboarding) {
    return <Navigate to="/" replace />;
  }

  return children;
}
