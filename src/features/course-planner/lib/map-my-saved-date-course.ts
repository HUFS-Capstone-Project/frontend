import type { MySavedDateCourseItemResponse } from "@/features/course-planner/api/date-course-api";
import type { SavedCourse, SavedCourseStop } from "@/shared/types/course";

function toCoordinateNumber(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** 캘린더 필터(`yyyy.MM.dd`)와 맞추기 위한 키 */
export function toCourseDateKey(isoInstant: string) {
  const date = new Date(isoInstant);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function formatSavedAtLabel(savedAt: string) {
  const saved = new Date(savedAt);
  if (Number.isNaN(saved.getTime())) {
    return "저장한 코스";
  }

  const now = new Date();
  const diffDays = Math.floor((now.getTime() - saved.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "오늘 저장한 코스";
  }

  if (diffDays < 7) {
    return `${diffDays}일 전 저장한 코스`;
  }

  const year = saved.getFullYear();
  const month = String(saved.getMonth() + 1).padStart(2, "0");
  const day = String(saved.getDate()).padStart(2, "0");
  return `${year}.${month}.${day} 저장한 코스`;
}

function mapPlaceToSavedCourseStop(
  place: MySavedDateCourseItemResponse["places"][number],
): SavedCourseStop {
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

export function mapMySavedDateCourseToSavedCourse(
  item: MySavedDateCourseItemResponse,
): SavedCourse {
  return {
    id: item.dateCourseId,
    title: `${item.roomName.trim()} | ${item.courseName.trim()}`,
    executedAtLabel: formatSavedAtLabel(item.savedAt),
    badgeLabel: "하트",
    savedFromRoomId: item.roomPublicId,
    courseDateKey: toCourseDateKey(item.startDateTime) ?? toCourseDateKey(item.savedAt),
    stops: item.places
      .slice()
      .sort((left, right) => left.sequenceOrder - right.sequenceOrder)
      .map(mapPlaceToSavedCourseStop),
  };
}
