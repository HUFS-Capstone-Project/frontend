import { isApiErrorCode } from "@/shared/api/error";

export function isRoomPlaceUsedInDateCourseError(error: unknown): boolean {
  return isApiErrorCode(error, "ROOM_PLACE_USED_IN_DATE_COURSE");
}

export function isRoomNotFoundError(error: unknown): boolean {
  return isApiErrorCode(error, "ROOM_NOT_FOUND");
}

export function isRoomAccessForbiddenError(error: unknown): boolean {
  return isApiErrorCode(error, "ROOM_ACCESS_FORBIDDEN") || isApiErrorCode(error, "ROOM_NOT_MEMBER");
}
