import { normalizeUserMe, type UserMe, type UserMeResponse } from "@/features/users";
import { api, isApiError } from "@/shared/api/axios";
import { ensureCsrfCookie } from "@/shared/api/web-auth-client";
import { getCookie, XSRF_COOKIE_NAME, XSRF_HEADER_NAME } from "@/shared/lib/cookie";
import type { CommonResponse } from "@/shared/types/api-types";

import { sanitizeOnboardingRequest } from "../lib/validate-onboarding-request";
import type { OnboardingRequest } from "../types/onboarding";

const USER_ONBOARDING_PATH = "/v1/users/me/onboarding";

export const onboardingApi = {
  complete: async (rawRequest: OnboardingRequest): Promise<UserMe> => {
    const request = sanitizeOnboardingRequest(rawRequest);

    await ensureCsrfCookie();

    try {
      return await postOnboardingRequest(request);
    } catch (error) {
      if (isCsrfForbidden(error)) {
        await ensureCsrfCookie({ forceRefresh: true });
        return postOnboardingRequest(request);
      }
      throw error;
    }
  },
};

async function postOnboardingRequest(request: OnboardingRequest): Promise<UserMe> {
  const res = await api.post<CommonResponse<UserMeResponse>>(USER_ONBOARDING_PATH, request, {
    withCredentials: true,
    headers: getXsrfHeader(),
  });

  return normalizeUserMe(res.data.data);
}

function getXsrfHeader(): Record<string, string> | undefined {
  const token = getCookie(XSRF_COOKIE_NAME);
  if (!token) {
    return undefined;
  }

  return {
    [XSRF_HEADER_NAME]: token,
  };
}

function isCsrfForbidden(error: unknown): boolean {
  if (!isApiError(error)) {
    return false;
  }

  return error.status === 403 || error.code === "E403_FORBIDDEN";
}
