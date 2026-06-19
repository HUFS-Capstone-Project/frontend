import type { LinkSourceType } from "@/shared/lib/link-source-type";
import type { BusinessHoursDisplay, BusinessHoursStatus } from "@/shared/types/business-hours";
import type { PlaceAddedVia, ServiceCategoryCode } from "@/shared/types/map-home";
import type { SavedPlace } from "@/shared/types/my-page";
import type { RoomPlaceMemo } from "@/shared/types/place-memo";

export type UserPlaceListParams = {
  keyword?: string;
  category?: ServiceCategoryCode;
  categoryCode?: ServiceCategoryCode;
  tagCode?: string;
  sidoCode?: string;
  sigunguCode?: string;
  limit?: number;
  cursor?: string | null;
};

export type NormalizedUserPlaceListParams = {
  keyword: string;
  category: string;
  categoryCode: string;
  tagCode: string;
  sidoCode: string;
  sigunguCode: string;
  limit: number;
  cursor: string | null;
};

export type UserPlaceRoomResponse = {
  roomId: string | number | null;
  roomName: string | null;
};

export type UserPlaceResponse = {
  roomPlaceId: number;
  placeId: number | null;
  kakaoPlaceId: string | null;
  name: string;
  address: string | null;
  roadAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  originalUrl: string | null;
  linkSourceType: LinkSourceType | null;
  addedVia: PlaceAddedVia | null;
  serviceCategoryCode: ServiceCategoryCode;
  serviceCategoryName: string;
  serviceTagCode: string;
  serviceTagName: string;
  memo: string | null;
  memos: RoomPlaceMemo[];
  businessHoursStatus: BusinessHoursStatus;
  businessHours: BusinessHoursDisplay | null;
  room: UserPlaceRoomResponse | null;
};

export type UserPlaceListResponse = {
  items: UserPlaceResponse[];
  limit: number;
  mySavedPlaceTotalCount: number;
  nextCursor: string | null;
  hasNext: boolean;
};

export function userPlaceToSavedPlace(item: UserPlaceResponse): SavedPlace {
  const roomId = item.room?.roomId == null ? null : String(item.room.roomId);

  return {
    id: String(item.roomPlaceId),
    roomPlaceId: item.roomPlaceId,
    roomId,
    roomName: item.room?.roomName ?? null,
    kakaoPlaceId: item.kakaoPlaceId ?? null,
    name: item.name,
    address: item.roadAddress?.trim() || item.address?.trim() || "",
    category: item.serviceCategoryCode,
    categoryName: item.serviceCategoryName,
    tagKeys: item.serviceTagCode ? [item.serviceTagCode] : undefined,
    tagNames: item.serviceTagName ? [item.serviceTagName] : undefined,
    shareLinkUrl: item.originalUrl ?? null,
    addedVia: item.addedVia ?? null,
    linkSourceType: item.linkSourceType ?? null,
    memo: item.memo ?? undefined,
    memos: item.memos,
    latitude: toCoordinateNumber(item.latitude),
    longitude: toCoordinateNumber(item.longitude),
    businessHours: item.businessHoursStatus === "SUCCEEDED" ? item.businessHours : null,
  };
}

function toCoordinateNumber(value: string | number | null | undefined): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
