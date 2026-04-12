import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/store/auth-store";

type ProtectedRouteProps = {
  children?: ReactNode;
};

/**
 * 인증이 필요한 하위 라우트를 보호.
 * children이 없으면 <Outlet />을 렌더링해 레이아웃 라우트에서도 사용 가능.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children ?? <Outlet />;
}
