import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { mobileAuthApi } from "@/features/auth/api/mobile-auth-api";
import { webAuthApi } from "@/features/auth/api/web-auth-api";
import { resolveMobileRefreshToken } from "@/features/auth/lib/mobile-refresh-token";
import { mobileRefreshTokenStorage } from "@/features/auth/lib/mobile-refresh-token-storage";
import { applyMobileTokenResponse } from "@/features/auth/lib/mobile-token-response";
import { clearAuthenticatedSessionData } from "@/features/auth/lib/session-cleanup";
import { userQueryKeys, usersApi } from "@/features/users";
import { useAuthStore } from "@/store/auth-store";

/** 로그인 복원 흐름: 웹은 ensureCsrfCookie → refresh → me, 모바일은 저장된 refreshToken → mobile/refresh → me */
export function useInitAuth(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const { isLoggedIn, signIn, logout, authChannel: persistedChannel } = useAuthStore.getState();

    if (!isLoggedIn) return;

    const authChannel = persistedChannel ?? "web";

    let cancelled = false;

    const restore = async () => {
      if (authChannel === "mobile") {
        const rt = await resolveMobileRefreshToken();
        if (!rt) {
          if (!cancelled) {
            logout();
            await clearAuthenticatedSessionData(queryClient);
          }
          return;
        }
        const trWrapper = await mobileAuthApi.refresh({ refreshToken: rt });
        if (cancelled) return;
        const tr = trWrapper.data;
        const fallbackRefreshTokenExpiresAt =
          await mobileRefreshTokenStorage.getRefreshTokenExpiresAt();
        await applyMobileTokenResponse(tr, {
          fallbackRefreshToken: rt,
          fallbackRefreshTokenExpiresAt,
        });

        const me = await usersApi.getMe();
        if (cancelled) return;
        queryClient.setQueryData(userQueryKeys.me(), me);

        signIn(
          tr.accessToken,
          {
            nickname: me.nickname,
            hasCompletedOnboarding: me.onboardingCompleted,
          },
          {
            channel: "mobile",
            accessTokenExpiresAt: tr.accessTokenExpiresAt ?? null,
            refreshToken: tr.refreshToken ?? rt,
            refreshTokenExpiresAt:
              tr.refreshTokenExpiresAt ?? fallbackRefreshTokenExpiresAt ?? null,
          },
        );
        return;
      }

      await webAuthApi.ensureCsrfCookie();
      if (cancelled) return;

      const tokenRes = await webAuthApi.refresh();
      if (cancelled) return;

      useAuthStore.getState().setAccessToken(tokenRes.data.accessToken);
      const me = await usersApi.getMe();
      if (cancelled) return;
      queryClient.setQueryData(userQueryKeys.me(), me);

      signIn(
        tokenRes.data.accessToken,
        {
          nickname: me.nickname,
          hasCompletedOnboarding: me.onboardingCompleted,
        },
        { channel: "web" },
      );
    };

    restore().catch(() => {
      if (!cancelled) {
        logout();
        void clearAuthenticatedSessionData(queryClient);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [queryClient]);
}
