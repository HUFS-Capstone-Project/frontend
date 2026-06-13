import { Preferences } from "@capacitor/preferences";

const MOBILE_REFRESH_TOKEN_KEY = "udidura-mobile-refresh-token";
const MOBILE_REFRESH_TOKEN_EXPIRES_AT_KEY = "udidura-mobile-refresh-token-expires-at";

/**
 * Mobile refresh-token storage.
 * accessToken stays in Zustand; refreshToken is persisted for app restart restore.
 */
export interface IMobileRefreshTokenStorage {
  getRefreshToken(): Promise<string | null>;
  getRefreshTokenExpiresAt(): Promise<string | null>;
  setRefreshToken(token: string | null, expiresAt?: string | null): Promise<void>;
}

export const mobileRefreshTokenStorage: IMobileRefreshTokenStorage = {
  async getRefreshToken() {
    const { value } = await Preferences.get({ key: MOBILE_REFRESH_TOKEN_KEY });
    return value && value.length > 0 ? value : null;
  },

  async getRefreshTokenExpiresAt() {
    const { value } = await Preferences.get({ key: MOBILE_REFRESH_TOKEN_EXPIRES_AT_KEY });
    return value && value.length > 0 ? value : null;
  },

  async setRefreshToken(token, expiresAt) {
    if (!token) {
      await Promise.all([
        Preferences.remove({ key: MOBILE_REFRESH_TOKEN_KEY }),
        Preferences.remove({ key: MOBILE_REFRESH_TOKEN_EXPIRES_AT_KEY }),
      ]);
      return;
    }

    await Preferences.set({ key: MOBILE_REFRESH_TOKEN_KEY, value: token });
    if (expiresAt !== undefined) {
      if (expiresAt) {
        await Preferences.set({ key: MOBILE_REFRESH_TOKEN_EXPIRES_AT_KEY, value: expiresAt });
      } else {
        await Preferences.remove({ key: MOBILE_REFRESH_TOKEN_EXPIRES_AT_KEY });
      }
    }
  },
};
