import { SAVED_PLACE_MOCKS } from "@/pages/map/map-home-mock";
import type { MapPrimaryCategory } from "@/shared/types/map-home";

export type RecentPlace = {
  id: string;
  name: string;
};

export type SavedPlace = {
  id: string;
  name: string;
  address: string;
  /** 지도·필터와 동일한 1차 카테고리 코드 */
  category: MapPrimaryCategory;
  /** `SAVED_PLACE_MOCKS`와 같은 태그 코드 */
  tagKeys?: string[];
  memo?: string;
};

export type SavedCourse = {
  id: string;
  title: string;
  executedAtLabel: string;
  badgeLabel: string;
  stops: CourseStop[];
  /** 이 코스를 저장했을 때의 방 ID(API). 없으면 방 필터는 목록 데이터가 생길 때까지 전체 표시만 적용 */
  savedFromRoomId?: string | null;
};

export type CourseStop = {
  id: string;
  name: string;
  address: string;
  walkingTime?: string;
  hours?: string;
};

const MEMO_BY_PLACE_ID: Partial<Record<string, string>> = {
  "cafe-2": "빵 나오는 시간 맞춰 가기",
  "activity-2": "주말에는 예약 확인",
};

export const savedPlaces: SavedPlace[] = SAVED_PLACE_MOCKS.map((place) => ({
  id: place.id,
  name: place.name,
  address: place.address,
  category: place.category,
  tagKeys: place.tagKeys,
  memo: MEMO_BY_PLACE_ID[place.id],
}));

export const savedCourses: SavedCourse[] = [
  {
    id: "course-1",
    title: "외대앞 점심 코스",
    executedAtLabel: "2일 전 실행한 코스",
    badgeLabel: "친구",
    stops: [
      {
        id: "restaurant-1",
        name: "영화장",
        address: "서울 동대문구 이문로 107",
        walkingTime: "도보 4분",
        hours: "11:30 ~ 21:00",
      },
      {
        id: "cafe-1",
        name: "카페양귀비",
        address: "서울 동대문구 이문로 85",
        walkingTime: "도보 3분",
        hours: "12:00 ~ 21:00",
      },
      {
        id: "activity-1",
        name: "경희대학교 캠퍼스",
        address: "서울 동대문구 경희대로 26",
        walkingTime: "도보 12분",
        hours: "상시 개방",
      },
    ],
  },
  {
    id: "course-2",
    title: "회기역 저녁 코스",
    executedAtLabel: "7일 전 실행한 코스",
    badgeLabel: "하트",
    stops: [
      {
        id: "restaurant-3",
        name: "79번지국수집",
        address: "서울 동대문구 이문로 79",
        walkingTime: "도보 6분",
        hours: "10:00 ~ 21:00",
      },
      {
        id: "cafe-3",
        name: "커피힐",
        address: "서울 동대문구 회기로 165",
        walkingTime: "도보 5분",
        hours: "10:00 ~ 22:00",
      },
      {
        id: "activity-2",
        name: "홍릉수목원",
        address: "서울 동대문구 회기로 57",
        walkingTime: "도보 8분",
        hours: "09:00 ~ 18:00",
      },
    ],
  },
  {
    id: "course-3",
    title: "이문동 가벼운 데이트",
    executedAtLabel: "03.08 실행한 코스",
    badgeLabel: "하트",
    stops: [
      {
        id: "restaurant-2",
        name: "카츠이로하",
        address: "서울 동대문구 회기로 173",
        walkingTime: "도보 5분",
        hours: "11:30 ~ 21:00",
      },
      {
        id: "cafe-2",
        name: "컴투레스트",
        address: "서울 동대문구 회기로 171",
        walkingTime: "도보 4분",
        hours: "11:00 ~ 22:00",
      },
      {
        id: "activity-3",
        name: "회기 파전골목",
        address: "서울 동대문구 회기로 190 일대",
        walkingTime: "도보 3분",
        hours: "17:00 ~ 자정 전후",
      },
    ],
  },
];
