import type {
  DateCourseDetailResponse,
  DateCoursePlaceResponse,
  SavedRoomDateCourseItemResponse,
} from "@/features/course-planner/api/date-course-api";
import {
  formatSavedAtLabel,
  toCourseDateKey,
} from "@/features/course-planner/lib/map-my-saved-date-course";
import type { SavedCourse, SavedCourseStop } from "@/shared/types/course";

function toCoordinateNumber(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapPlaceToSavedCourseStop(place: DateCoursePlaceResponse): SavedCourseStop {
  return {
    id: String(place.roomPlaceId),
    roomPlaceId: place.roomPlaceId,
    name: place.name.trim(),
    address: place.roadAddress?.trim() || place.address.trim(),
    category: place.categoryCode,
    categoryName: place.categoryName ?? null,
    tagCode: place.tagCode,
    tagName: place.tagName ?? null,
    latitude: toCoordinateNumber(place.latitude),
    longitude: toCoordinateNumber(place.longitude),
  };
}

export function mapRoomSavedDateCourseToSavedCourse(
  item: SavedRoomDateCourseItemResponse | DateCourseDetailResponse,
  roomId?: string | null,
): SavedCourse {
  const courseName = item.courseName?.trim() || "저장된 데이트 코스";
  const savedAt = item.savedAt ?? null;
  const places = item.places ?? [];

  return {
    id: item.dateCourseId,
    title: courseName,
    executedAtLabel: savedAt ? formatSavedAtLabel(savedAt) : "저장된 코스",
    badgeLabel: item.savedByNickname ? "친구" : "하트",
    savedByUserId: item.savedByUserId ?? null,
    savedByNickname: item.savedByNickname ?? null,
    savedByProfileImageUrl: item.savedByProfileImageUrl ?? null,
    savedAt,
    savedFromRoomId: item.roomPublicId ?? roomId ?? null,
    courseDateKey:
      toCourseDateKey(item.startDateTime) ?? (savedAt ? toCourseDateKey(savedAt) : null),
    stops: places
      .slice()
      .sort((left, right) => left.sequenceOrder - right.sequenceOrder)
      .map(mapPlaceToSavedCourseStop),
  };
}
