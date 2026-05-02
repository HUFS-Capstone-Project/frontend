/**
 * 링크 추가(입력) 화면을 기준으로 한 공통 레이아웃 클래스.
 * 동일 패턴: 스크롤 컬럼 → 제목 스택(space-y-1) → 본문(mt-6) → 필요 시 목록 → 푸터(mt-auto 2열 그리드)
 */
export const LINK_FLOW_PAGE_CLASS =
  "scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-16 pb-8";

export const LINK_FLOW_HEADLINE_STACK_CLASS = "space-y-1";

export const LINK_FLOW_AFTER_HEADLINES_CLASS = "mt-6";

export const LINK_FLOW_FOOTER_GRID_CLASS = "mt-auto grid grid-cols-2 gap-2.5";
