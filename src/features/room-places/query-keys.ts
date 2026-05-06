export const roomPlaceQueryKeys = {
  all: ["room-places"] as const,
  room: (roomId: string) => [...roomPlaceQueryKeys.all, "room", roomId] as const,
  list: (roomId: string, params: RoomPlaceListQueryKeyParams) =>
    [...roomPlaceQueryKeys.room(roomId), "list", params] as const,
};

export type RoomPlaceListQueryKeyParams = {
  keyword: string;
  category: string;
  categoryCode: string;
  tagCode: string;
  sidoCode: string;
  sigunguCode: string;
  page: number;
  size: number;
};
