import { useMutation, useQueryClient } from "@tanstack/react-query";

import { linkAnalysisQueryKeys } from "@/features/link-analysis";

import { roomService } from "../api/room-service";
import type { RegisterLinkRequest } from "../api/types";
import { roomQueryKeys } from "../query-keys";

export function useRegisterLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...roomQueryKeys.all, "register-link"],
    mutationFn: (payload: RegisterLinkRequest) => roomService.registerLink(payload),
    onSuccess: (result, variables) => {
      queryClient.removeQueries({
        queryKey: linkAnalysisQueryKeys.analysis(variables.roomId, result.linkId),
      });
    },
  });
}
