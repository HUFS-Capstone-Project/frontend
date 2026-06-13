import { mobileOAuthCodeVerifierStorage } from "@/features/auth/lib/mobile-oauth-code-verifier-storage";
import { mobileRefreshTokenStorage } from "@/features/auth/lib/mobile-refresh-token-storage";

export async function clearMobileAuthArtifacts(): Promise<void> {
  await Promise.all([
    mobileRefreshTokenStorage.setRefreshToken(null),
    mobileOAuthCodeVerifierStorage.removeCodeVerifier(),
  ]);
}
