export const roomPlaceQueryKeys = {
  all: ["room-places"] as const,
  room: (roomId: string) => [...roomPlaceQueryKeys.all, "room", roomId] as const,
  list: (roomId: string, params: RoomPlaceListQueryKeyParams) =>
    [...roomPlaceQueryKeys.room(roomId), "list", params] as const,
  allList: (roomId: string, params: RoomPlaceListQueryKeyParams) =>
    [...roomPlaceQueryKeys.room(roomId), "all-list", params] as const,
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
  page: number;
  size: number;
};
