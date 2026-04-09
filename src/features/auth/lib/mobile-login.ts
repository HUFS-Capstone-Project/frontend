import { authApi } from "@/features/auth/api/auth-api";
import { mobileAuthApi } from "@/features/auth/api/mobile-auth-api";
import { useAuthStore } from "@/store/auth-store";

/** Capacitor PKCE 콜백 후 호출 — `mobile/exchange` → `/me` → `signIn`(channel: mobile). */
// TODO(모바일 OAuth): 딥링크/`App.addListener("appUrlOpen")`에서 code·codeVerifier 파싱 후 이 함수 연결. 호출처 미연결 상태.
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
