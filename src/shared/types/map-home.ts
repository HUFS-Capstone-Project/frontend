export type MapPlaceCategory = "맛집" | "카페" | "놀거리" | "기타";
export type MapPrimaryCategory = Exclude<MapPlaceCategory, "기타">;

/** 지도 상단 카테고리 칩(「전체」+ 맛집·카페·놀거리) */
export type MapCategoryFilterChip = MapPrimaryCategory | "전체";

export type SavedPlace = {
  id: string;
  name: string;
  category: MapPlaceCategory;
  tagKeys?: string[];
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
