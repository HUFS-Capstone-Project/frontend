import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthChannel } from "@/features/auth/lib/authChannel";

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

  /** 모바일 전용(메모리). Secure Storage는 별도 연동. */
  refreshToken: string | null;

  /** `web` | `mobile` — 부트스트랩·로그아웃 분기(persist) */
  authChannel: AuthChannel;

  isLoggedIn: boolean;
  nickname: string | null;
  hasCompletedOnboarding: boolean;

  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setLoggedIn: (loggedIn: boolean) => void;
  setNickname: (nickname: string | null) => void;

  signIn: (accessToken: string, data: SignInData, options?: SignInOptions) => void;

  completeOnboardingFlow: (nickname: string) => void;

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

      signIn: (accessToken, { nickname, hasCompletedOnboarding }, options) =>
        set({
          accessToken,
          isLoggedIn: true,
          nickname,
          hasCompletedOnboarding,
          authChannel: options?.channel ?? "web",
          refreshToken:
            options?.channel === "mobile"
              ? (options.refreshToken ?? null)
              : null,
        }),

      completeOnboardingFlow: (raw) => {
        const trimmed = raw.trim();
        set({
          hasCompletedOnboarding: true,
          nickname: trimmed.length > 0 ? trimmed : null,
        });
      },

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
      name: "udidura-auth",
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
