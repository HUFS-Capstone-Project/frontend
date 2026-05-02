import {
  FLEX_DUAL_ACTION_SLOT_CLASS,
  FLEX_DUAL_PROMPT_FOOTER_ROW_CLASS,
} from "@/components/common/action-footer-layout";

/**
 * 링크 추가(입력) 화면을 기준으로 한 공통 레이아웃 클래스.
 * 동일 패턴: 스크롤 컬럼 → 제목 스택(space-y-1) → 본문(mt-6) → … → 하단 2열 CTA
 *
 * 고정 헤더 + 스크롤 리스트 + `TwoButtonFooter` 패턴은 `prompt-flow-layout` 참고.
 */

/** LinkAddFlowView 루트: `<main>` flex 안에서 전폭·가로 스트레치 단일 블록 (Fragment 회피) */
export const LINK_ADD_FLOW_ROOT_CLASS =
  "flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col items-stretch";

export const LINK_FLOW_PAGE_CLASS =
  "scrollbar-hide flex min-h-0 w-full max-w-full min-w-0 flex-1 flex-col self-stretch overflow-x-hidden overflow-y-auto px-6 pt-16 pb-8";

export const LINK_FLOW_HEADLINE_STACK_CLASS = "space-y-1";

export const LINK_FLOW_AFTER_HEADLINES_CLASS = "mt-6";

export const LINK_FLOW_DUAL_CTA_ROW_CLASS = FLEX_DUAL_PROMPT_FOOTER_ROW_CLASS;

export const LINK_FLOW_DUAL_CTA_SLOT_CLASS = FLEX_DUAL_ACTION_SLOT_CLASS;
