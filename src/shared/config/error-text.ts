import { AUTH_TEXT, COMMON_TEXT, COURSE_TEXT, PLACE_TEXT, ROOM_TEXT } from "@/shared/config/text";

/** 백엔드 `ErrorCode.name()` → 사용자-facing 문구 */
export const ERROR_TEXT = {
  E400_VALIDATION: COMMON_TEXT.validationDetail,
  E400_BIND: COMMON_TEXT.validationDetail,
  E400_CONSTRAINT: COMMON_TEXT.validationDetail,
  E400_ILLEGAL_ARGUMENT: "잘못된 요청이에요",
  MOBILE_LOGIN_PKCE_REQUIRED: "모바일 로그인 설정이 올바르지 않아요",

  E401_UNAUTHORIZED: "로그인이 필요해요 다시 시도해 주세요",
  AUTHENTICATED_USER_NOT_FOUND: AUTH_TEXT.missingTicket,
  WEB_LOGIN_TICKET_INVALID: AUTH_TEXT.missingTicket,
  MOBILE_AUTH_CODE_INVALID: AUTH_TEXT.missingTicket,
  REFRESH_TOKEN_COOKIE_REQUIRED: "다시 로그인해 주세요",
  REFRESH_TOKEN_NOT_FOUND: "다시 로그인해 주세요",
  REFRESH_TOKEN_INACTIVE: "다시 로그인해 주세요",
  PKCE_VERIFICATION_FAILED: AUTH_TEXT.loginFailed,
  E401_INVALID_TOKEN: "인증이 만료됐어요 다시 로그인해 주세요",
  E401_TOKEN_EXPIRED: "인증이 만료됐어요 다시 로그인해 주세요",

  E403_FORBIDDEN: "요청 권한이 없어요",
  USER_ACCOUNT_DISABLED: "비활성화된 계정이에요",
  ROOM_ACCESS_FORBIDDEN: ROOM_TEXT.toast.forbidden,
  ROOM_NOT_MEMBER: ROOM_TEXT.toast.forbidden,
  LINK_ANALYSIS_REQUEST_FORBIDDEN: "요청 권한이 없어요 방 참여 상태를 확인해 주세요",
  DATE_COURSE_FORBIDDEN_EDIT: "코스를 수정할 권한이 없어요",
  DATE_COURSE_FORBIDDEN_DELETE: "코스를 삭제할 권한이 없어요",

  E404_NOT_FOUND: "요청한 정보를 찾지 못했어요",
  USER_NOT_FOUND: "사용자 정보를 찾지 못했어요",
  ROOM_NOT_FOUND: ROOM_TEXT.toast.notFound,
  ROOM_PLACE_NOT_FOUND: "장소를 찾지 못했어요",
  DATE_COURSE_NOT_FOUND: "코스를 찾지 못했어요",
  DATE_COURSE_NO_PLACES: COURSE_TEXT.toast.selectPlaces,
  DATE_COURSE_GENERATION_EMPTY: "만들 수 있는 코스가 없어요",
  LINK_NOT_FOUND: "링크를 찾지 못했어요",
  LINK_ANALYSIS_REQUEST_NOT_FOUND: "링크 분석 요청을 찾지 못했어요",
  LINK_CANDIDATE_NOT_FOUND: "장소 후보를 찾지 못했어요",

  E409_CONFLICT: COMMON_TEXT.defaultApiError,
  E409_TOKEN_REUSE_DETECTED: "다시 로그인해 주세요",
  E409_DUPLICATE_DATE_COURSE: "같은 장소와 순서의 코스가 이미 저장돼 있어요",
  DATE_COURSE_ALREADY_SAVED: "이미 저장한 코스예요",
  ONBOARDING_ALREADY_COMPLETED: "이미 온보딩을 마쳤어요",
  LINK_ANALYSIS_NOT_COMPLETED: "분석이 완료된 링크만 장소를 저장할 수 있어요",
  LINK_ANALYSIS_RETRY_STATE_CHANGED: "요청 상태가 바뀌었어요 다시 시도해 주세요",
  LINK_ANALYSIS_RETRY_NOT_ALLOWED: "지금은 다시 시도할 수 없어요",
  LINK_ANALYSIS_NOT_EXPIRED: "아직 분석 중이에요 잠시 후 다시 시도해 주세요",
  ROOM_ALREADY_JOINED: "이미 참여한 방이에요",
  ROOM_MEMBER_LIMIT_REACHED: "방 정원이 가득 찼어요",
  ROOM_PLACE_USED_IN_DATE_COURSE: PLACE_TEXT.deleteBlocked.description,
  ROOM_PLACE_SAVE_CONFLICT: "장소 저장이 겹쳤어요 다시 시도해 주세요",
  ROOM_LINK_CREATE_CONFLICT: COMMON_TEXT.defaultApiError,
  LINK_CANDIDATE_OVERRIDE_CONFLICT: COMMON_TEXT.defaultApiError,

  E429_TOO_MANY_REQUESTS: "잠시 후 다시 시도해 주세요",
  LINK_ANALYSIS_INSTAGRAM_COOLDOWN: "잠시 후 다시 시도해 주세요",

  E502_EXTERNAL_API: "서버 요청을 처리하지 못했어요 잠시 후 다시 시도해 주세요",
  E500_INTERNAL: COMMON_TEXT.defaultApiError,
} as const satisfies Record<string, string>;

/** HTTP status 공통 fallback (code 매핑이 없을 때) */
export const HTTP_ERROR_TEXT: Partial<Record<number, string>> = {
  400: COMMON_TEXT.validationDetail,
  401: ERROR_TEXT.E401_UNAUTHORIZED,
  403: ERROR_TEXT.E403_FORBIDDEN,
  404: ERROR_TEXT.E404_NOT_FOUND,
  409: ERROR_TEXT.E409_CONFLICT,
  429: ERROR_TEXT.E429_TOO_MANY_REQUESTS,
  500: COMMON_TEXT.defaultApiError,
  502: ERROR_TEXT.E502_EXTERNAL_API,
};

export type KnownErrorCode = keyof typeof ERROR_TEXT;
