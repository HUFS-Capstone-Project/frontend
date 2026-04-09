import { useEffect } from "react";

import { authApi } from "@/features/auth/api/auth-api";
import { mobileAuthApi } from "@/features/auth/api/mobile-auth-api";
import { webAuthApi } from "@/features/auth/api/web-auth-api";
import { resolveMobileRefreshToken } from "@/features/auth/lib/mobile-refresh-token";
import { useAuthStore } from "@/store/auth-store";

/** 로그인 상태 복원: 웹 ensureCsrfCookie→refresh→me, 모바일 mobile/refresh→me */
// TODO(모바일 OAuth): `authChannel==="mobile"` 복원은 `mobileRefreshTokenStorage` 구현 후에만 동작. 딥링크 로그인과 연계.
export function useInitAuth(): void {
  useEffect(() => {
    const { isLoggedIn, signIn, logout, authChannel: persistedChannel } =
      useAuthStore.getState();

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

        const meRes = await authApi.getMe();
        if (cancelled) return;

        signIn(
          tr.accessToken,
          {
            nickname: meRes.data.nickname,
            hasCompletedOnboarding: meRes.data.hasCompletedOnboarding,
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
      const meRes = await authApi.getMe();
      if (cancelled) return;

      signIn(
        tokenRes.data.accessToken,
        {
          nickname: meRes.data.nickname,
          hasCompletedOnboarding: meRes.data.hasCompletedOnboarding,
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
  }, []);
}
