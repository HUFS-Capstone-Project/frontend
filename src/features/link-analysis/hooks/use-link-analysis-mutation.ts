import { useMutation, useQueryClient } from "@tanstack/react-query";

import { linkAnalysisService } from "../api/link-analysis-service";
import { linkAnalysisQueryKeys } from "../query-keys";
import type { RequestLinkAnalysisRequest } from "../types";

export function useRequestLinkAnalysisMutation(roomId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...linkAnalysisQueryKeys.all, "request", roomId],
    mutationFn: (payload: RequestLinkAnalysisRequest) => {
      if (!roomId) {
        throw new Error("roomId is required");
      }

      return linkAnalysisService.requestLinkAnalysis(roomId, payload);
    },
    onSuccess: (result) => {
      if (!roomId) {
        return;
      }

      queryClient.removeQueries({
        queryKey: linkAnalysisQueryKeys.analysis(roomId, result.analysisRequestId),
      });
    },
  });
}

export function useRetryLinkAnalysisMutation(roomId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...linkAnalysisQueryKeys.all, "retry", roomId],
    mutationFn: (analysisRequestId: number) => {
      if (!roomId) {
        throw new Error("roomId is required");
      }

      return linkAnalysisService.retryLinkAnalysis(roomId, analysisRequestId);
    },
    onSuccess: (result, requestedAnalysisRequestId) => {
      if (!roomId) {
        return;
      }

      queryClient.removeQueries({
        queryKey: linkAnalysisQueryKeys.analysis(roomId, requestedAnalysisRequestId),
      });
      queryClient.removeQueries({
        queryKey: linkAnalysisQueryKeys.analysis(roomId, result.analysisRequestId),
      });
    },
  });
}
