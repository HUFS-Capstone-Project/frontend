import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AuthState = {
  isLoggedIn: boolean;
  nickname: string | null;
  hasCompletedOnboarding: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
  setNickname: (nickname: string | null) => void;
  /**
   * 약관 동의 완료(UI 단계) — 로그인·닉네임·온보딩 완료를 한 번에 반영.
   * 실제 OAuth·API 연동 시 이 함수 안에서 토큰 처리로 확장하면 됩니다.
   */
  completeOnboardingFlow: (nickname: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      nickname: null,
      hasCompletedOnboarding: false,
      setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
      setNickname: (nickname) => set({ nickname }),
      completeOnboardingFlow: (raw) => {
        const trimmed = raw.trim();
        set({
          isLoggedIn: true,
          nickname: trimmed.length > 0 ? trimmed : null,
          hasCompletedOnboarding: true,
        });
      },
      logout: () =>
        set({
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
      }),
    },
  ),
);
