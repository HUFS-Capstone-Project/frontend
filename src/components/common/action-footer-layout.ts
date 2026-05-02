/**
 * flex 행에서 2열 pill CTA를 균등·전폭으로 잡을 때 사용.
 * `flex-1`만 쓰면 자식 `min-width:auto` 때문에 슬롯이 콘텐츠 폭으로 줄어드는 경우가 있어 `w-0`을 같이 둔다.
 */
export const FLEX_DUAL_ACTION_ROW_CLASS = "flex w-full min-w-0 gap-2.5";

export const FLEX_DUAL_ACTION_SLOT_CLASS =
  "flex w-0 min-w-0 flex-1 [&>button]:w-full [&>button]:min-w-0";

/** 풀스크린/스크롤 컬럼 하단: 본문과 버튼 사이 간격 */
export const FLEX_DUAL_PROMPT_FOOTER_ROW_CLASS = `${FLEX_DUAL_ACTION_ROW_CLASS} mt-auto pt-6`;
