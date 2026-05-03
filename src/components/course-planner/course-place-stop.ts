import type { CourseStop } from "@/shared/types/course";
import type { SavedPlace } from "@/shared/types/map-home";

export function courseStopFromSavedPlace(place: SavedPlace): CourseStop {
  return {
    id: `course-added-${place.id}`,
    placeId: place.id,
    name: place.name,
    address: place.address,
    category: place.category,
    walkingTime: "도보 시간 확인 필요",
    hours: "영업시간 확인 필요",
  };
}
