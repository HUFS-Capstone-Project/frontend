/** 장소 선택·검색 플로우 공통 카피 */
export const PLACE_FLOW_COPY = {
  selectFromCandidates: {
    title: "장소를 찾았어요!",
    subtitle: "방에 저장할 장소를 선택해 주세요",
  },
  searchToCorrect: {
    title: "장소가 맞지 않나요?",
    subtitle: "정확한 장소를 검색해 주세요",
  },
  searchPlaceholder: "장소명 또는 주소 검색",
  searchButton: "검색",
  emptySearchTitle: "검색 결과가 없어요",
  emptySearchHint: "장소명이나 주소를 다시 입력해 주세요",
  cancel: "취소",
  applyChange: "변경하기",
  notFoundTitle: "장소를 찾지 못했어요",
  notFoundHint: "원하는 장소를 직접 검색해 주세요",
  saving: "저장 중...",
  save: "저장하기",
  pickPlaces: "장소 선택",
  noneToSave: "장소 없음",
  retry: "다시 시도",
  linkFromUrl: {
    titleLine1: "링크를 분석해",
    titleLine2: "저장할 장소를 찾아드릴게요",
    inputPlaceholder: "예: https://www.instagram.com/p/...",
    /** 링크 분석 대기 중 안내 문구 */
    processingCarousel: [
      "링크 속 장소를 찾고 있어요",
      "캡션을 꼼꼼히 읽어보는 중이에요",
      "어떤 장소들이 숨어 있는지 확인하고 있어요",
      "지도에서 실제 장소와 맞춰보고 있어요",
      "거의 다 찾았어요! 잠시만요...",
      "정말 끝이 보여요...",
    ],
    /** 다음 문구까지 간격(ms). 매번 min~max 사이에서 무작위로 둬 리듬이 고정되지 않게 함 */
    processingCarouselDelayMs: { min: 1_500, max: 2_000 } as const,
  },
} as const;
