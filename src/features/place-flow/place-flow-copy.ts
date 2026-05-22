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
  instagramRateLimited: {
    title: "Instagram 분석이 일시적으로 제한됐어요",
  },
  unsupportedPlatformUrl: {
    title: "이 링크는 분석할 수 없어요",
    subtitle: "지원되는 링크를 다시 넣어 주세요",
    platforms: {
      instagram: "Instagram",
      naverBlog: "네이버 블로그",
      youtube: "YouTube",
    },
  },
  /** 링크 분석 후 수동 검색 유도(PlaceSearchMapSheet intro) */
  manualPlaceFallback: {
    subtitle: "해당 장소를 직접 검색해 주세요",
  },
  /** 인라인 콘텐츠 블록 섹션 라벨 */
  contentSectionLabel: "CONTENT",
  contentEmptyHint: "본문 정보가 없어요",
  saving: "저장 중...",
  save: "저장하기",
  pickPlaces: "장소 선택",
  noneToSave: "장소 없음",
  retry: "다시 시도",
  reenterLink: "다시 넣기",
  linkFromUrl: {
    titleLine1: "링크를 분석해",
    titleLine2: "저장할 장소를 찾아드릴게요",
    inputPlaceholder: "장소가 소개된 링크를 붙여넣어 주세요",
    /** 링크 분석 대기 중 안내 문구 */
    processingCarousel: [
      "링크 속 장소를 찾고 있어요",
      "본문을 꼼꼼히 읽어보는 중이에요",
      "어떤 장소들이 숨어 있는지 확인하고 있어요",
      "지도에서 실제 장소와 맞춰보고 있어요",
      "거의 다 찾았어요! 잠시만요...",
      "혹시 빠진 장소가 있어도 직접 검색해서 연결할 수 있어요",
      "휴! 정말 끝이 보여요...",
    ],
    /** 다음 문구까지 간격(ms). 매번 min~max 사이에서 무작위로 둬 리듬이 고정되지 않게 함 */
    processingCarouselDelayMs: { min: 1_500, max: 2_000 } as const,
  },
} as const;
