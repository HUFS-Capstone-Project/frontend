/**
 * 백엔드 MeResponse / GET /v1/auth/me
 */
export type UserProfile = {
  id: string;
  email: string;
  nickname: string | null;
  profileImageUrl: string | null;
  hasCompletedOnboarding: boolean;
};

/**
 * POST /api/v1/auth/refresh (웹·모바일 공통 DTO 이름)
 * - 웹 `CommonResponse<TokenResponse>`: `data.accessToken` — refresh 쿠키는 HttpOnly, body의 refresh 필드는 비어 있을 수 있음
 * - 모바일 `CommonResponse<TokenResponse>`: `data.accessToken`, `data.refreshToken` 모두 사용
 */
export type TokenResponse = {
  accessToken: string;
  accessTokenExpiresAt?: string;
  /** 웹에서는 미포함·빈 값일 수 있음(쿠키로만 관리). 모바일에서는 필수. */
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
};

/**
 * POST /api/v1/auth/web/exchange-ticket 전용 `data` 본문
 * access 경로: `data.token.accessToken` (웹만)
 */
export type AuthTokenBootstrapResponse = {
  token: TokenResponse;
  me: UserProfile;
};
