import { isAnyApiErrorCode } from "@/shared/api/error";

const DATE_COURSE_CONFLICT_CODES = [
  "E409_DUPLICATE_DATE_COURSE",
  "DATE_COURSE_ALREADY_SAVED",
] as const;

type DateCourseConflictModalCopy = {
  message: string;
  description: string;
};

const DATE_COURSE_CONFLICT_COPY: DateCourseConflictModalCopy = {
  message: "이미 저장한 코스예요",
  description: "같은 장소와 순서의 코스가 이미 저장되어 있어요",
};

export function getDateCourseConflictModalCopy(error: unknown): DateCourseConflictModalCopy | null {
  if (isAnyApiErrorCode(error, DATE_COURSE_CONFLICT_CODES)) {
    return DATE_COURSE_CONFLICT_COPY;
  }

  return null;
}

export function isDateCourseConflictError(error: unknown): boolean {
  return getDateCourseConflictModalCopy(error) != null;
}

export function isDateCourseNotFoundError(error: unknown): boolean {
  return isAnyApiErrorCode(error, ["DATE_COURSE_NOT_FOUND"]);
}
