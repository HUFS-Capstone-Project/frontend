import type { CourseStop } from "@/shared/types/course";
import type { MapCoordinate, SavedPlace } from "@/shared/types/map-home";

export function mapCourseStopsToMapPlaces(stops: CourseStop[]): SavedPlace[] {
  return stops.flatMap((stop): SavedPlace[] => {
    if (stop.latitude == null || stop.longitude == null) {
      return [];
    }

    return [
      {
        id: String(stop.roomPlaceId),
        roomPlaceId: stop.roomPlaceId,
        kakaoPlaceId: null,
        name: stop.name,
        category: stop.category,
        categoryName: stop.categoryName ?? null,
        tagKeys: stop.tagCode ? [stop.tagCode] : [],
        tagNames: stop.tagName ? [stop.tagName] : undefined,
        latitude: stop.latitude,
        longitude: stop.longitude,
        address: stop.address,
      },
    ];
  });
}

export function mapCourseStopsToRouteCoordinates(stops: CourseStop[]): MapCoordinate[] {
  return stops.flatMap((stop): MapCoordinate[] => {
    if (stop.latitude == null || stop.longitude == null) {
      return [];
    }
    return [{ latitude: stop.latitude, longitude: stop.longitude }];
  });
}

export function getCourseStopRouteMapData(stops: CourseStop[]) {
  const places = mapCourseStopsToMapPlaces(stops);
  const routeCoordinates = mapCourseStopsToRouteCoordinates(stops);
  const markerLabelByPlaceId = places.reduce<Record<string, string>>((labels, place, index) => {
    labels[place.id] = String(index + 1);
    return labels;
  }, {});

  return {
    places,
    routeCoordinates,
    markerLabelByPlaceId,
  };
}

/** Route order signature used to refresh the map viewport. */
export function courseStopOrderSignature(stops: CourseStop[]) {
  return stops.map((stop) => stop.roomPlaceId).join(",");
}

export function mapPlacesOrderSignature(places: Pick<SavedPlace, "id">[]) {
  return places.map((place) => place.id).join(",");
}

export function createMapRouteViewportKey({
  courseId,
  courseEditDraft,
  fallbackOrderKey,
  isSheetExpanded,
}: {
  courseId: string | null | undefined;
  courseEditDraft: { stops: CourseStop[] } | null;
  fallbackOrderKey: string;
  isSheetExpanded: boolean;
}) {
  const orderKey = courseEditDraft
    ? courseStopOrderSignature(courseEditDraft.stops)
    : fallbackOrderKey;
  return `${courseId ?? "none"}-${orderKey}-${isSheetExpanded ? "expanded" : "collapsed"}`;
}
