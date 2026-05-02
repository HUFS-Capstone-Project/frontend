/** 롱프레스로 방 액션 메뉴를 열 때 최소 유지 시간 */
export const FRIEND_ROOM_LONG_PRESS_MS = 500;

/** RoomModalShell 크롬 + `useOverlayFlowController` 기본 언마운트 지연(ms) 단일 소스 */
export const ROOM_ACTION_MODAL_TRANSITION_MS = 180;

/** `RoomModalShell` 스크림 — opacity 페이드 */
export const ROOM_MODAL_OVERLAY_TRANSITION_STYLE = {
  transitionProperty: "opacity",
  transitionDuration: `${ROOM_ACTION_MODAL_TRANSITION_MS}ms`,
  transitionTimingFunction: "ease-out",
} as const;

/** `RoomModalShell` 흰 패널 — opacity + scale(transform) */
export const ROOM_MODAL_PANEL_TRANSITION_STYLE = {
  transitionProperty: "opacity, transform",
  transitionDuration: `${ROOM_ACTION_MODAL_TRANSITION_MS}ms`,
  transitionTimingFunction: "ease-out",
} as const;
