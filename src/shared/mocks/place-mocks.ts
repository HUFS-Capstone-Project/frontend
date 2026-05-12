import type { BusinessHoursDisplay, WeeklyBusinessHour } from "@/shared/types/business-hours";
import type { MapCoordinate, SavedPlace } from "@/shared/types/map-home";

export const MAP_HOME_TITLE = "친구 1님과의 데이트 지도";
export const MAP_SEARCH_PLACEHOLDER = "저장해놓은 장소를 검색해보세요";

export const MAP_INITIAL_CENTER: MapCoordinate = {
  latitude: 37.5935,
  longitude: 127.0567,
};

const MOCK_TODAY_DAY = "화";
const MOCK_TODAY_DATE = "5/12";
const MOCK_WEEK_DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

type MockWeekDay = (typeof MOCK_WEEK_DAYS)[number];

function createMockWeeklyHours(
  displayTexts: Record<MockWeekDay, string>,
  subTextsByDay: Partial<Record<MockWeekDay, string[]>> = {},
): WeeklyBusinessHour[] {
  return MOCK_WEEK_DAYS.map((day) => ({
    day,
    date: day === MOCK_TODAY_DAY ? MOCK_TODAY_DATE : null,
    isToday: day === MOCK_TODAY_DAY,
    displayText: displayTexts[day],
    subTexts: subTextsByDay[day] ?? [],
  }));
}

function createMockBusinessHours({
  businessStatus = "CLOSED",
  statusDisplayText,
  todayDisplayText,
  weeklyHours,
}: {
  businessStatus?: string | null;
  statusDisplayText: string;
  todayDisplayText: string;
  weeklyHours: WeeklyBusinessHour[];
}): BusinessHoursDisplay {
  return {
    businessStatus,
    statusDisplayText,
    todayDisplayText,
    nextOpenAt: null,
    nextCloseAt: null,
    today: null,
    weeklyHours,
  };
}

