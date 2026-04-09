import { mobileRefreshTokenStorage } from "@/features/auth/lib/mobileRefreshTokenStorage";
import { useAuthStore } from "@/store/authStore";

/** 메모리(Zustand) → Secure Storage 순으로 모바일 refresh token 조회 */
export async function resolveMobileRefreshToken(): Promise<string | null> {
  const mem = useAuthStore.getState().refreshToken;
  if (mem) return mem;
  return mobileRefreshTokenStorage.getRefreshToken();
}
