import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import type { CourseStop as PlannerCourseStop, SavedCourse } from "@/shared/types/course";
import type { SavedPlace as MapSavedPlace } from "@/shared/types/map-home";
import type { SavedPlace } from "@/shared/types/my-page";

function resolvePlaceId(
  stop: { id: string; name: string; address: string },
  savedPlaces: SavedPlace[],
) {
  const fromMy = savedPlaces.find((p) => p.name === stop.name || p.address === stop.address);
  if (fromMy) return fromMy.id;

  const fromMap = SAVED_PLACE_MOCKS.find((p) => p.name === stop.name || p.address === stop.address);
  if (fromMap) return fromMap.id;

  return stop.id;
}

export function savedCourseToPlannerStops(
  course: SavedCourse,
  savedPlaces: SavedPlace[],
): PlannerCourseStop[] {
  return course.stops.map((stop) => ({
    id: stop.id,
    placeId: resolvePlaceId(stop, savedPlaces),
    name: stop.name,
    address: stop.address,
    category: "저장 코스",
    walkingTime: stop.walkingTime?.trim() || "-",
    hours: stop.hours?.trim() || "-",
  }));
}

/** 저장 코스에 포함된 정류의 지도 좌표(목 목데이터) — 핀 표시용 */
export function mapPlacesFromSavedCourses(
  courses: SavedCourse[],
  savedPlaces: SavedPlace[],
): MapSavedPlace[] {
  const seen = new Set<string>();
  const result: MapSavedPlace[] = [];

  for (const course of courses) {
    for (const stop of savedCourseToPlannerStops(course, savedPlaces)) {
      if (seen.has(stop.placeId)) continue;
      const mock = SAVED_PLACE_MOCKS.find((p) => p.id === stop.placeId);
      if (mock) {
        seen.add(stop.placeId);
        result.push(mock);
      }
    }
  }

  return result;
}
