import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";
import { getXsrfHeader, withCsrfRetry } from "@/shared/api/csrf";

import { toLinkAnalysis, toLinkAnalysisRequestResult } from "../model/link-analysis-types";
import type {
  LinkAnalysis,
  LinkAnalysisCommonResponse,
  LinkAnalysisDto,
  LinkAnalysisRequestResult,
  LinkAnalysisRequestResultDto,
  RequestLinkAnalysisRequest,
} from "../types";

export const linkAnalysisService = {
  requestLinkAnalysis: async (
    roomId: string,
    payload: RequestLinkAnalysisRequest,
  ): Promise<LinkAnalysisRequestResult> => {
    return withCsrfRetry(async () => {
      const res = await api.post<LinkAnalysisCommonResponse<LinkAnalysisRequestResultDto>>(
        API_PATHS.rooms.analyzeLink(roomId),
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
      API_PATHS.rooms.linkAnalysis(roomId, linkId),
    );
    return toLinkAnalysis(res.data.data);
  },
};
