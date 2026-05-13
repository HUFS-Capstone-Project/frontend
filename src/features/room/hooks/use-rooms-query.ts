import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth-store";

import { roomService } from "../api/room-service";
import type { RoomSummaryResponse } from "../api/types";
import { roomQueryKeys } from "../query-keys";

type UseRoomsQueryOptions = {
  enabled?: boolean;
  keyword?: string;
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
  const keyword = options?.keyword;

  return useQuery({
    queryKey: roomQueryKeys.rooms(keyword),
    queryFn: () => roomService.getRooms(keyword),
    enabled: (options?.enabled ?? true) && isLoggedIn && Boolean(accessToken),
    ...(options?.queryOptions ?? {}),
  });
}
