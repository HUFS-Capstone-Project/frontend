import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/store/auth-store";

import { HomePage } from "./HomePage";
import { LoginPage } from "./LoginPage";

/**
 * 인증 상태에 따라 첫 화면을 분기합니다.
 *
 * - 미로그인                             → LoginPage
 * - 로그인 O, accessToken 복원 대기 중  → null (useInitAuth가 refresh 중)
 * - 로그인 O, 온보딩 미완료             → /onboarding/nickname 리다이렉트
 * - 로그인 O, 온보딩 완료               → HomePage
 */
export function RootIndexPage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  if (!isLoggedIn) return <LoginPage />;

  // isLoggedIn=true지만 accessToken이 없으면 useInitAuth의 refresh 복원 대기
  if (!accessToken) return null;

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding/nickname" replace />;
  }

  return <HomePage />;
}
