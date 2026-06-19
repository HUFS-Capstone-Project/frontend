import type { LinkSourceType } from "@/shared/lib/link-source-type";
import type { BusinessHoursDisplay, BusinessHoursStatus } from "@/shared/types/business-hours";
import type { PlaceAddedVia, ServiceCategoryCode } from "@/shared/types/map-home";
import type { RoomPlaceMemo } from "@/shared/types/place-memo";

export type RoomPlaceListParams = {
  keyword?: string;
  serviceCategoryCode?: ServiceCategoryCode;
  tagCode?: string;
  sidoCode?: string;
  sigunguCode?: string;
  createdBy?: number | string | null;
  limit?: number;
  cursor?: string | null;
};

export type NormalizedRoomPlaceListParams = {
  keyword: string;
  serviceCategoryCode: string;
  tagCode: string;
  sidoCode: string;
  sigunguCode: string;
  createdBy: string;
  limit: number;
  cursor: string | null;
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
  latitude: number | null;
  longitude: number | null;
  originalUrl: string | null;
  linkSourceType: LinkSourceType | null;
  addedVia: PlaceAddedVia | null;
  categoryName: string | null;
  categoryGroupCode: string | null;
  serviceCategoryCode: ServiceCategoryCode;
  serviceCategoryName: string;
  serviceTagCode: string;
  serviceTagName: string;
  sidoCode: string | null;
  sidoName: string | null;
  sigunguCode: string | null;
  sigunguName: string | null;
  memo: string | null;
  memos: RoomPlaceMemo[];
  originRoomLinkId: number | null;
  createdBy: number | null;
  createdAt: string | null;
  businessHours: RoomPlaceBusinessHours | null;
  businessHoursStatus: RoomPlaceBusinessHoursStatus;
  businessHoursFetchedAt: string | null;
  businessHoursExpiresAt: string | null;
};

export type RoomPlace = RoomPlaceDto;

export type RoomPlaceListResponse = {
  items: RoomPlaceDto[];
  limit: number;
  roomPlaceTotalCount: number;
  nextCursor: string | null;
  hasNext: boolean;
};

export type RoomPlaceDetailResponse = RoomPlaceDto;

export type UpdateRoomPlaceMemoRequest = {
  memo: string;
};

export type RoomPlaceMapBoundsParams = {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
  zoom: number;
  createdBy?: number | string | null;
};

export type RoomPlaceMapPinDto = {
  roomPlaceId: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  categoryCode: ServiceCategoryCode | string;
  tagCode: string | null;
};

export type RoomPlaceMapResponse = {
  items: RoomPlaceMapPinDto[];
  limit: number;
  truncated: boolean;
};
