import { parseApiError } from "@/shared/api/error";

type DateCourseConflictModalCopy = {
  message: string;
  description: string;
};

const DATE_COURSE_CONFLICT_COPY: DateCourseConflictModalCopy = {
  message: "이미 저장한 코스예요",
  description: "같은 장소와 순서의 코스가 이미 저장되어 있어요.",
};

export function getDateCourseConflictModalCopy(
  error: unknown,
): DateCourseConflictModalCopy | null {
  const parsed = parseApiError(error);
  const message = parsed.detail ?? parsed.message;

  if (
    parsed.code === "E409_DUPLICATE_DATE_COURSE" ||
    message.includes("동일한 데이트 코스")
  ) {
    return DATE_COURSE_CONFLICT_COPY;
  }

  if (parsed.status === 409 && message.includes("이미 저장된 데이트 코스")) {
    return DATE_COURSE_CONFLICT_COPY;
  }

  return null;
}

export function isDateCourseConflictError(error: unknown) {
  return getDateCourseConflictModalCopy(error) != null;
}
