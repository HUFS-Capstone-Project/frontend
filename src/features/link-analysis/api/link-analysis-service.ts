import { api, isApiError } from "@/shared/api/axios";
import { ensureCsrfCookie } from "@/shared/api/web-auth-client";
import { getCookie, XSRF_COOKIE_NAME, XSRF_HEADER_NAME } from "@/shared/lib/cookie";

import { toLinkAnalysis, toLinkAnalysisRequestResult } from "../model/link-analysis-types";
import type {
  LinkAnalysis,
  LinkAnalysisCommonResponse,
  LinkAnalysisDto,
  LinkAnalysisRequestResult,
  LinkAnalysisRequestResultDto,
  RequestLinkAnalysisRequest,
} from "../types";

const API_PATHS = {
  rooms: "/v1/rooms",
} as const;

export const linkAnalysisService = {
  requestLinkAnalysis: async (
    roomId: string,
    payload: RequestLinkAnalysisRequest,
  ): Promise<LinkAnalysisRequestResult> => {
    return withCsrf(async () => {
      const res = await api.post<LinkAnalysisCommonResponse<LinkAnalysisRequestResultDto>>(
        `${API_PATHS.rooms}/${roomId}/links/analyze`,
        payload,
        {
          withCredentials: true,
          headers: getXsrfHeader(),
        },
      );

      return toLinkAnalysisRequestResult(res.data.data);
    });
  },

  getLinkAnalysis: async (roomId: string, linkId: number): Promise<LinkAnalysis> => {
    const res = await api.get<LinkAnalysisCommonResponse<LinkAnalysisDto>>(
      `${API_PATHS.rooms}/${roomId}/links/${linkId}/analysis`,
    );
    return toLinkAnalysis(res.data.data);
  },
};

async function withCsrf<T>(request: () => Promise<T>): Promise<T> {
  await ensureCsrfCookie();

  try {
    return await request();
  } catch (error) {
    if (isCsrfForbidden(error)) {
      await ensureCsrfCookie({ forceRefresh: true });
      return request();
    }

    throw error;
  }
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
