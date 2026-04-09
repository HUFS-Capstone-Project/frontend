/** 닉네임 입력·검증에 공통 사용 */
export const NICKNAME_MAX_LENGTH = 10;

const NICKNAME_PLACEHOLDER_DEFAULT = "닉네임 입력";

export function nicknameInputPlaceholder(maxLength: number): string {
  return `닉네임 최대 ${maxLength}자 이내 입력`;
}

export function nicknameLimitExceededMessage(maxLength: number): string {
  return `최대 ${maxLength}자 이내로 닉네임을 입력해주세요`;
}

export function resolveNicknamePlaceholder(
  explicit: string | undefined,
  maxLength: number | undefined,
): string {
  if (explicit !== undefined) return explicit;
  if (maxLength !== undefined) return nicknameInputPlaceholder(maxLength);
  return NICKNAME_PLACEHOLDER_DEFAULT;
}

/**
 * 온보딩 단계별 본문 레이아웃 (RootLayout `px-page`와 함께 사용).
 */
export const onboardingContentClassName = {
  nickname:
    "flex min-h-0 flex-1 flex-col justify-center gap-10 overflow-y-auto overscroll-contain py-6",
  terms:
    "flex min-h-0 flex-1 flex-col justify-center gap-8 overflow-y-auto overscroll-contain py-6",
} as const;
