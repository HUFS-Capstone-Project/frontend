export type MapPlaceCategory = "맛집" | "카페" | "놀거리" | "기타";

export type SavedPlace = {
  id: string;
  name: string;
  category: MapPlaceCategory;
  latitude: number;
  longitude: number;
  address: string;
};

export type RoomFriend = {
  id: string;
  name: string;
};

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};
