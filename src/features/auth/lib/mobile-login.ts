import { mobileAuthApi } from "@/features/auth/api/mobile-auth-api";
import { usersApi } from "@/features/users";
import { useAuthStore } from "@/store/auth-store";

/**
 * 모바일 OAuth 교환을 완료한 뒤 /users/me를 조회해 온보딩 상태를 확인한다.
 */
// TODO(모바일 OAuth): App.addListener("appUrlOpen") 딥링크 콜백 연결
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

  const me = await usersApi.getMe();

  useAuthStore.getState().signIn(
    tr.accessToken,
    {
      nickname: me.nickname,
      hasCompletedOnboarding: me.onboardingCompleted,
    },
    { channel: "mobile", refreshToken: tr.refreshToken ?? null },
  );
}
