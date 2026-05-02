import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { linkAnalysisService } from "../api/link-analysis-service";
import { shouldPollLinkAnalysis } from "../model/link-analysis-types";
import { linkAnalysisQueryKeys } from "../query-keys";
import type { LinkAnalysis } from "../types";

const DEFAULT_POLLING_INTERVAL_MS = 2_000;

type LinkAnalysisQueryKey = ReturnType<typeof linkAnalysisQueryKeys.analysis>;

type UseLinkAnalysisStatusQueryOptions = {
  roomId: string | null;
  linkId: number | null;
  enabled?: boolean;
  pollingIntervalMs?: number;
  queryOptions?: Omit<
    UseQueryOptions<LinkAnalysis, unknown, LinkAnalysis, LinkAnalysisQueryKey>,
    "queryKey" | "queryFn" | "enabled" | "refetchInterval"
  >;
};

export function useLinkAnalysisStatusQuery({
  roomId,
  linkId,
  enabled = true,
  pollingIntervalMs = DEFAULT_POLLING_INTERVAL_MS,
  queryOptions,
}: UseLinkAnalysisStatusQueryOptions) {
  const resolvedRoomId = roomId ?? "__missing-room__";
  const resolvedLinkId = linkId ?? -1;

  return useQuery({
    queryKey: linkAnalysisQueryKeys.analysis(resolvedRoomId, resolvedLinkId),
    queryFn: () => {
      if (!roomId || linkId == null) {
        throw new Error("roomId and linkId are required");
      }

      return linkAnalysisService.getLinkAnalysis(roomId, linkId);
    },
    enabled: enabled && Boolean(roomId) && linkId != null,
    refetchInterval: (query) =>
      shouldPollLinkAnalysis(query.state.data?.status) ? pollingIntervalMs : false,
    refetchIntervalInBackground: true,
    ...(queryOptions ?? {}),
  });
}
