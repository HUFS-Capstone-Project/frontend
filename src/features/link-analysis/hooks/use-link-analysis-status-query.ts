import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { linkAnalysisService } from "../api/link-analysis-service";
import { shouldPollLinkAnalysis } from "../model/link-analysis-types";
import { linkAnalysisQueryKeys } from "../query-keys";
import type { LinkAnalysis } from "../types";

const DEFAULT_POLLING_INTERVAL_MS = 2_000;

type LinkAnalysisQueryKey = ReturnType<typeof linkAnalysisQueryKeys.analysis>;

type UseLinkAnalysisStatusQueryOptions = {
  roomId: string | null;
  analysisRequestId: number | null;
  enabled?: boolean;
  pollingIntervalMs?: number;
  queryOptions?: Omit<
    UseQueryOptions<LinkAnalysis, unknown, LinkAnalysis, LinkAnalysisQueryKey>,
    "queryKey" | "queryFn" | "enabled" | "refetchInterval"
  >;
};

export function useLinkAnalysisStatusQuery({
  roomId,
  analysisRequestId,
  enabled = true,
  pollingIntervalMs = DEFAULT_POLLING_INTERVAL_MS,
  queryOptions,
}: UseLinkAnalysisStatusQueryOptions) {
  const resolvedRoomId = roomId ?? "__missing-room__";
  const resolvedAnalysisRequestId = analysisRequestId ?? -1;

  return useQuery({
    queryKey: linkAnalysisQueryKeys.analysis(resolvedRoomId, resolvedAnalysisRequestId),
    queryFn: () => {
      if (!roomId || analysisRequestId == null) {
        throw new Error("roomId and analysisRequestId are required");
      }

      return linkAnalysisService.getLinkAnalysis(roomId, analysisRequestId);
    },
    enabled: enabled && Boolean(roomId) && analysisRequestId != null,
    refetchInterval: (query) =>
      shouldPollLinkAnalysis(query.state.data?.status) ? pollingIntervalMs : false,
    refetchIntervalInBackground: true,
    ...(queryOptions ?? {}),
  });
}
