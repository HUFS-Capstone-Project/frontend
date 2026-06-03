import type { CourseStop as PlannerCourseStop, SavedCourse } from "@/shared/types/course";
import type { SavedPlace as MapSavedPlace } from "@/shared/types/map-home";
import type { SavedPlace } from "@/shared/types/my-page";

function resolveRoomPlaceId(
  stop: SavedCourse["stops"][number],
  savedPlaces: SavedPlace[],
): number | null {
  if (stop.roomPlaceId != null) {
    return stop.roomPlaceId;
  }

  const fromMy = savedPlaces.find((p) => p.name === stop.name || p.address === stop.address);
  if (fromMy?.roomPlaceId != null) {
    return fromMy.roomPlaceId;
  }

  const parsedFromMy = Number(fromMy?.id);
  if (Number.isInteger(parsedFromMy)) {
    return parsedFromMy;
  }

  const parsedStopId = Number(stop.id);
  return Number.isInteger(parsedStopId) ? parsedStopId : null;
}

export function savedCourseToPlannerStops(
  course: SavedCourse,
  savedPlaces: SavedPlace[],
): PlannerCourseStop[] {
  return course.stops.flatMap((stop) => {
    const roomPlaceId = resolveRoomPlaceId(stop, savedPlaces);
    if (roomPlaceId == null) {
      return [];
    }

    return [
      {
        id: String(roomPlaceId),
        roomPlaceId,
        name: stop.name,
        address: stop.address,
        category: stop.category?.trim() || "저장 코스",
        categoryName: stop.categoryName ?? null,
        tagCode: stop.tagCode ?? null,
        tagName: stop.tagName ?? null,
        sequenceOrder: undefined,
        latitude: stop.latitude ?? null,
        longitude: stop.longitude ?? null,
        walkingTime: stop.walkingTime?.trim() || undefined,
        hours: stop.hours?.trim() || undefined,
      },
    ];
  });
}

function stopToMapPlace(
  stop: SavedCourse["stops"][number],
  roomPlaceId: number,
): MapSavedPlace | null {
  const latitude = stop.latitude;
  const longitude = stop.longitude;
  if (latitude == null || longitude == null) {
    return null;
  }

  return {
    id: String(roomPlaceId),
    roomPlaceId,
    name: stop.name,
    category: stop.category?.trim() || "",
    categoryName: stop.categoryName ?? null,
    tagKeys: stop.tagCode ? [stop.tagCode] : undefined,
    tagNames: stop.tagName ? [stop.tagName] : undefined,
    latitude,
    longitude,
    address: stop.address,
  };
}

/** 저장 코스 장소의 지도 좌표 — API `places` 좌표 우선 */
export function mapPlacesFromSavedCourses(
  courses: SavedCourse[],
  savedPlaces: SavedPlace[],
): MapSavedPlace[] {
  const seen = new Set<number>();
  const result: MapSavedPlace[] = [];

  for (const course of courses) {
    for (const stop of course.stops) {
      const roomPlaceId = resolveRoomPlaceId(stop, savedPlaces);
      if (roomPlaceId == null || seen.has(roomPlaceId)) {
        continue;
      }

      const fromApi = stopToMapPlace(stop, roomPlaceId);
      if (fromApi) {
        seen.add(roomPlaceId);
        result.push(fromApi);
        continue;
      }
    }
  }

  return result;
}
