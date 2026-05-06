import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";
import { getXsrfHeader, withCsrfRetry } from "@/shared/api/csrf";

import {
  toLinkAnalysis,
  toLinkAnalysisRequestResult,
  toOverrideCandidatePlaceResult,
  toSaveCandidatePlacesResult,
} from "../model/link-analysis-types";
import type {
  LinkAnalysis,
  LinkAnalysisCommonResponse,
  LinkAnalysisDto,
  LinkAnalysisRequestResult,
  LinkAnalysisRequestResultDto,
  OverrideCandidatePlaceRequest,
  OverrideCandidatePlaceResponseDto,
  OverrideCandidatePlaceResult,
  RequestLinkAnalysisRequest,
  SaveCandidatePlacesRequest,
  SaveCandidatePlacesResponseDto,
  SaveCandidatePlacesResult,
  SaveManualPlaceRequest,
} from "../types";

export const linkAnalysisService = {
  requestLinkAnalysis: async (
    roomId: string,
    payload: RequestLinkAnalysisRequest,
  ): Promise<LinkAnalysisRequestResult> => {
    return withCsrfRetry(async () => {
      const res = await api.post<LinkAnalysisCommonResponse<LinkAnalysisRequestResultDto>>(
        API_PATHS.rooms.linkAnalysisRequests(roomId),
        payload,
        {
          withCredentials: true,
          headers: getXsrfHeader(),
        },
      );

      return toLinkAnalysisRequestResult(res.data.data);
    });
  },

  getLinkAnalysis: async (roomId: string, analysisRequestId: number): Promise<LinkAnalysis> => {
    const res = await api.get<LinkAnalysisCommonResponse<LinkAnalysisDto>>(
      API_PATHS.rooms.linkAnalysisRequest(roomId, analysisRequestId),
    );
    return toLinkAnalysis(res.data.data, analysisRequestId);
  },

  saveCandidatePlaces: async (
    roomId: string,
    analysisRequestId: number,
    payload: SaveCandidatePlacesRequest,
  ): Promise<SaveCandidatePlacesResult> => {
    return withCsrfRetry(async () => {
      const res = await api.post<LinkAnalysisCommonResponse<SaveCandidatePlacesResponseDto>>(
        API_PATHS.rooms.linkAnalysisRequestPlaces(roomId, analysisRequestId),
        payload,
        {
          withCredentials: true,
          headers: getXsrfHeader(),
        },
      );

      return toSaveCandidatePlacesResult(res.data.data);
    });
  },

  overrideCandidatePlace: async (
    roomId: string,
    analysisRequestId: number,
    candidateId: number,
    payload: OverrideCandidatePlaceRequest,
  ): Promise<OverrideCandidatePlaceResult> => {
    return withCsrfRetry(async () => {
      const res = await api.put<LinkAnalysisCommonResponse<OverrideCandidatePlaceResponseDto>>(
        API_PATHS.rooms.linkAnalysisCandidateOverride(roomId, analysisRequestId, candidateId),
        payload,
        {
          withCredentials: true,
          headers: getXsrfHeader(),
        },
      );

      return toOverrideCandidatePlaceResult(res.data.data);
    });
  },

  saveManualPlace: async (
    roomId: string,
    analysisRequestId: number,
    payload: SaveManualPlaceRequest,
  ): Promise<SaveCandidatePlacesResult> => {
    return withCsrfRetry(async () => {
      const res = await api.post<LinkAnalysisCommonResponse<SaveCandidatePlacesResponseDto>>(
        API_PATHS.rooms.linkAnalysisRequestManualPlace(roomId, analysisRequestId),
        payload,
        {
          withCredentials: true,
          headers: getXsrfHeader(),
        },
      );

      return toSaveCandidatePlacesResult(res.data.data);
    });
  },
};
