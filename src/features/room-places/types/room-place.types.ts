import type { BusinessHoursDisplay, BusinessHoursStatus } from "@/shared/types/business-hours";

export type RoomPlaceListParams = {
  keyword?: string;
  category?: string;
  categoryCode?: string;
  tagCode?: string;
  sidoCode?: string;
  sigunguCode?: string;
  createdBy?: number | string | null;
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
  createdBy: string;
  page: number;
  size: number;
};

export type RoomPlaceBusinessHoursStatus = BusinessHoursStatus;
export type RoomPlaceBusinessHours = BusinessHoursDisplay;

export type RoomPlaceDto = {
  roomPlaceId: number;
  placeId: number;
  kakaoPlaceId: string;
  name: string;
  address: string | null;
  roadAddress: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  sourceUrl?: string | null;
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
  businessHours: RoomPlaceBusinessHours | null;
  businessHoursStatus: RoomPlaceBusinessHoursStatus;
  businessHoursFetchedAt?: string | null;
  businessHoursExpiresAt?: string | null;
};

export type RoomPlace = RoomPlaceDto;

export type RoomPlaceListResponse = {
  items: RoomPlaceDto[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
};

export type RoomPlaceDetailResponse = RoomPlaceDto;

export type UpdateRoomPlaceMemoRequest = {
  memo: string;
};
