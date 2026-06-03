import { mapFieldErrorsToForm } from "@/shared/api/error";
import type { FieldError } from "@/shared/types/api-types";

import type { OnboardingFieldErrorMap, OnboardingFieldName } from "../types/onboarding";

const ONBOARDING_FIELD_NAMES = new Set<OnboardingFieldName>([
  "nickname",
  "serviceTermsAgreed",
  "privacyPolicyAgreed",
  "marketingNotificationAgreed",
]);

export function mapOnboardingFieldErrors(
  fieldErrors: FieldError[] | undefined,
): OnboardingFieldErrorMap {
  const mapped = mapFieldErrorsToForm(fieldErrors);

  return Object.entries(mapped).reduce<OnboardingFieldErrorMap>((acc, [field, message]) => {
    if (ONBOARDING_FIELD_NAMES.has(field as OnboardingFieldName)) {
      acc[field as OnboardingFieldName] = message;
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

export function getFirstUnmappedOnboardingFieldError(
  fieldErrors: FieldError[] | undefined,
): string | null {
  const mapped = mapOnboardingFieldErrors(fieldErrors);
  const knownFields = Object.keys(mapped) as OnboardingFieldName[];

  const allMapped = mapFieldErrorsToForm(fieldErrors);
  for (const [field, message] of Object.entries(allMapped)) {
    if (!knownFields.includes(field as OnboardingFieldName)) {
      return message;
    }
  }

  return null;
}
