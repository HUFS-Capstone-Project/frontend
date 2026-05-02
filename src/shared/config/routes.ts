export const APP_ROUTES = {
  root: "/",
  login: "/login",
  onboardingNickname: "/onboarding/nickname",
  onboardingTerms: "/onboarding/terms",
  room: "/room",
  map: "/map",
  list: "/list",
  course: "/course",
  mypage: "/mypage",
  editPlace: "/edit_place",
  reelsRegisterPlace: "/dev/register_place",
} as const;

/** 방 컨텍스트 장소·링크 추가 플로우 (리소스 중심 URL) */
export const ROOM_APP_PATHS = {
  placeSearch: (roomId: string) => `/rooms/${encodeURIComponent(roomId)}/places/search`,
  placeFromLink: (roomId: string) => `/rooms/${encodeURIComponent(roomId)}/places/from-link`,
  linkCandidates: (roomId: string, linkId: string | number) =>
    `/rooms/${encodeURIComponent(roomId)}/links/${encodeURIComponent(String(linkId))}/candidates`,
} as const;
