export const APP_ROUTES = {
  root: "/",
  login: "/login",
  onboardingNickname: "/onboarding/nickname",
  onboardingTerms: "/onboarding/terms",
  room: "/rooms",
  map: "/places/map",
  list: "/places",
  course: "/courses",
  mypage: "/me",
  editPlace: "/places/edit",
  /** 공개 개인정보처리방침 */
  privacyPolicy: "/privacys",
  /** 공개 서비스 이용약관 */
  termsOfService: "/terms",
} as const;

/** 방 컨텍스트 장소·링크 추가 플로우 (리소스 중심 URL) */
export const ROOM_APP_PATHS = {
  places: (roomId: string) => `/rooms/${encodeURIComponent(roomId)}/places`,
  placeSearch: (roomId: string) => `/rooms/${encodeURIComponent(roomId)}/places/search`,
  placeFromLink: (roomId: string) => `/rooms/${encodeURIComponent(roomId)}/places/from-link`,
  linkCandidates: (roomId: string, analysisRequestId: string | number) =>
    `/rooms/${encodeURIComponent(roomId)}/link-analysis/${encodeURIComponent(
      String(analysisRequestId),
    )}`,
} as const;
