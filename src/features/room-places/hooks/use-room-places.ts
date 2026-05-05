import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { roomPlaceApi } from "../api/room-place-api";
import { roomPlaceQueryKeys } from "../query-keys";
import type { RoomPlaceListParams, RoomPlaceListResponse } from "../types/room-place.types";

const DEFAULT_ROOM_PLACE_LIMIT = 20;

type NormalizedRoomPlaceListParams = Required<RoomPlaceListParams>;
type RoomPlacesQueryKey = ReturnType<typeof roomPlaceQueryKeys.list>;

type UseRoomPlacesOptions = {
  roomId: string | null;
  params?: RoomPlaceListParams;
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<RoomPlaceListResponse, unknown, RoomPlaceListResponse, RoomPlacesQueryKey>,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function normalizeRoomPlaceListParams(
  params: RoomPlaceListParams = {},
): NormalizedRoomPlaceListParams {
  return {
    keyword: params.keyword?.trim() ?? "",
    categoryCode: params.categoryCode ?? "",
    tagCode: params.tagCode ?? "",
    page: params.page ?? 0,
    limit: params.limit ?? DEFAULT_ROOM_PLACE_LIMIT,
  };
}

export function useRoomPlaces({
  roomId,
  params,
  enabled = true,
  queryOptions,
}: UseRoomPlacesOptions) {
  const resolvedRoomId = roomId ?? "__missing-room__";
  const normalizedParams = normalizeRoomPlaceListParams(params);

  return useQuery({
    queryKey: roomPlaceQueryKeys.list(resolvedRoomId, normalizedParams),
    queryFn: () => {
      if (!roomId) {
        throw new Error("roomId is required");
      }

      return roomPlaceApi.getRoomPlaces(roomId, normalizedParams);
    },
    enabled: enabled && Boolean(roomId),
    ...(queryOptions ?? {}),
  });
}
