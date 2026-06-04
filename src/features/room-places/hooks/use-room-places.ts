import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { roomPlaceApi } from "../api/room-place-api";
import { roomPlaceQueryKeys } from "../query-keys";
import type {
  NormalizedRoomPlaceListParams,
  RoomPlaceListParams,
  RoomPlaceListResponse,
} from "../types/room-place.types";

const DEFAULT_ROOM_PLACE_LIMIT = 20;
const DEFAULT_ALL_ROOM_PLACE_PAGE_SIZE = 100;

type RoomPlacesQueryKey =
  | ReturnType<typeof roomPlaceQueryKeys.list>
  | ReturnType<typeof roomPlaceQueryKeys.allList>;

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
    serviceCategoryCode: params.serviceCategoryCode ?? "",
    tagCode: params.tagCode ?? "",
    sidoCode: params.sidoCode?.trim() ?? "",
    sigunguCode: params.sigunguCode?.trim() ?? "",
    createdBy: params.createdBy == null ? "" : String(params.createdBy).trim(),
    page: params.page ?? 0,
    size: params.size ?? params.limit ?? DEFAULT_ROOM_PLACE_LIMIT,
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

export function useAllRoomPlaces({
  roomId,
  params,
  enabled = true,
  queryOptions,
}: UseRoomPlacesOptions) {
  const resolvedRoomId = roomId ?? "__missing-room__";
  const normalizedParams = normalizeRoomPlaceListParams({
    ...params,
    page: 0,
    size: params?.size ?? DEFAULT_ALL_ROOM_PLACE_PAGE_SIZE,
  });

  return useQuery({
    queryKey: roomPlaceQueryKeys.allList(resolvedRoomId, normalizedParams),
    queryFn: async () => {
      if (!roomId) {
        throw new Error("roomId is required");
      }

      const firstPage = await roomPlaceApi.getRoomPlaces(roomId, normalizedParams);
      if (firstPage.totalPages <= 1) {
        return firstPage;
      }

      const remainingPages = await Promise.all(
        Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
          roomPlaceApi.getRoomPlaces(roomId, {
            ...normalizedParams,
            page: index + 1,
          }),
        ),
      );

      return {
        ...firstPage,
        items: [firstPage, ...remainingPages].flatMap((page) => page.items),
      };
    },
    enabled: enabled && Boolean(roomId),
    ...(queryOptions ?? {}),
  });
}
