import type { DateCourseMode } from "@/features/course-planner/api/date-course-api";

export type CoursePlannerMode = "form" | "region" | "datetime" | "loading" | "result" | "detail";

export const COURSE_TOAST_DURATION_MS = 3200;
export const COURSE_FALLBACK_TITLE = "코스 1";
export const COURSE_LOADING_ROOM_FALLBACK = "방";

export const DATE_COURSE_MAX_NAME_LENGTH = 20;

/** 저장 전 후보 카드·상세에 쓰는 기본 코스 이름 */
export const DATE_COURSE_DEFAULT_NAME_BY_MODE: Record<DateCourseMode, string> = {
  GENERAL: "GENERAL 코스",
  TRENDY: "TRENDY 코스",
  POPULAR: "POPULAR 코스",
};

export const DATE_COURSE_MODE_LABELS: Record<
  DateCourseMode,
  { title: string; description: string }
> = {
  GENERAL: {
    title: DATE_COURSE_DEFAULT_NAME_BY_MODE.GENERAL,
    description: "균형 있게 구성된 코스",
  },
  TRENDY: {
    title: DATE_COURSE_DEFAULT_NAME_BY_MODE.TRENDY,
    description: "최근 등록된 장소로 구성된 코스",
  },
  POPULAR: {
    title: DATE_COURSE_DEFAULT_NAME_BY_MODE.POPULAR,
    description: "릴스·링크 인기 장소로 구성된 코스",
  },
};

export function getDateCourseDefaultName(mode: DateCourseMode) {
  return DATE_COURSE_DEFAULT_NAME_BY_MODE[mode] ?? `${mode} 코스`;
}

export function normalizeDateCourseName(value: string) {
  return value.trim().slice(0, DATE_COURSE_MAX_NAME_LENGTH);
}
