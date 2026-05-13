import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth-store";

import { roomService } from "../api/room-service";
import type { RoomMemberResponse } from "../api/types";
import { roomQueryKeys } from "../query-keys";

type UseRoomMembersQueryOptions = {
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<
      RoomMemberResponse[],
      unknown,
      RoomMemberResponse[],
      ReturnType<typeof roomQueryKeys.roomMembers>
    >,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function useRoomMembersQuery(roomId: string | null, options?: UseRoomMembersQueryOptions) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: roomQueryKeys.roomMembers(roomId ?? ""),
    queryFn: () => {
      if (!roomId) {
        throw new Error("roomId is required");
      }

      return roomService.getRoomMembers(roomId);
    },
    enabled: (options?.enabled ?? true) && isLoggedIn && Boolean(accessToken) && Boolean(roomId),
    ...(options?.queryOptions ?? {}),
  });
}
