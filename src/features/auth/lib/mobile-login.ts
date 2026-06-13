import { mobileAuthApi } from "@/features/auth/api/mobile-auth-api";
import { applyMobileTokenResponse } from "@/features/auth/lib/mobile-token-response";
import { usersApi } from "@/features/users";
import { useAuthStore } from "@/store/auth-store";

/**
 * Completes mobile OAuth exchange and verifies profile state through /users/me.
 */
export async function completeMobileLoginAfterExchange(params: {
  code: string;
  codeVerifier: string;
}): Promise<void> {
  const common = await mobileAuthApi.exchange(params);
  const tr = common.data;

  await applyMobileTokenResponse(tr);

  const me = await usersApi.getMe();

  useAuthStore.getState().signIn(
    tr.accessToken,
    {
      nickname: me.nickname,
      hasCompletedOnboarding: me.onboardingCompleted,
    },
    {
      channel: "mobile",
      accessTokenExpiresAt: tr.accessTokenExpiresAt ?? null,
      refreshToken: tr.refreshToken ?? null,
      refreshTokenExpiresAt: tr.refreshTokenExpiresAt ?? null,
    },
  );
}
