import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthChannel } from "@/features/auth/lib/auth-channel";
import { STORAGE_KEYS } from "@/shared/config/storage";

type SignInData = {
  nickname: string | null;
  hasCompletedOnboarding: boolean;
};

export type SignInOptions = {
  channel?: AuthChannel;
  refreshToken?: string | null;
};

export type AuthState = {
  accessToken: string | null;

  /** 모바일 리프레시 토큰(메모리). Secure Storage와 별도 동기화 */
  refreshToken: string | null;

  /** `web` | `mobile` — 초기화/로그아웃 시 분기 채널 */
  authChannel: AuthChannel;

  isLoggedIn: boolean;
  nickname: string | null;
  hasCompletedOnboarding: boolean;

  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setLoggedIn: (loggedIn: boolean) => void;
  setNickname: (nickname: string | null) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;

  signIn: (accessToken: string, data: SignInData, options?: SignInOptions) => void;

  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      authChannel: "web",
      isLoggedIn: false,
      nickname: null,
      hasCompletedOnboarding: false,

      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
      setNickname: (nickname) => set({ nickname }),
      setHasCompletedOnboarding: (completed) => set({ hasCompletedOnboarding: completed }),

      signIn: (accessToken, { nickname, hasCompletedOnboarding }, options) =>
        set({
          accessToken,
          isLoggedIn: true,
          nickname,
          hasCompletedOnboarding,
          authChannel: options?.channel ?? "web",
          refreshToken: options?.channel === "mobile" ? (options.refreshToken ?? null) : null,
        }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          authChannel: "web",
          isLoggedIn: false,
          nickname: null,
          hasCompletedOnboarding: false,
        }),
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        nickname: state.nickname,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        authChannel: state.authChannel,
      }),
    },
  ),
);
