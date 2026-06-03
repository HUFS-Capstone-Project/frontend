import type { CourseStop } from "@/shared/types/course";
import type { SavedPlace } from "@/shared/types/map-home";

export function courseStopFromSavedPlace(place: SavedPlace): CourseStop {
  const roomPlaceId = place.roomPlaceId ?? Number(place.id);
  if (!Number.isInteger(roomPlaceId)) {
    throw new Error("roomPlaceId is required to add a place to a course");
  }

  return {
    id: String(roomPlaceId),
    roomPlaceId,
    name: place.name,
    address: place.address,
    category: place.category,
    categoryName: place.categoryName ?? null,
    tagCode: place.tagKeys?.[0] ?? null,
    tagName: place.tagNames?.[0] ?? null,
  };
}
