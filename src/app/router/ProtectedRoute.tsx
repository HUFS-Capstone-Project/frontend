import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/store/auth-store";

type ProtectedRouteProps = {
  children: ReactNode;
};

/**
 * 로그인이 필요한 하위 라우트용 (예: `/settings` 추가 시).
 * 현재 홈은 `RootIndexPage`에서 분기합니다.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}
