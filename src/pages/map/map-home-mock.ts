import type { MapCoordinate, SavedPlace } from "@/shared/types/map-home";

export const MAP_HOME_TITLE = "친구 1님과의 데이트 지도";
export const MAP_SEARCH_PLACEHOLDER = "저장해놓은 장소를 검색해보세요";

export const MAP_INITIAL_CENTER: MapCoordinate = {
  latitude: 37.59352,
  longitude: 127.06118,
};

export const SAVED_PLACE_MOCKS: SavedPlace[] = [
  {
    id: "place-1",
    name: "경희대 파스타공방",
    category: "맛집",
    tagKeys: ["맛집-양식"],
    latitude: 37.59429,
    longitude: 127.05973,
    address: "서울 동대문구 회기로 157",
    reelsUrl: "https://www.instagram.com/reel/example-place-1",
    businessHours: {
      holidayNotice: "공휴일 정상 영업",
      weeklySchedule: [
        { dayOfWeek: 1, openTime: "10:40", closeTime: "19:30" },
        { dayOfWeek: 2, openTime: "10:40", closeTime: "19:30" },
        { dayOfWeek: 3, openTime: "10:40", closeTime: "19:30" },
        { dayOfWeek: 4, openTime: "10:40", closeTime: "19:30" },
        { dayOfWeek: 5, openTime: "10:40", closeTime: "20:30" },
        { dayOfWeek: 6, openTime: "11:00", closeTime: "20:00" },
        { dayOfWeek: 0, openTime: "11:00", closeTime: "18:00" },
      ],
    },
  },
  {
    id: "place-2",
    name: "휘경 부루잉랩",
    category: "카페",
    tagKeys: ["카페-제과-베이커리"],
    latitude: 37.5924,
    longitude: 127.06106,
    address: "서울 동대문구 망우로 32",
    reelsUrl: null,
    businessHours: {
      holidayNotice: "라스트 오더 20:30",
      weeklySchedule: [
        { dayOfWeek: 1, openTime: "11:00", closeTime: "21:00" },
        { dayOfWeek: 2, openTime: "11:00", closeTime: "21:00" },
        { dayOfWeek: 3, openTime: "11:00", closeTime: "21:00" },
        { dayOfWeek: 4, openTime: "11:00", closeTime: "21:00" },
        { dayOfWeek: 5, openTime: "11:00", closeTime: "22:00" },
        { dayOfWeek: 6, openTime: "12:00", closeTime: "22:00" },
        { dayOfWeek: 0, openTime: "12:00", closeTime: "20:00" },
      ],
    },
  },
  {
    id: "place-3",
    name: "회기 보드게임 라운지",
    category: "놀거리",
    tagKeys: ["놀거리-보드카페"],
    latitude: 37.59161,
    longitude: 127.06044,
    address: "서울 동대문구 이문로 96",
    reelsUrl: "https://www.instagram.com/reel/example-place-3",
    businessHours: {
      holidayNotice: "입장 마감 18:30",
      weeklySchedule: [
        { dayOfWeek: 1, openTime: "10:00", closeTime: "19:00" },
        { dayOfWeek: 2, openTime: "10:00", closeTime: "19:00" },
        { dayOfWeek: 3, openTime: "10:00", closeTime: "19:00" },
        { dayOfWeek: 4, openTime: "10:00", closeTime: "19:00" },
        { dayOfWeek: 5, openTime: "10:00", closeTime: "20:00" },
        { dayOfWeek: 6, openTime: "11:00", closeTime: "20:00" },
        { dayOfWeek: 0, openTime: null, closeTime: null },
      ],
    },
  },
  {
    id: "place-4",
    name: "산책 포토스팟",
    category: "기타",
    tagKeys: [],
    latitude: 37.59094,
    longitude: 127.06281,
    address: "서울 동대문구 휘경로 12",
    reelsUrl: null,
    businessHours: null,
  },
  {
    id: "place-5",
    name: "이문동 스테이크 키친",
    category: "맛집",
    tagKeys: ["맛집-한식"],
    latitude: 37.59511,
    longitude: 127.06307,
    address: "서울 동대문구 이문로 121",
    reelsUrl: null,
    businessHours: {
      holidayNotice: "브레이크 타임 15:00 ~ 17:00",
      weeklySchedule: [
        { dayOfWeek: 1, openTime: "11:30", closeTime: "22:00" },
        { dayOfWeek: 2, openTime: "11:30", closeTime: "22:00" },
        { dayOfWeek: 3, openTime: "11:30", closeTime: "22:00" },
        { dayOfWeek: 4, openTime: "11:30", closeTime: "22:00" },
        { dayOfWeek: 5, openTime: "11:30", closeTime: "23:00" },
        { dayOfWeek: 6, openTime: "12:00", closeTime: "23:00" },
        { dayOfWeek: 0, openTime: "12:00", closeTime: "21:00" },
      ],
    },
  },
  {
    id: "place-6",
    name: "우디 시나몬",
    category: "카페",
    tagKeys: ["카페-제과-베이커리"],
    latitude: 37.59457,
    longitude: 127.05786,
    address: "서울 동대문구 한천로 44",
    reelsUrl: "https://www.instagram.com/reel/example-place-6",
    businessHours: {
      holidayNotice: "매주 화요일 휴무",
      weeklySchedule: [
        { dayOfWeek: 1, openTime: "09:00", closeTime: "20:00" },
        { dayOfWeek: 2, openTime: null, closeTime: null },
        { dayOfWeek: 3, openTime: "09:00", closeTime: "20:00" },
        { dayOfWeek: 4, openTime: "09:00", closeTime: "20:00" },
        { dayOfWeek: 5, openTime: "09:00", closeTime: "21:00" },
        { dayOfWeek: 6, openTime: "10:00", closeTime: "21:00" },
        { dayOfWeek: 0, openTime: "10:00", closeTime: "19:00" },
      ],
    },
  },
];
