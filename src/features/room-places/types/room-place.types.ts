export type RoomPlaceListParams = {
  keyword?: string;
  category?: string;
  categoryCode?: string;
  tagCode?: string;
  sidoCode?: string;
  sigunguCode?: string;
  page?: number;
  size?: number;
  limit?: number;
};

export type NormalizedRoomPlaceListParams = {
  keyword: string;
  category: string;
  categoryCode: string;
  tagCode: string;
  sidoCode: string;
  sigunguCode: string;
  page: number;
  size: number;
};

export type RoomPlaceDto = {
  roomPlaceId: number;
  placeId: number;
  kakaoPlaceId: string;
  name: string;
  address: string | null;
  roadAddress: string | null;
  latitude: number;
  longitude: number;
  categoryName: string | null;
  categoryGroupCode: string | null;
  categoryGroupName: string | null;
  serviceCategoryCode: string | null;
  serviceCategoryName: string | null;
  serviceTagCode: string | null;
  serviceTagName: string | null;
  sidoCode: string | null;
  sidoName: string | null;
  sigunguCode: string | null;
  sigunguName: string | null;
  memo: string | null;
  sourceType: string | null;
  sourceRoomLinkId: number | null;
  createdBy: number | null;
  createdAt: string | null;
};

export type RoomPlace = RoomPlaceDto;

export type RoomPlaceListResponse = {
  items: RoomPlaceDto[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
};

export type UpdateRoomPlaceMemoRequest = {
  memo: string;
};
