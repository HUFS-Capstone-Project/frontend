/**
 * 풀스크린 콘텐츠·라우트 Outlet 페이드(ms).
 * 중앙 다이얼로그 크롬은 `ROOM_ACTION_MODAL_TRANSITION_MS`·`ROOM_MODAL_*_TRANSITION_STYLE`(features/room/constants).
 */
export const SHELL_CONTENT_FADE_MS = 120;

/** framer-motion `duration`(초) — 매 렌더 객체 생성 줄이려 모듈에서 한 번 계산 */
export const SHELL_CONTENT_FADE_SECONDS = SHELL_CONTENT_FADE_MS / 1000;

/** 스크림·패널에 공유 (동일 레퍼런스 유지 가능) */
export const SHELL_CONTENT_FADE_TRANSITION_STYLE = {
  transitionProperty: "opacity",
  transitionDuration: `${SHELL_CONTENT_FADE_MS}ms`,
  transitionTimingFunction: "ease-out",
} as const;
