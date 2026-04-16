import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userQueryKeys, usersApi } from "@/features/users";
import { isApiError } from "@/shared/api/axios";
import { useAuthStore } from "@/store/auth-store";

import { onboardingApi } from "../api/onboarding-api";
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
        if (isConflictError(error)) {
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
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.me() });
    },
  });
}

function isConflictError(error: unknown): boolean {
  if (!isApiError(error)) {
    return false;
  }

  return error.status === 409 || error.code === "E409_CONFLICT";
}
