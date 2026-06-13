import { getRuntimeAuthChannel } from "@/features/auth/lib/auth-channel";
import { normalizeUserMe, type UserMe, type UserMeResponse } from "@/features/users";
import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";
import { getXsrfHeader, withCsrfRetry } from "@/shared/api/csrf";
import type { CommonResponse } from "@/shared/types/api-types";

import { sanitizeOnboardingRequest } from "../lib/validate-onboarding-request";
import type { OnboardingRequest } from "../types/onboarding";

export const onboardingApi = {
  complete: async (rawRequest: OnboardingRequest): Promise<UserMe> => {
    const request = sanitizeOnboardingRequest(rawRequest);
    return withCsrfRetry(() => postOnboardingRequest(request));
  },
};

async function postOnboardingRequest(request: OnboardingRequest): Promise<UserMe> {
  const isMobile = getRuntimeAuthChannel() === "mobile";
  const xsrfHeaders = getXsrfHeader();

  const res = await api.post<CommonResponse<UserMeResponse>>(API_PATHS.users.onboarding, request, {
    withCredentials: !isMobile,
    ...(xsrfHeaders ? { headers: xsrfHeaders } : {}),
  });

  return normalizeUserMe(res.data.data);
}
