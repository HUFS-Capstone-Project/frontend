export const roomPlaceQueryKeys = {
  all: ["room-places"] as const,
  room: (roomId: string) => [...roomPlaceQueryKeys.all, "room", roomId] as const,
  list: (roomId: string, params: RoomPlaceListQueryKeyParams) =>
    [...roomPlaceQueryKeys.room(roomId), "list", params] as const,
};

export type RoomPlaceListQueryKeyParams = {
  keyword: string;
  categoryCode: string;
  tagCode: string;
  page: number;
  limit: number;
};
