export type UserProfile = {
  id: number;
  email: string | null;
  nickname: string | null;
  profileImageUrl: string | null;
  role: string | null;
  status: string | null;
  onboardingCompleted: boolean;
};

export type TokenResponse = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string | null;
  refreshTokenExpiresAt: string | null;
};

export type AuthTokenBootstrapResponse = {
  token: TokenResponse;
  me: UserProfile;
};
