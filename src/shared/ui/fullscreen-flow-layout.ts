/**
 * 풀스크린 카드 패널 — `FullScreenOverlayShell` 섹션과 동일.
 * 라우트 기반 플로우와 모달 플로우의 가로·세로 규격 단일 소스.
 */
export const FULLSCREEN_FLOW_PANEL_CLASSES =
  "bg-card relative z-10 flex h-dvh w-full max-w-lg flex-col overflow-hidden md:max-w-3xl xl:max-w-lg";

/** 모달/오버레이 바깥 래퍼 (스크림은 별도) */
export const FULLSCREEN_FLOW_MODAL_OUTER_CLASSES =
  "fixed inset-0 z-80 flex items-center justify-center";

/**
 * 라우트 전용 풀스크린 래퍼 — RootLayout·framer 레이아웃과 무관하게 뷰포트 기준으로 맞춤.
 */
export const FULLSCREEN_FLOW_ROUTE_OUTER_CLASSES =
  "fixed inset-0 z-[70] flex items-center justify-center bg-background";
