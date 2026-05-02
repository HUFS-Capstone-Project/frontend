import { useMutation, useQueryClient } from "@tanstack/react-query";

import { linkAnalysisService } from "../api/link-analysis-service";
import { linkAnalysisQueryKeys } from "../query-keys";
import type { SaveCandidatePlacesRequest } from "../types";

type UseSaveCandidatePlacesMutationOptions = {
  roomId: string | null;
  linkId: number | null;
};

export function useSaveCandidatePlacesMutation({
  roomId,
  linkId,
}: UseSaveCandidatePlacesMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...linkAnalysisQueryKeys.all, "save-candidate-places", roomId, linkId],
    mutationFn: (payload: SaveCandidatePlacesRequest) => {
      if (!roomId || linkId == null) {
        throw new Error("roomId and linkId are required");
      }

      return linkAnalysisService.saveCandidatePlaces(roomId, linkId, payload);
    },
    onSuccess: async () => {
      if (!roomId || linkId == null) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: linkAnalysisQueryKeys.analysis(roomId, linkId),
      });
    },
  });
}
