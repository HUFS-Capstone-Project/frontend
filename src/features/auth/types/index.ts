/**
 * 인증 부트스트랩과 사용자 API에서 공통으로 사용하는 프로필 타입
 * - onboardingCompleted: 현재 백엔드 표준 필드
 * - hasCompletedOnboarding: 하위 호환 필드
 */
export type UserProfile = {
  id: number | string | null;
  email: string | null;
  nickname: string | null;
  profileImageUrl: string | null;
  role?: string | null;
  status?: string | null;
  onboardingCompleted?: boolean | null;
  hasCompletedOnboarding?: boolean | null;
};

/**
 * POST /api/v1/auth/refresh (웹/모바일 공통)
 */
export type TokenResponse = {
  accessToken: string;
  accessTokenExpiresAt?: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
};

/**
 * POST /api/v1/auth/web/exchange-ticket
 * 웹 응답에 me가 포함될 수 있어도 온보딩 판단은 /users/me 기준으로 처리한다.
 */
export type AuthTokenBootstrapResponse = {
  token: TokenResponse;
  me?: UserProfile | null;
};
