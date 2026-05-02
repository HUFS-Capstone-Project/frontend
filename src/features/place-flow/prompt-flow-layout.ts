/**
 * 풀스크린 장소/링크 프롬프트 플로우 — 헤더·스크롤 본문·리스트·알림 스타일 단일 소스.
 * (`LinkInputScreen`처럼 본문+하단 버튼이 한 스크롤 컬럼인 경우는 `link-flow-layout` 유지.)
 */

/** 상단 헤더(타이틀 + 링크바/입력 블록) */
export const PROMPT_FLOW_HEADER_CLASS = "shrink-0 px-6 pt-16";

/** `PlaceFlowHeadlines` 바로 아래 블록(링크바·검색 등) */
export const PROMPT_FLOW_BELOW_HEADLINES_CLASS = "mt-6 space-y-3 pb-5";

/** 고정 헤더 아래 스크롤 영역 — 리스트/빈 상태 */
export const PROMPT_FLOW_SCROLL_BODY_CLASS =
  "scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pb-3";

/** 제목 블록이 스크롤 영역 안에 포함된 경우(`CandidatePlaceResultScreen` 등) */
export const PROMPT_FLOW_SCROLL_INSET_HEADER_CLASS =
  "scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pt-16 pb-3";

export const PROMPT_FLOW_LIST_TOP_BORDER_CLASS = "border-t border-black/5";

/** 취소/보조 `PillButton` outline 변형 공통 */
export const PROMPT_FLOW_OUTLINE_PILL_CLASS = "text-muted-foreground hover:text-muted-foreground";

export const PROMPT_FLOW_ALERT_INLINE_CLASS = "text-destructive text-sm";

export const PROMPT_FLOW_ALERT_BELOW_INPUT_CLASS = "text-destructive mt-2 px-1 text-sm";

export const PROMPT_FLOW_ALERT_IN_SCROLL_CLASS = "text-destructive mt-4 px-1 text-sm";

/** 헤더 + 스크롤 + `TwoButtonFooter` 수직 스택용 래퍼 */
export const PROMPT_FLOW_COLUMN_CLASS = "flex min-h-0 flex-1 flex-col overflow-hidden";
