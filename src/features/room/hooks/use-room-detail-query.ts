import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth-store";

import { roomService } from "../api/room-service";
import type { RoomDetailResponse } from "../api/types";
import { roomQueryKeys } from "../query-keys";

type UseRoomDetailQueryOptions = {
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<
      RoomDetailResponse,
      unknown,
      RoomDetailResponse,
      ReturnType<typeof roomQueryKeys.roomDetail>
    >,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function useRoomDetailQuery(roomId: string | null, options?: UseRoomDetailQueryOptions) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: roomQueryKeys.roomDetail(roomId ?? ""),
    queryFn: () => {
      if (!roomId) {
        throw new Error("roomId is required");
      }
      return roomService.getRoomDetail(roomId);
    },
    enabled: (options?.enabled ?? true) && isLoggedIn && Boolean(accessToken) && Boolean(roomId),
    ...(options?.queryOptions ?? {}),
  });
}
