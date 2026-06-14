import { isAnyApiErrorCode } from "@/shared/api/error";

const ONBOARDING_CONFLICT_CODES = ["ONBOARDING_ALREADY_COMPLETED"] as const;

export function isOnboardingAlreadyCompletedError(error: unknown): boolean {
  return isAnyApiErrorCode(error, ONBOARDING_CONFLICT_CODES);
}

export function isOnboardingConflictError(error: unknown): boolean {
  if (isOnboardingAlreadyCompletedError(error)) {
    return true;
  }

  const parsed = error as { status?: number } | null;
  return parsed?.status === 409;
}
