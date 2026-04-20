import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { roomService } from "../api/room-service";
import type { LinkStatusResponse } from "../api/types";
import { roomQueryKeys } from "../query-keys";

const DEFAULT_POLLING_INTERVAL_MS = 2_500;
const FAST_POLLING_INTERVAL_MS = 500;
const MID_POLLING_INTERVAL_MS = 1_000;
const FAST_POLLING_ATTEMPTS = 3;
const MID_POLLING_ATTEMPTS = 6;
const MIN_RELAXED_POLLING_INTERVAL_MS = 2_000;
const MAX_RELAXED_POLLING_INTERVAL_MS = 2_500;

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
  const relaxedPollInterval = clamp(
    options?.pollingIntervalMs ?? DEFAULT_POLLING_INTERVAL_MS,
    MIN_RELAXED_POLLING_INTERVAL_MS,
    MAX_RELAXED_POLLING_INTERVAL_MS,
  );

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

      if (pollAttemptCount <= FAST_POLLING_ATTEMPTS) {
        return FAST_POLLING_INTERVAL_MS;
      }

      if (pollAttemptCount <= MID_POLLING_ATTEMPTS) {
        return MID_POLLING_INTERVAL_MS;
      }

      return relaxedPollInterval;
    },
    refetchIntervalInBackground: true,
    ...(options?.queryOptions ?? {}),
  });
}

export function isLinkStatusCompleted(
  link: Pick<LinkStatusResponse, "status" | "completed">,
): boolean {
  return link.status === "SUCCEEDED" || link.status === "FAILED";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
