import { useCallback, useMemo, useState } from "react";

import {
  dateCourseApi,
  type DateCourseCandidateResponse,
  type DateCourseCoordinateResponse,
  type DateCoursePlaceResponse,
  type GenerateDateCourseRequest,
} from "@/features/course-planner/api/date-course-api";
import {
  DATE_COURSE_MODE_LABELS,
  getDateCourseDefaultName,
  normalizeDateCourseName,
} from "@/features/course-planner/constants";
import type { CourseOption, CourseStop } from "@/shared/types/course";
import type { MapCoordinate, SavedPlace } from "@/shared/types/map-home";

type UseCoursePlannerCoursesResult = {
  courses: CourseOption[];
  defaultCourseId: string | null;
  getCourseStops: (courseId: string | null) => CourseStop[];
  getCourseMapPlaces: (courseId: string | null) => SavedPlace[];
  getCourseRouteCoordinates: (courseId: string | null) => MapCoordinate[];
  generateCourses: (payload: GenerateDateCourseRequest) => Promise<void>;
  saveCourse: (dateCourseId: string, courseName: string, roomPlaceIds?: number[]) => Promise<void>;
  clearCourses: () => void;
  isGenerating: boolean;
};

export function useCoursePlannerCourses(roomId: string | null): UseCoursePlannerCoursesResult {
  const [generatedCourses, setGeneratedCourses] = useState<DateCourseCandidateResponse[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const courses = useMemo(
    () =>
      generatedCourses.map((course) => {
        const defaultName = getDateCourseDefaultName(course.mode);
        const title = course.courseName?.trim() || defaultName;
        return {
          id: course.dateCourseId,
          title,
          description: DATE_COURSE_MODE_LABELS[course.mode]?.description ?? defaultName,
          mode: course.mode,
          startDateTime: course.startDateTime,
          endDateTime: course.endDateTime,
        };
      }),
    [generatedCourses],
  );
  const defaultCourseId = courses[0]?.id ?? null;

  const getCourseById = useCallback(
    (courseId: string | null) => {
      const resolvedCourseId = courseId ?? defaultCourseId;
      return generatedCourses.find((course) => course.dateCourseId === resolvedCourseId) ?? null;
    },
    [defaultCourseId, generatedCourses],
  );

  const getCourseStops = useCallback(
    (courseId: string | null) => {
      const course = getCourseById(courseId);
      return course ? mapPlacesToCourseStops(course.places) : [];
    },
    [getCourseById],
  );

  const getCourseMapPlaces = useCallback(
    (courseId: string | null) => {
      const course = getCourseById(courseId);
      return course ? mapPlacesToSavedPlaces(course.places) : [];
    },
    [getCourseById],
  );

  const getCourseRouteCoordinates = useCallback(
    (courseId: string | null) => {
      const course = getCourseById(courseId);
      return course ? mapCoordinates(course.orderedCoordinates) : [];
    },
    [getCourseById],
  );

  const generateCourses = useCallback(
    async (payload: GenerateDateCourseRequest) => {
      if (!roomId) {
        throw new Error("roomId is required");
      }

      setIsGenerating(true);
      try {
        const response = await dateCourseApi.generateDateCourses(roomId, payload);
        setGeneratedCourses(response.courses);
      } finally {
        setIsGenerating(false);
      }
    },
    [roomId],
  );

  const saveCourse = useCallback(
    async (dateCourseId: string, courseName: string, roomPlaceIds?: number[]) => {
      if (!roomId) {
        throw new Error("roomId is required");
      }

      const normalizedCourseName = normalizeDateCourseName(courseName);
      if (normalizedCourseName.length === 0) {
        throw new Error("courseName is required");
      }

      await dateCourseApi.saveDateCourse(roomId, dateCourseId, {
        courseName: normalizedCourseName,
        ...(roomPlaceIds ? { roomPlaceIds } : {}),
      });
    },
    [roomId],
  );

  const clearCourses = useCallback(() => {
    setGeneratedCourses([]);
  }, []);

  return {
    courses,
    defaultCourseId,
    getCourseStops,
    getCourseMapPlaces,
    getCourseRouteCoordinates,
    generateCourses,
    saveCourse,
    clearCourses,
    isGenerating,
  };
}

function mapPlacesToCourseStops(places: DateCoursePlaceResponse[]): CourseStop[] {
  return sortPlacesBySequence(places).map((place) => ({
    id: String(place.roomPlaceId),
    roomPlaceId: place.roomPlaceId,
    name: place.name.trim(),
    address: place.roadAddress?.trim() || place.address.trim(),
    category: place.categoryCode,
    categoryName: place.categoryName ?? null,
    tagCode: place.tagCode,
    tagName: place.tagName ?? null,
    sequenceOrder: place.sequenceOrder,
    latitude: toCoordinateNumber(place.latitude),
    longitude: toCoordinateNumber(place.longitude),
  }));
}

function mapPlacesToSavedPlaces(places: DateCoursePlaceResponse[]): SavedPlace[] {
  return sortPlacesBySequence(places).flatMap((place): SavedPlace[] => {
    const latitude = toCoordinateNumber(place.latitude);
    const longitude = toCoordinateNumber(place.longitude);

    if (latitude == null || longitude == null) {
      return [];
    }

    return [
      {
        id: String(place.roomPlaceId),
        roomPlaceId: place.roomPlaceId,
        kakaoPlaceId: place.kakaoPlaceId ?? null,
        name: place.name.trim(),
        category: place.categoryCode,
        categoryName: place.categoryName ?? null,
        tagKeys: [place.tagCode],
        tagNames: place.tagName ? [place.tagName] : undefined,
        latitude,
        longitude,
        address: place.roadAddress?.trim() || place.address.trim(),
      },
    ];
  });
}

function mapCoordinates(coordinates: DateCourseCoordinateResponse[]) {
  return coordinates
    .slice()
    .sort((left, right) => left.sequenceOrder - right.sequenceOrder)
    .flatMap((coordinate): MapCoordinate[] => {
      const latitude = toCoordinateNumber(coordinate.latitude);
      const longitude = toCoordinateNumber(coordinate.longitude);
      return latitude == null || longitude == null ? [] : [{ latitude, longitude }];
    });
}

function sortPlacesBySequence(places: DateCoursePlaceResponse[]) {
  return places.slice().sort((left, right) => left.sequenceOrder - right.sequenceOrder);
}

function toCoordinateNumber(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
