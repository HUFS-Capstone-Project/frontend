import { useMemo } from "react";

import { weightedMapCenter } from "@/components/mypage/map-places-from-my-saved";
import {
  getSavedCourseRouteMapData,
  mapPlacesFromSavedCourses,
} from "@/components/mypage/saved-course-planner-map";
import type { SavedCourse } from "@/shared/types/course";
import type { SavedPlace } from "@/shared/types/my-page";

const EMPTY_SAVED_COURSE_ROUTE_MAP_DATA: ReturnType<typeof getSavedCourseRouteMapData> = {
  places: [],
  routeCoordinates: [],
  markerLabelByPlaceId: {},
};

type UseSavedCourseMapDataOptions = {
  courses: SavedCourse[];
  selectedCourse: SavedCourse | null;
  savedPlaces: SavedPlace[];
  detailOpen: boolean;
  selectedPlaceId: string | null;
};

export function useSavedCourseMapData({
  courses,
  selectedCourse,
  savedPlaces,
  detailOpen,
  selectedPlaceId,
}: UseSavedCourseMapDataOptions) {
  const mapPins = useMemo(
    () =>
      selectedCourse
        ? mapPlacesFromSavedCourses([selectedCourse], savedPlaces)
        : mapPlacesFromSavedCourses(courses, savedPlaces),
    [courses, savedPlaces, selectedCourse],
  );

  const selectedCourseRouteMapData = useMemo(
    () =>
      selectedCourse
        ? getSavedCourseRouteMapData(selectedCourse, savedPlaces)
        : EMPTY_SAVED_COURSE_ROUTE_MAP_DATA,
    [savedPlaces, selectedCourse],
  );

  const mapCenter = useMemo(() => {
    if (detailOpen && selectedPlaceId) {
      const pin = mapPins.find((place) => place.id === selectedPlaceId);
      if (pin) {
        return { latitude: pin.latitude, longitude: pin.longitude };
      }
    }

    return weightedMapCenter(mapPins);
  }, [detailOpen, mapPins, selectedPlaceId]);

  return {
    mapPins,
    selectedCourseRouteMapData,
    mapCenter,
  };
}
