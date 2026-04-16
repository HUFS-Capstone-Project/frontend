import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { mobileAuthApi } from "@/features/auth/api/mobile-auth-api";
import { webAuthApi } from "@/features/auth/api/web-auth-api";
import { resolveMobileRefreshToken } from "@/features/auth/lib/mobile-refresh-token";
import { userQueryKeys, usersApi } from "@/features/users";
import { useAuthStore } from "@/store/auth-store";

/** 로그인 복원 흐름: 웹은 ensureCsrfCookie → refresh → me, 모바일은 mobile/refresh → me */
// TODO(모바일 OAuth): `authChannel==="mobile"`일 때는 `mobileRefreshTokenStorage`에서 직접 읽음. 딥링크 로그인과 병합 필요.
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
          if (!cancelled) logout();
          return;
        }
        const trWrapper = await mobileAuthApi.refresh({ refreshToken: rt });
        if (cancelled) return;
        const tr = trWrapper.data;
        useAuthStore.getState().setAccessToken(tr.accessToken);
        if (tr.refreshToken) useAuthStore.getState().setRefreshToken(tr.refreshToken);

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
            refreshToken: tr.refreshToken ?? rt,
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
      if (!cancelled) logout();
    });

    return () => {
      cancelled = true;
    };
  }, [queryClient]);
}
