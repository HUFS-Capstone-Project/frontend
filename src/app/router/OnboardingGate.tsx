import type { ReactNode } from "react";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

import { useUserMeQuery } from "@/features/users";
import { isApiError } from "@/shared/api/axios";
import { useAuthStore } from "@/store/auth-store";

type OnboardingGateProps = {
  children: ReactNode;
};

/**
 * 온보딩 라우트 접근 제어
 * - 비로그인: /login
 * - 온보딩 완료: /room
 * - 온보딩 미완료 사용자만 접근 허용
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  const setNickname = useAuthStore((s) => s.setNickname);
  const setHasCompletedOnboarding = useAuthStore((s) => s.setHasCompletedOnboarding);
  const logout = useAuthStore((s) => s.logout);

  const meQuery = useUserMeQuery({
    enabled: isLoggedIn && Boolean(accessToken),
  });

  const me = meQuery.data;

  useEffect(() => {
    if (!me) {
      return;
    }

    setNickname(me.nickname);
    setHasCompletedOnboarding(me.onboardingCompleted);
  }, [me, setHasCompletedOnboarding, setNickname]);

  const shouldRedirectToLogin =
    meQuery.isError &&
    isApiError(meQuery.error) &&
    (meQuery.error.status === 401 ||
      meQuery.error.status === 404 ||
      meQuery.error.code === "E401_UNAUTHORIZED");

  useEffect(() => {
    if (shouldRedirectToLogin) {
      logout();
    }
  }, [logout, shouldRedirectToLogin]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!accessToken || meQuery.isPending) {
    return null;
  }

  if (shouldRedirectToLogin) {
    return <Navigate to="/login" replace />;
  }

  if (meQuery.isError) {
    return null;
  }

  const completed = me?.onboardingCompleted ?? hasCompletedOnboarding;

  if (completed) {
    return <Navigate to="/room" replace />;
  }

  return children;
}
