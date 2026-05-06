import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { roomPlaceApi } from "../api/room-place-api";
import { roomPlaceQueryKeys } from "../query-keys";
import type { RoomPlaceDetailResponse } from "../types/room-place.types";

type RoomPlaceQueryKey = ReturnType<typeof roomPlaceQueryKeys.detail>;

type UseRoomPlaceOptions = {
  roomId: string | null;
  roomPlaceId: number | null;
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<RoomPlaceDetailResponse, unknown, RoomPlaceDetailResponse, RoomPlaceQueryKey>,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function useRoomPlace({
  roomId,
  roomPlaceId,
  enabled = true,
  queryOptions,
}: UseRoomPlaceOptions) {
  const resolvedRoomId = roomId ?? "__missing-room__";
  const resolvedRoomPlaceId = roomPlaceId ?? -1;

  return useQuery({
    queryKey: roomPlaceQueryKeys.detail(resolvedRoomId, resolvedRoomPlaceId),
    queryFn: () => {
      if (!roomId || roomPlaceId == null) {
        throw new Error("roomId and roomPlaceId are required");
      }

      return roomPlaceApi.getRoomPlace(roomId, roomPlaceId);
    },
    enabled: enabled && Boolean(roomId) && roomPlaceId != null,
    ...(queryOptions ?? {}),
  });
}
