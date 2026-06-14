import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userQueryKeys, usersApi } from "@/features/users";
import { useAuthStore } from "@/store/auth-store";

import { onboardingApi } from "../api/onboarding-api";
import { isOnboardingConflictError } from "../lib/onboarding-errors";
import type { OnboardingRequest } from "../types/onboarding";

export function useSubmitOnboardingMutation() {
  const queryClient = useQueryClient();

  const setNickname = useAuthStore((s) => s.setNickname);
  const setHasCompletedOnboarding = useAuthStore((s) => s.setHasCompletedOnboarding);

  return useMutation({
    mutationKey: [...userQueryKeys.all, "onboarding", "submit"],
    mutationFn: async (payload: OnboardingRequest) => {
      try {
        return await onboardingApi.complete(payload);
      } catch (error) {
        if (isOnboardingConflictError(error)) {
          const latestMe = await usersApi.getMe();
          if (latestMe.onboardingCompleted) {
            return latestMe;
          }
        }

        throw error;
      }
    },
    onSuccess: (me) => {
      setNickname(me.nickname);
      setHasCompletedOnboarding(me.onboardingCompleted);

      queryClient.setQueryData(userQueryKeys.me(), me);
    },
  });
}
