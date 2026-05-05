import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomPlaceQueryKeys } from "@/features/room-places";

import { linkAnalysisService } from "../api/link-analysis-service";
import { linkAnalysisQueryKeys } from "../query-keys";
import type { SaveManualPlaceRequest } from "../types";

type UseSaveManualPlaceMutationOptions = {
  roomId: string | null;
  analysisRequestId: number | null;
};

export function useSaveManualPlaceMutation({
  roomId,
  analysisRequestId,
}: UseSaveManualPlaceMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...linkAnalysisQueryKeys.all, "save-manual-place", roomId, analysisRequestId],
    mutationFn: (payload: SaveManualPlaceRequest) => {
      if (!roomId || analysisRequestId == null) {
        throw new Error("roomId and analysisRequestId are required");
      }

      return linkAnalysisService.saveManualPlace(roomId, analysisRequestId, payload);
    },
    onSuccess: async () => {
      if (!roomId || analysisRequestId == null) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: linkAnalysisQueryKeys.analysis(roomId, analysisRequestId),
        }),
        queryClient.invalidateQueries({
          queryKey: roomPlaceQueryKeys.room(roomId),
        }),
      ]);
    },
  });
}
