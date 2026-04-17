/** 지도 필터 UI에 쓰이는 고정 문구 (접근성 레이블과 함께 사용) */
export const MAP_FILTER_LABELS = {
  collapsePanel: "접기",
  /** 패널 헤더 접기 버튼 보조 이름 */
  collapsePanelDetail: "태그 필터 접기",
  resetFocusedTags: "초기화",
  /** 초기화 버튼 스크린리더용 (보이는 텍스트는 `resetFocusedTags`) */
  resetFocusedTagsAria: "현재 카테고리에서 선택한 태그 모두 해제",
} as const;

export function mapTagFilterRegionAriaLabel(categoryTitle: string): string {
  return `${categoryTitle} 상세 태그 필터`;
}
