import { Preferences } from "@capacitor/preferences";

const MOBILE_OAUTH_CODE_VERIFIER_KEY = "udidura-mobile-oauth-code-verifier";

export const mobileOAuthCodeVerifierStorage = {
  async getCodeVerifier(): Promise<string | null> {
    const { value } = await Preferences.get({ key: MOBILE_OAUTH_CODE_VERIFIER_KEY });
    return value && value.length > 0 ? value : null;
  },

  async setCodeVerifier(codeVerifier: string | null): Promise<void> {
    if (!codeVerifier) {
      await this.removeCodeVerifier();
      return;
    }

    await Preferences.set({
      key: MOBILE_OAUTH_CODE_VERIFIER_KEY,
      value: codeVerifier,
    });
  },

  async removeCodeVerifier(): Promise<void> {
    await Preferences.remove({ key: MOBILE_OAUTH_CODE_VERIFIER_KEY });
  },
};

