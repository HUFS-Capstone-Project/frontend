import { mobileRefreshTokenStorage } from "@/features/auth/lib/mobile-refresh-token-storage";
import type { TokenResponse } from "@/features/auth/types";
import { useAuthStore } from "@/store/auth-store";

type ApplyMobileTokenResponseOptions = {
  fallbackRefreshToken?: string | null;
  fallbackRefreshTokenExpiresAt?: string | null;
};

export async function applyMobileTokenResponse(
  token: TokenResponse,
  options: ApplyMobileTokenResponseOptions = {},
): Promise<void> {
  const state = useAuthStore.getState();
  const refreshToken = token.refreshToken ?? options.fallbackRefreshToken ?? state.refreshToken;
  const refreshTokenExpiresAt =
    token.refreshTokenExpiresAt ??
    options.fallbackRefreshTokenExpiresAt ??
    state.refreshTokenExpiresAt;

  state.setAccessToken(token.accessToken);
  state.setAccessTokenExpiresAt(token.accessTokenExpiresAt ?? null);

  if (refreshToken) {
    state.setRefreshToken(refreshToken);
    state.setRefreshTokenExpiresAt(refreshTokenExpiresAt ?? null);
    await mobileRefreshTokenStorage.setRefreshToken(refreshToken, refreshTokenExpiresAt ?? null);
    return;
  }

  state.setRefreshToken(null);
  state.setRefreshTokenExpiresAt(null);
  await mobileRefreshTokenStorage.setRefreshToken(null);
}
