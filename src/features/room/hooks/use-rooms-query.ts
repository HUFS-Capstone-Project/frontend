import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth-store";

import { roomService } from "../api/room-service";
import type { RoomSummaryResponse } from "../api/types";
import { roomQueryKeys } from "../query-keys";

type UseRoomsQueryOptions = {
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<
      RoomSummaryResponse[],
      unknown,
      RoomSummaryResponse[],
      ReturnType<typeof roomQueryKeys.rooms>
    >,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function useRoomsQuery(options?: UseRoomsQueryOptions) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: roomQueryKeys.rooms(),
    queryFn: roomService.getRooms,
    enabled: (options?.enabled ?? true) && isLoggedIn && Boolean(accessToken),
    ...(options?.queryOptions ?? {}),
  });
}
