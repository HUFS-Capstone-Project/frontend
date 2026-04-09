/**
 * 모바일 refresh token 저장소 (Capacitor Secure Storage 예정).
 * access token은 메모리(Zustand)만 사용하고, refresh는 여기에 둡니다.
 */
export interface IMobileRefreshTokenStorage {
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string | null): Promise<void>;
}

export const mobileRefreshTokenStorage: IMobileRefreshTokenStorage = {
  async getRefreshToken() {
    // TODO(Capacitor): SecureStorage / Preferences에서 읽기
    return null;
  },
  async setRefreshToken(_token) {
    // TODO(Capacitor): 저장
  },
};
