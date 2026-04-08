import { useAuthStore } from "@/store/authStore";

import { HomePage } from "./HomePage";
import { LoginPage } from "./LoginPage";

/**
 * 인증 여부에 따라 첫 화면을 로그인 또는 홈으로 분기합니다.
 */
export function RootIndexPage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return <HomePage />;
}
