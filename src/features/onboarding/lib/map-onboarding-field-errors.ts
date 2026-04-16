import type { ApiFieldError } from "@/shared/types/api-types";

import type { OnboardingFieldErrorMap, OnboardingFieldName } from "../types/onboarding";

const FIELD_NAME_MAP: Record<string, OnboardingFieldName> = {
  nickname: "nickname",
  serviceTermsAgreed: "serviceTermsAgreed",
  privacyPolicyAgreed: "privacyPolicyAgreed",
  marketingNotificationAgreed: "marketingNotificationAgreed",
};

export function mapOnboardingFieldErrors(
  fieldErrors: ApiFieldError[] | undefined,
): OnboardingFieldErrorMap {
  if (!fieldErrors || fieldErrors.length === 0) {
    return {};
  }

  return fieldErrors.reduce<OnboardingFieldErrorMap>((acc, item) => {
    const mapped = FIELD_NAME_MAP[item.field];
    if (!mapped) {
      return acc;
    }

    if (!acc[mapped]) {
      acc[mapped] = item.message;
    }

    return acc;
  }, {});
}

export function pickFirstOnboardingFieldError(map: OnboardingFieldErrorMap): string | null {
  const order: OnboardingFieldName[] = [
    "nickname",
    "serviceTermsAgreed",
    "privacyPolicyAgreed",
    "marketingNotificationAgreed",
  ];

  for (const key of order) {
    if (map[key]) {
      return map[key] ?? null;
    }
  }

  return null;
}
