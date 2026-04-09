import { useAuthStore } from "@/store/auth-store";

/**
 * 액세스 토큰 접근 추상화 (현재는 Zustand).
 * 모바일 refresh는 `mobileRefreshTokenStorage` + `authStore.refreshToken` — Secure Storage 연동 시 확장.
 */
export interface ITokenStorage {
  getAccessToken(): string | null;
  setAccessToken(token: string): void;
  clearAccessToken(): void;
}

export const webTokenStorage: ITokenStorage = {
  getAccessToken: () => useAuthStore.getState().accessToken,
  setAccessToken: (token) => useAuthStore.getState().setAccessToken(token),
  clearAccessToken: () => useAuthStore.getState().setAccessToken(null),
};