export const SAVED_PLACE_MOCKS: SavedPlace[] = [
  // 음식점
  {
    id: "restaurant-1",
    name: "영화장",
    category: "음식점",
    tagKeys: ["음식점-중식"],
    latitude: 37.5973,
    longitude: 127.0606,
    address: "서울 동대문구 이문로 107",
    shareLinkUrl: "https://www.instagram.com/p/hufs_restaurant_1/",
    businessHours: createMockBusinessHours({
      statusDisplayText: "영업 종료 · 내일 11:30 영업 시작",
      todayDisplayText: "오늘 11:30 - 21:00",
      weeklyHours: createMockWeeklyHours({
        월: "휴무",
        화: "11:30 ~ 21:00",
        수: "11:30 ~ 21:00",
        목: "11:30 ~ 21:00",
        금: "11:30 ~ 21:00",
        토: "11:30 ~ 21:00",
        일: "11:30 ~ 21:00",
      }),
    }),
  },
  {
    id: "restaurant-2",
    name: "카츠이로하",
    category: "음식점",
    tagKeys: ["음식점-일식"],
    latitude: 37.5915,
    longitude: 127.0567,
    address: "서울 동대문구 회기로 173",
    shareLinkUrl: "https://www.instagram.com/p/hufs_restaurant_2/",
    businessHours: createMockBusinessHours({
      statusDisplayText: "영업 종료 · 내일 11:30 영업 시작",
      todayDisplayText: "오늘 11:30 - 21:00",
      weeklyHours: createMockWeeklyHours(
        {
          월: "11:30 ~ 21:00",
          화: "11:30 ~ 21:00",
          수: "11:30 ~ 21:00",
          목: "11:30 ~ 21:00",
          금: "11:30 ~ 21:00",
          토: "11:30 ~ 21:00",
          일: "11:30 ~ 20:30",
        },
        { 화: ["브레이크타임 있음"] },
      ),
    }),
  },
  {
    id: "restaurant-3",
    name: "79번지국수집",
    category: "음식점",
    tagKeys: ["음식점-한식"],
    latitude: 37.596,
    longitude: 127.062,
    address: "서울 동대문구 이문로 79",
    shareLinkUrl: "https://www.instagram.com/p/hufs_restaurant_3/",
    businessHours: createMockBusinessHours({
      statusDisplayText: "영업 종료 · 내일 10:00 영업 시작",
      todayDisplayText: "오늘 10:00 - 21:00",
      weeklyHours: createMockWeeklyHours({
        월: "10:00 ~ 21:00",
        화: "10:00 ~ 21:00",
        수: "10:00 ~ 21:00",
        목: "10:00 ~ 21:00",
        금: "10:00 ~ 21:00",
        토: "10:00 ~ 21:00",
        일: "10:00 ~ 21:00",
      }),
    }),
  },

  {
    id: "restaurant-4",
    name: "페어링테이블",
    category: "음식점",
    tagKeys: ["음식점-양식"],
    latitude: 35.8699,
    longitude: 128.5963,
    address: "대구 중구 동성로2길 4-3",
    shareLinkUrl: "https://www.instagram.com/p/hufs_restaurant_4/",
    businessHours: createMockBusinessHours({
      statusDisplayText: "영업 종료 · 내일 11:30 영업 시작",
      todayDisplayText: "오늘 11:30 - 21:30",
      weeklyHours: createMockWeeklyHours(
        {
          월: "11:30 ~ 21:30",
          화: "11:30 ~ 21:30",
          수: "11:30 ~ 21:30",
          목: "11:30 ~ 21:30",
          금: "11:30 ~ 22:00",
          토: "11:30 ~ 22:00",
          일: "11:30 ~ 21:00",
        },
        { 화: ["운영시간 변동 가능"] },
      ),
    }),
  },
  {
    id: "restaurant-5",
    name: "갓잇 대구수성못점",
    category: "음식점",
    tagKeys: ["음식점-양식"],
    latitude: 35.8279,
    longitude: 128.6175,
    address: "대구 수성구 수성못2길 15 1층",
    shareLinkUrl: "https://www.instagram.com/p/hufs_restaurant_5/",
    businessHours: createMockBusinessHours({
      statusDisplayText: "영업 종료 · 내일 11:00 영업 시작",
      todayDisplayText: "오늘 11:00 - 21:30",
      weeklyHours: createMockWeeklyHours({
        월: "11:00 ~ 21:30",
        화: "11:00 ~ 21:30",
        수: "11:00 ~ 21:30",
        목: "11:00 ~ 21:30",
        금: "11:00 ~ 21:30",
        토: "11:00 ~ 21:30",
        일: "11:00 ~ 21:30",
      }),
    }),
  },
  {
    id: "restaurant-6",
    name: "써브웨이 대구동성로점",
    category: "음식점",
    tagKeys: ["음식점-양식"],
    latitude: 35.8707,
    longitude: 128.5962,
    address: "대구광역시 중구 국채보상로 598",
    shareLinkUrl: "https://www.instagram.com/p/hufs_restaurant_6/",
    businessHours: createMockBusinessHours({
      statusDisplayText: "영업 종료 · 내일 08:00 영업 시작",
      todayDisplayText: "오늘 08:00 - 22:00",
      weeklyHours: createMockWeeklyHours(
        {
          월: "08:00 ~ 22:00",
          화: "08:00 ~ 22:00",
          수: "08:00 ~ 22:00",
          목: "08:00 ~ 22:00",
          금: "08:00 ~ 22:00",
          토: "09:00 ~ 21:00",
          일: "09:00 ~ 21:00",
        },
        { 화: ["운영시간 변동 가능"] },
      ),
    }),
  },
  {
    id: "restaurant-7",
    name: "써브웨이 송도센트럴파크점",
    category: "음식점",
    tagKeys: ["음식점-양식"],
    latitude: 37.3935,
    longitude: 126.639,
    address: "인천광역시 연수구 센트럴로 194",
    shareLinkUrl: "https://www.instagram.com/p/hufs_restaurant_7/",
    businessHours: createMockBusinessHours({
      statusDisplayText: "영업 종료 · 내일 08:00 영업 시작",
      todayDisplayText: "오늘 08:00 - 22:00",
      weeklyHours: createMockWeeklyHours({
        월: "08:00 ~ 22:00",
        화: "08:00 ~ 22:00",
        수: "08:00 ~ 22:00",
        목: "08:00 ~ 22:00",
        금: "08:00 ~ 22:00",
        토: "08:00 ~ 22:00",
        일: "08:00 ~ 22:00",
      }),
    }),
  },
  {
    id: "restaurant-8",
    name: "써브웨이 외대점",
    category: "음식점",
    tagKeys: ["음식점-양식"],
    latitude: 37.5969,
    longitude: 127.0609,
    address: "서울 동대문구 이문로 116",
    shareLinkUrl: "https://www.instagram.com/p/hufs_restaurant_8/",
    businessHours: createMockBusinessHours({
      statusDisplayText: "영업 종료 · 내일 08:30 영업 시작",
      todayDisplayText: "오늘 08:30 - 22:30",
      weeklyHours: createMockWeeklyHours(
        {
          월: "08:30 ~ 22:30",
          화: "08:30 ~ 22:30",
          수: "08:30 ~ 22:30",
          목: "08:30 ~ 22:30",
          금: "08:30 ~ 22:30",
          토: "09:00 ~ 21:00",
          일: "09:00 ~ 21:00",
        },
        { 화: ["운영시간 변동 가능"] },
      ),
    }),
  },

  // 카페
  {
    id: "cafe-1",
    name: "카페양귀비",
    category: "카페",
    tagKeys: ["카페-디저트"],
    latitude: 37.5948,
    longitude: 127.0607,
    address: "서울 동대문구 이문로 85",
    shareLinkUrl: "https://www.instagram.com/p/hufs_cafe_1/",
    businessHours: createMockBusinessHours({
      statusDisplayText: "영업 종료 · 내일 12:00 영업 시작",
      todayDisplayText: "오늘 12:00 - 21:00",
      weeklyHours: createMockWeeklyHours(
        {
          월: "12:00 ~ 21:00",
          화: "12:00 ~ 21:00",
          수: "12:00 ~ 21:00",
          목: "12:00 ~ 21:00",
          금: "12:00 ~ 22:00",
          토: "12:00 ~ 22:00",
          일: "12:00 ~ 20:00",
        },
        { 화: ["디저트 소진 시 마감"] },
      ),
    }),
  },
  {
    id: "cafe-2",
    name: "컴투레스트",
    category: "카페",
    tagKeys: ["카페-커피"],
    latitude: 37.5912,
    longitude: 127.057,
    address: "서울 동대문구 회기로 171",
    shareLinkUrl: "https://www.instagram.com/p/hufs_cafe_2/",
    businessHours: createMockBusinessHours({
      statusDisplayText: "오늘 휴무 · 내일 11:00 영업 시작",
      todayDisplayText: "오늘 휴무",
      weeklyHours: createMockWeeklyHours({
        월: "11:00 ~ 22:00",
        화: "휴무",
        수: "11:00 ~ 22:00",
        목: "11:00 ~ 22:00",
        금: "11:00 ~ 23:00",
        토: "12:00 ~ 23:00",
        일: "12:00 ~ 21:00",
      }),
    }),
  },
  {
    id: "cafe-3",
    name: "커피힐",
    category: "카페",
    tagKeys: ["카페-커피"],
    latitude: 37.5925,
    longitude: 127.0585,
    address: "서울 동대문구 회기로 165",
    shareLinkUrl: "https://www.instagram.com/p/hufs_cafe_3/",
    businessHours: createMockBusinessHours({
      statusDisplayText: "영업 종료 · 내일 10:00 영업 시작",
      todayDisplayText: "오늘 10:00 - 22:00",
      weeklyHours: createMockWeeklyHours({
        월: "10:00 ~ 22:00",
        화: "10:00 ~ 22:00",
        수: "10:00 ~ 22:00",
        목: "10:00 ~ 22:00",
        금: "10:00 ~ 23:00",
        토: "11:00 ~ 23:00",
        일: "11:00 ~ 21:00",
      }),
    }),
  },

  // 놀거리
  {
    id: "activity-1",
    name: "경희대학교 캠퍼스",
    category: "놀거리",
    tagKeys: ["놀거리-산책"],
    latitude: 37.5964,
    longitude: 127.0527,
    address: "서울 동대문구 경희대로 26",
    shareLinkUrl: "https://www.instagram.com/p/hufs_activity_1/",
    businessHours: createMockBusinessHours({
      businessStatus: "OPEN",
      statusDisplayText: "상시 개방",
      todayDisplayText: "오늘 00:00 - 23:59",
      weeklyHours: createMockWeeklyHours({
        월: "00:00 ~ 23:59",
        화: "00:00 ~ 23:59",
        수: "00:00 ~ 23:59",
        목: "00:00 ~ 23:59",
        금: "00:00 ~ 23:59",
        토: "00:00 ~ 23:59",
        일: "00:00 ~ 23:59",
      }),
    }),
  },
  {
    id: "activity-2",
    name: "홍릉수목원",
    category: "놀거리",
    tagKeys: ["놀거리-산책"],
    latitude: 37.5907,
    longitude: 127.0446,
    address: "서울 동대문구 회기로 57",
    shareLinkUrl: "https://www.instagram.com/p/hufs_activity_2/",
    businessHours: createMockBusinessHours({
      statusDisplayText: "영업 종료 · 내일 09:00 영업 시작",
      todayDisplayText: "오늘 09:00 - 18:00",
      weeklyHours: createMockWeeklyHours({
        월: "휴무",
        화: "09:00 ~ 18:00",
        수: "09:00 ~ 18:00",
        목: "09:00 ~ 18:00",
        금: "09:00 ~ 18:00",
        토: "09:00 ~ 17:00",
        일: "09:00 ~ 17:00",
      }),
    }),
  },
  {
    id: "activity-3",
    name: "회기 파전골목",
    category: "놀거리",
    tagKeys: ["놀거리-먹거리"],
    latitude: 37.5902,
    longitude: 127.0563,
    address: "서울 동대문구 회기로 190 일대",
    shareLinkUrl: "https://www.instagram.com/p/hufs_activity_3/",
    businessHours: createMockBusinessHours({
      statusDisplayText: "영업 종료 · 내일 17:00 영업 시작",
      todayDisplayText: "오늘 17:00 - 24:00",
      weeklyHours: createMockWeeklyHours(
        {
          월: "17:00 ~ 24:00",
          화: "17:00 ~ 24:00",
          수: "17:00 ~ 24:00",
          목: "17:00 ~ 24:00",
          금: "17:00 ~ 01:00",
          토: "17:00 ~ 01:00",
          일: "17:00 ~ 23:00",
        },
        { 화: ["매장별 상이"] },
      ),
    }),
  },
];

export const SAVED_PLACE_BY_ID = new Map(SAVED_PLACE_MOCKS.map((place) => [place.id, place]));
