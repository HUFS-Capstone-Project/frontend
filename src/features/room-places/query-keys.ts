export const roomPlaceQueryKeys = {
  all: ["room-places"] as const,
  room: (roomId: string) => [...roomPlaceQueryKeys.all, "room", roomId] as const,
  list: (roomId: string, params: RoomPlaceListQueryKeyParams) =>
    [...roomPlaceQueryKeys.room(roomId), "list", params] as const,
  map: (roomId: string, bounds: RoomPlaceMapQueryKeyParams) =>
    [...roomPlaceQueryKeys.room(roomId), "map", bounds] as const,
  detail: (roomId: string, roomPlaceId: number) =>
    [...roomPlaceQueryKeys.room(roomId), "detail", roomPlaceId] as const,
};

export type RoomPlaceListQueryKeyParams = {
  keyword: string;
  serviceCategoryCode: string;
  tagCode: string;
  sidoCode: string;
  sigunguCode: string;
  createdBy: string;
  limit: number;
};

export type RoomPlaceMapQueryKeyParams = {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
  zoom: number;
  createdBy?: number | string | null;
};
