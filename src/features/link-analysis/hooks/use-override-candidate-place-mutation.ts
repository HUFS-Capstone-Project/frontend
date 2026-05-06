import { useMutation, useQueryClient } from "@tanstack/react-query";

import { linkAnalysisService } from "../api/link-analysis-service";
import { linkAnalysisQueryKeys } from "../query-keys";
import type { OverrideCandidatePlaceRequest } from "../types";

type UseOverrideCandidatePlaceMutationOptions = {
  roomId: string | null;
  analysisRequestId: number | null;
};

type OverrideCandidatePlaceVariables = {
  candidateId: number;
  payload: OverrideCandidatePlaceRequest;
};

export function useOverrideCandidatePlaceMutation({
  roomId,
  analysisRequestId,
}: UseOverrideCandidatePlaceMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...linkAnalysisQueryKeys.all, "override-candidate", roomId, analysisRequestId],
    mutationFn: ({ candidateId, payload }: OverrideCandidatePlaceVariables) => {
      if (!roomId || analysisRequestId == null) {
        throw new Error("roomId and analysisRequestId are required");
      }

      return linkAnalysisService.overrideCandidatePlace(
        roomId,
        analysisRequestId,
        candidateId,
        payload,
      );
    },
    onSuccess: async () => {
      if (!roomId || analysisRequestId == null) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: linkAnalysisQueryKeys.analysis(roomId, analysisRequestId),
      });
    },
  });
}
