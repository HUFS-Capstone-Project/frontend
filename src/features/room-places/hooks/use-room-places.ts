import {
  type InfiniteData,
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { roomPlaceApi } from "../api/room-place-api";
import { roomPlaceQueryKeys } from "../query-keys";
import type {
  NormalizedRoomPlaceListParams,
  RoomPlaceListParams,
  RoomPlaceListResponse,
  RoomPlaceMapBoundsParams,
  RoomPlaceMapResponse,
} from "../types/room-place.types";

const DEFAULT_ROOM_PLACE_LIMIT = 20;

type RoomPlacesQueryKey = ReturnType<typeof roomPlaceQueryKeys.list>;
type RoomPlaceMapQueryKey = ReturnType<typeof roomPlaceQueryKeys.map>;

type UseRoomPlacesOptions = {
  roomId: string | null;
  params?: RoomPlaceListParams;
  enabled?: boolean;
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      RoomPlaceListResponse,
      Error,
      InfiniteData<RoomPlaceListResponse, string | null>,
      RoomPlacesQueryKey,
      string | null
    >,
    "queryKey" | "queryFn" | "enabled" | "initialPageParam" | "getNextPageParam"
  >;
};

type UseRoomPlaceMapPinsOptions = {
  roomId: string | null;
  bounds: RoomPlaceMapBoundsParams | null;
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<RoomPlaceMapResponse, unknown, RoomPlaceMapResponse, RoomPlaceMapQueryKey>,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function normalizeRoomPlaceListParams(
  params: RoomPlaceListParams = {},
): NormalizedRoomPlaceListParams {
  return {
    keyword: params.keyword?.trim() ?? "",
    serviceCategoryCode: params.serviceCategoryCode ?? "",
    tagCode: params.tagCode ?? "",
    sidoCode: params.sidoCode?.trim() ?? "",
    sigunguCode: params.sigunguCode?.trim() ?? "",
    createdBy: params.createdBy == null ? "" : String(params.createdBy).trim(),
    limit: params.limit ?? DEFAULT_ROOM_PLACE_LIMIT,
    cursor: params.cursor?.trim() || null,
  };
}

function toQueryKeyParams(params: NormalizedRoomPlaceListParams) {
  return {
    keyword: params.keyword,
    serviceCategoryCode: params.serviceCategoryCode,
    tagCode: params.tagCode,
    sidoCode: params.sidoCode,
    sigunguCode: params.sigunguCode,
    createdBy: params.createdBy,
    limit: params.limit,
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
  const queryKeyParams = toQueryKeyParams(normalizedParams);

  return useInfiniteQuery<
    RoomPlaceListResponse,
    Error,
    InfiniteData<RoomPlaceListResponse, string | null>,
    RoomPlacesQueryKey,
    string | null
  >({
    queryKey: roomPlaceQueryKeys.list(resolvedRoomId, queryKeyParams),
    queryFn: ({ pageParam }) => {
      if (!roomId) {
        throw new Error("roomId is required");
      }

      return roomPlaceApi.getRoomPlaces(roomId, {
        ...normalizedParams,
        cursor: pageParam,
      });
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    enabled: enabled && Boolean(roomId),
    ...(queryOptions ?? {}),
  });
}

export function useRoomPlaceMapPins({
  roomId,
  bounds,
  enabled = true,
  queryOptions,
}: UseRoomPlaceMapPinsOptions) {
  const resolvedRoomId = roomId ?? "__missing-room__";
  const resolvedBounds = bounds ?? {
    swLat: 0,
    swLng: 0,
    neLat: 0,
    neLng: 0,
    zoom: 0,
  };

  return useQuery({
    queryKey: roomPlaceQueryKeys.map(resolvedRoomId, resolvedBounds),
    queryFn: () => {
      if (!roomId || !bounds) {
        throw new Error("roomId and bounds are required");
      }

      return roomPlaceApi.getRoomPlaceMapPins(roomId, bounds);
    },
    enabled: enabled && Boolean(roomId) && bounds != null,
    staleTime: 1000 * 20,
    ...(queryOptions ?? {}),
  });
}
