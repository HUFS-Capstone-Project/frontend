export type PlaceCategoryId = "all" | "food" | "cafe" | "activity" | "etc";

export type PlaceCategoryTab = {
  id: PlaceCategoryId;
  label: string;
};

export type PlaceListItemData = {
  id: string;
  name: string;
  address: string;
  region: string;
  category: Exclude<PlaceCategoryId, "all">;
  memo?: string;
  detailAddress: string;
  openingStatus: string;
  openingNote: string;
  hours: string;
};

export const PLACE_LIST_TEXT = {
  mapTitle: "심심한 두쭈구 지도",
  detailMapTitle: "나만의 지도",
  searchPlaceholder: "저장해둔 장소를 검색해보세요",
  regionDefault: "지역",
  regionConfirmDefault: "지역 설정하기",
  emptySaved: "장소를 저장해 보세요!",
  emptyFiltered: "해당하는 장소가 없습니다.",
  reelsButton: "내가 봤던 릴스 다시보기",
};

export const PLACE_CATEGORY_TABS: PlaceCategoryTab[] = [
  { id: "all", label: "전체" },
  { id: "food", label: "맛집" },
  { id: "cafe", label: "카페" },
  { id: "activity", label: "놀거리" },
  { id: "etc", label: "기타" },
];

export const REGION_CITIES = ["전체", "서울", "경기", "인천", "부산", "대구", "대전"];

export const REGION_DISTRICTS = [
  "전체",
  "강남구",
  "강동구",
  "강북구",
  "강서구",
  "관악구",
  "동대문구",
];

export const PLACE_LIST_ITEMS: PlaceListItemData[] = [
  {
    id: "gamdong",
    name: "감동",
    address: "서울 동대문구 회기로 25길 101-13 1층",
    region: "서울 동대문구",
    category: "cafe",
    memo: "커피 완전 맛있음 ✨✨",
    detailAddress: "회기로 25길 101-13 1층",
    openingStatus: "영업 전 10:40 오픈",
    openingNote: "공휴일 정상 영업",
    hours: "토(4/11) 10:40 ~ 19:30",
  },
  {
    id: "im-pie",
    name: "아임파이",
    address: "서울 동대문구 회기로 116-12층 (회기동)",
    region: "서울 동대문구",
    category: "food",
    detailAddress: "회기로 116-12층 (회기동)",
    openingStatus: "영업 전 10:40 오픈",
    openingNote: "공휴일 정상 영업",
    hours: "토(4/11) 10:40 ~ 19:30",
  },
  {
    id: "hufs",
    name: "한국외국어대학교 서울캠퍼스",
    address: "서울 동대문구 회기로 116-12층 (회기동)",
    region: "서울 동대문구",
    category: "etc",
    detailAddress: "이문로 107",
    openingStatus: "상시 이용 가능",
    openingNote: "캠퍼스 운영 시간은 시설별로 달라요",
    hours: "매일 00:00 ~ 24:00",
  },
  {
    id: "chabaekdo",
    name: "차백도 경희대점",
    address: "서울 동대문구 경희대로 8-1 1층",
    region: "서울 동대문구",
    category: "cafe",
    detailAddress: "경희대로 8-1 1층",
    openingStatus: "영업 중",
    openingNote: "테이크아웃 가능",
    hours: "매일 09:00 ~ 22:00",
  },
  {
    id: "spring-garden",
    name: "봄의정원 회기점",
    address: "서울 동대문구 경희대로길 35 봄의정원 회기점",
    region: "서울 동대문구",
    category: "activity",
    detailAddress: "경희대로길 35",
    openingStatus: "영업 중",
    openingNote: "예약 후 방문 추천",
    hours: "매일 11:00 ~ 21:00",
  },
  {
    id: "easy-white",
    name: "이지화이트 브런치",
    address: "서울 동대문구 이문로 120 상가동 1층 A120호",
    region: "서울 동대문구",
    category: "food",
    detailAddress: "이문로 120 1층",
    openingStatus: "영업 중",
    openingNote: "인기 메뉴 조기 품절 가능",
    hours: "매일 08:30 ~ 20:00",
  },
  {
    id: "unni",
    name: "언니네함바그",
    address: "서울 동대문구 회기로 5길 59 1층 언니네함바그",
    region: "서울 동대문구",
    category: "food",
    detailAddress: "회기로 5길 59 1층",
    openingStatus: "영업 중",
    openingNote: "점심 시간대 대기 가능",
    hours: "매일 11:30 ~ 21:00",
  },
];
