import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { roomService } from "../api/room-service";
import type { LinkStatusResponse } from "../api/types";
import { roomQueryKeys } from "../query-keys";

const DEFAULT_POLLING_INTERVAL_MS = 2_500;
const INITIAL_FAST_POLLING_INTERVAL_MS = 1_250;
const INITIAL_FAST_POLLING_ATTEMPTS = 3;

type UseLinkStatusPollingQueryOptions = {
  enabled?: boolean;
  pollingIntervalMs?: number;
  queryOptions?: Omit<
    UseQueryOptions<
      LinkStatusResponse,
      unknown,
      LinkStatusResponse,
      ReturnType<typeof roomQueryKeys.linkStatus>
    >,
    "queryKey" | "queryFn" | "enabled" | "refetchInterval"
  >;
};

export function useLinkStatusPollingQuery(
  linkId: number | null,
  options?: UseLinkStatusPollingQueryOptions,
) {
  const relaxedPollInterval = Math.max(options?.pollingIntervalMs ?? DEFAULT_POLLING_INTERVAL_MS, 2_000);

  return useQuery({
    queryKey: roomQueryKeys.linkStatus(linkId ?? -1),
    queryFn: () => {
      if (linkId == null) {
        throw new Error("linkId is required");
      }
      return roomService.getLinkStatus(linkId);
    },
    enabled: (options?.enabled ?? true) && linkId != null,
    refetchInterval: (query) => {
      const data = query.state.data;
      const pollAttemptCount = query.state.dataUpdateCount + query.state.errorUpdateCount;

      if (data && isLinkStatusCompleted(data)) {
        return false;
      }

      return pollAttemptCount <= INITIAL_FAST_POLLING_ATTEMPTS
        ? INITIAL_FAST_POLLING_INTERVAL_MS
        : relaxedPollInterval;
    },
    refetchIntervalInBackground: true,
    ...(options?.queryOptions ?? {}),
  });
}

export function isLinkStatusCompleted(
  link: Pick<LinkStatusResponse, "status" | "completed">,
): boolean {
  if (link.completed) {
    return true;
  }

  return link.status === "SUCCEEDED" || link.status === "FAILED";
}
