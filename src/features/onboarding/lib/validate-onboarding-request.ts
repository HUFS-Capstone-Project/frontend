import { NICKNAME_MAX_LENGTH } from "../constants";
import type { OnboardingRequest } from "../types/onboarding";

export type OnboardingClientValidationErrors = {
  nickname?: string;
  serviceTermsAgreed?: string;
  privacyPolicyAgreed?: string;
};

export function normalizeNickname(raw: string): string {
  return raw.trim();
}

export function validateOnboardingRequest(
  input: OnboardingRequest,
): OnboardingClientValidationErrors {
  const nickname = normalizeNickname(input.nickname);

  const errors: OnboardingClientValidationErrors = {};

  if (nickname.length === 0) {
    errors.nickname = "닉네임을 입력해 주세요";
  } else if (nickname.length > NICKNAME_MAX_LENGTH) {
    errors.nickname = `닉네임은 최대 ${NICKNAME_MAX_LENGTH}자까지 가능합니다.`;
  }

  if (!input.serviceTermsAgreed) {
    errors.serviceTermsAgreed = "서비스 이용약관 동의는 필수입니다.";
  }

  if (!input.privacyPolicyAgreed) {
    errors.privacyPolicyAgreed = "개인정보처리방침 동의는 필수입니다.";
  }

  return errors;
}

export function hasClientValidationErrors(errors: OnboardingClientValidationErrors): boolean {
  return Object.values(errors).some((value) => typeof value === "string" && value.length > 0);
}

export function sanitizeOnboardingRequest(input: OnboardingRequest): OnboardingRequest {
  return {
    ...input,
    nickname: normalizeNickname(input.nickname),
  };
}
