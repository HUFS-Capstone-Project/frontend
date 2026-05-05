import type { SavedPlace } from "@/shared/types/map-home";

import type { RoomPlace } from "../types/room-place.types";

export function roomPlaceToSavedPlace(place: RoomPlace): SavedPlace {
  return {
    id: String(place.roomPlaceId),
    name: place.name,
    category: place.serviceCategoryCode ?? place.categoryGroupCode ?? place.categoryName ?? "",
    tagKeys: place.serviceTagCode ? [place.serviceTagCode] : undefined,
    latitude: place.latitude,
    longitude: place.longitude,
    address: place.roadAddress ?? place.address ?? "",
    shareLinkUrl: null,
    memo: place.memo ?? undefined,
  };
}
