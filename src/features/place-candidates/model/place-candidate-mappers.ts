import type { SavedPlace } from "@/shared/types/map-home";

import type { PlaceCandidate } from "../types/place-candidate.types";

export function getPlaceCandidateDisplayId(place: PlaceCandidate, index: number): string {
  return place.kakaoPlaceId ?? `place-candidate-${index}`;
}

export function placeCandidateToSavedPlace(place: PlaceCandidate, index: number): SavedPlace {
  return {
    id: getPlaceCandidateDisplayId(place, index),
    kakaoPlaceId: place.kakaoPlaceId,
    roomPlaceId: place.roomPlaceId,
    name: place.name,
    category: place.serviceCategoryCode,
    categoryName: place.serviceCategoryName,
    address: place.roadAddress ?? place.address ?? "",
    latitude: place.latitude ?? 0,
    longitude: place.longitude ?? 0,
  };
}

export function canSubmitPlaceCandidate(place: PlaceCandidate | null): place is PlaceCandidate & {
  kakaoPlaceId: string;
  latitude: number;
  longitude: number;
} {
  return (
    place != null &&
    place.selectable &&
    typeof place.kakaoPlaceId === "string" &&
    place.kakaoPlaceId.trim().length > 0 &&
    typeof place.latitude === "number" &&
    Number.isFinite(place.latitude) &&
    typeof place.longitude === "number" &&
    Number.isFinite(place.longitude)
  );
}
