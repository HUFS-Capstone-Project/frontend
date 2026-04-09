import { authApi } from "@/features/auth/api/authApi";
import { mobileAuthApi } from "@/features/auth/api/mobileAuthApi";
import { useAuthStore } from "@/store/authStore";

/** Capacitor PKCE 콜백 후 호출 — `mobile/exchange` → `/me` → `signIn`(channel: mobile). */
export async function completeMobileLoginAfterExchange(params: {
  code: string;
  codeVerifier: string;
}): Promise<void> {
  const common = await mobileAuthApi.exchange(params);
  const tr = common.data;

  useAuthStore.getState().setAccessToken(tr.accessToken);
  if (tr.refreshToken) {
    useAuthStore.getState().setRefreshToken(tr.refreshToken);
  }

  const meRes = await authApi.getMe();
  const me = meRes.data;

  useAuthStore.getState().signIn(
    tr.accessToken,
    {
      nickname: me.nickname,
      hasCompletedOnboarding: me.hasCompletedOnboarding,
    },
    { channel: "mobile", refreshToken: tr.refreshToken ?? null },
  );
}
