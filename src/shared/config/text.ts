/**
 * 앱 전역 UI 문구 (토스트·안내·검증 메시지).
 * 사용자-facing 카피는 이 파일에서 관리합니다.
 */

export const COMMON_TEXT = {
  defaultApiError: "요청 처리 중 문제가 생겼어요",
  networkError: "네트워크 연결을 확인해 주세요",
  validationDetail: "입력값을 확인해 주세요",
} as const;

export const BOTTOM_NAV_TEXT = {
  roomRequiredToast: "방을 먼저 선택해 주세요",
} as const;

export const CLIPBOARD_TEXT = {
  copySuccessToast: "클립보드에 복사했어요",
  copyErrorToast: "복사하지 못했어요 다시 시도해 주세요",
} as const;

export const INVITE_SHARE_TEXT = {
  shareErrorToast: "공유하지 못했어요 다시 시도해 주세요",
} as const;

export const ROOM_TEXT = {
  toast: {
    created: "방을 만들었어요",
    joined: "방에 참여했어요",
    left: "방에서 나갔어요",
    renamed: "방 이름을 바꿨어요",
    pinned: "방을 상단에 고정했어요",
    unpinned: "방 상단 고정을 해제했어요",
    notFound: "이미 삭제됐거나 찾을 수 없는 방이에요",
    forbidden: "이 방에 접근할 권한이 없어요",
    pinUpdateFailed: "상단 고정을 바꾸지 못했어요 다시 시도해 주세요",
    renameFailed: "방 이름을 바꾸지 못했어요 다시 시도해 주세요",
    leaveFailed: "방에서 나가지 못했어요 다시 시도해 주세요",
  },
  validation: {
    nameRequired: "방 이름을 입력해 주세요",
    nameMaxLength: "방 이름은 최대 20자까지 입력할 수 있어요",
  },
} as const;

export const PLACE_TEXT = {
  list: {
    emptySaved: "아직 저장한 장소가 없어요",
    emptyFiltered: "조건에 맞는 장소가 없어요",
  },
  deleteBlocked: {
    title: "코스에 포함된 장소예요",
    description: "코스를 유지하려면 이 장소를 삭제할 수 없어요",
  },
  toast: {
    saved: "장소를 저장했어요",
    memoSaved: "메모를 저장했어요",
    deleted: "장소를 삭제했어요",
  },
} as const;

export const COURSE_TEXT = {
  toast: {
    generated: "데이트 코스가 완성됐어요",
    saved: "코스를 저장했어요",
    updated: "코스를 수정했어요",
    deleted: "코스를 삭제했어요",
    selectSigungu: "시군구를 선택해 주세요",
    selectRoomFirst: "방을 선택한 뒤 코스를 만들어 주세요",
    setDateTime: "날짜와 시간을 설정해 주세요",
    selectPlaces: "방문할 장소를 선택해 주세요",
    roomInfoNotFound: "코스 수정에 필요한 방 정보를 찾지 못했어요",
    placeMinRequired: "코스에는 장소가 1개 이상 필요해요",
  },
} as const;

export const PROFILE_TEXT = {
  nicknameChangeFailed: "닉네임을 바꾸지 못했어요",
} as const;

export const AUTH_TEXT = {
  loginFailed: "로그인하지 못했어요 다시 시도해 주세요",
  loginProcessError: "로그인 처리 중 문제가 생겼어요",
  missingTicket: "인증 정보가 없어요 다시 로그인해 주세요",
  onboardingError: "온보딩 처리 중 문제가 생겼어요",
} as const;
