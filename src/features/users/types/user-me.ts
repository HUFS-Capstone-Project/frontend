export type UserMeResponse = {
  id: number | string | null;
  email: string | null;
  nickname: string | null;
  profileImageUrl: string | null;
  role: string | null;
  status: string | null;
  onboardingCompleted: boolean | null;
};

export type UserMe = {
  id: number | string | null;
  email: string | null;
  nickname: string | null;
  profileImageUrl: string | null;
  role: string | null;
  status: string | null;
  onboardingCompleted: boolean;
};

export function normalizeUserMe(raw: UserMeResponse): UserMe {
  return {
    id: raw.id ?? null,
    email: raw.email ?? null,
    nickname: raw.nickname ?? null,
    profileImageUrl: raw.profileImageUrl ?? null,
    role: raw.role ?? null,
    status: raw.status ?? null,
    onboardingCompleted: raw.onboardingCompleted === true,
  };
}
