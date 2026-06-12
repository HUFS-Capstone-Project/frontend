import type { SavedPlace } from "@/shared/types/map-home";

import type { RoomPlace, RoomPlaceMapPinDto } from "../types/room-place.types";

export function roomPlaceToSavedPlace(place: RoomPlace): SavedPlace {
  return {
    id: String(place.roomPlaceId),
    roomPlaceId: place.roomPlaceId,
    kakaoPlaceId: place.kakaoPlaceId,
    name: place.name,
    category: place.serviceCategoryCode,
    categoryName: place.serviceCategoryName,
    tagKeys: place.serviceTagCode ? [place.serviceTagCode] : undefined,
    tagNames: place.serviceTagName ? [place.serviceTagName] : undefined,
    latitude: toCoordinateNumber(place.latitude),
    longitude: toCoordinateNumber(place.longitude),
    address: place.roadAddress ?? place.address ?? "",
    shareLinkUrl: place.originalUrl ?? null,
    addedVia: place.addedVia ?? null,
    linkSourceType: place.linkSourceType ?? null,
    memo: place.memo ?? undefined,
    memos: place.memos,
    businessHours: place.businessHoursStatus === "SUCCEEDED" ? place.businessHours : null,
    createdAt: place.createdAt,
  };
}

export function roomPlaceMapPinToSavedPlace(place: RoomPlaceMapPinDto): SavedPlace {
  return {
    id: String(place.roomPlaceId),
    roomPlaceId: place.roomPlaceId,
    name: place.name,
    category: place.categoryCode,
    categoryName: place.categoryName ?? null,
    tagKeys: place.tagCode ? [place.tagCode] : undefined,
    tagNames: place.tagName ? [place.tagName] : undefined,
    latitude: toCoordinateNumber(place.latitude),
    longitude: toCoordinateNumber(place.longitude),
    address: "",
  };
}

function toCoordinateNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
