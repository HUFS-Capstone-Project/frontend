import type { CourseOption, CourseStop, SavedCourse } from "@/shared/types/course";

export const COURSE_OPTIONS: CourseOption[] = [
  { id: "course-1", title: "코스 1", description: "균형 있게 구성된 코스" },
  { id: "course-2", title: "코스 2", description: "릴스 좋아요 순으로 구성된 인기 코스" },
  { id: "course-3", title: "코스 3", description: "최근 등록된 장소로 구성된 코스" },
];

const COURSE_STOPS_BY_COURSE_ID: Record<string, CourseStop[]> = {
  "course-1": [
    {
      id: "course-1-stop-1",
      placeId: "restaurant-1",
      name: "영화장",
      address: "서울 동대문구 이문로 107",
      category: "맛집",
      walkingTime: "도보 4분",
      hours: "11:30 ~ 21:00",
    },
    {
      id: "course-1-stop-2",
      placeId: "cafe-1",
      name: "카페양귀비",
      address: "서울 동대문구 이문로 85",
      category: "카페",
      walkingTime: "도보 3분",
      hours: "12:00 ~ 21:00",
    },
    {
      id: "course-1-stop-3",
      placeId: "activity-1",
      name: "경희대학교 캠퍼스",
      address: "서울 동대문구 경희대로 26",
      category: "놀거리",
      walkingTime: "도보 12분",
      hours: "상시 개방",
    },
  ],
  "course-2": [
    {
      id: "course-2-stop-1",
      placeId: "restaurant-3",
      name: "79번지국수집",
      address: "서울 동대문구 이문로 79",
      category: "맛집",
      walkingTime: "도보 6분",
      hours: "10:00 ~ 21:00",
    },
    {
      id: "course-2-stop-2",
      placeId: "cafe-3",
      name: "커피힐",
      address: "서울 동대문구 회기로 165",
      category: "카페",
      walkingTime: "도보 5분",
      hours: "10:00 ~ 22:00",
    },
    {
      id: "course-2-stop-3",
      placeId: "activity-2",
      name: "홍릉수목원",
      address: "서울 동대문구 회기로 57",
      category: "놀거리",
      walkingTime: "도보 8분",
      hours: "09:00 ~ 18:00",
    },
  ],
  "course-3": [
    {
      id: "course-3-stop-1",
      placeId: "restaurant-2",
      name: "카츠이로하",
      address: "서울 동대문구 회기로 173",
      category: "맛집",
      walkingTime: "도보 5분",
      hours: "11:30 ~ 21:00",
    },
    {
      id: "course-3-stop-2",
      placeId: "cafe-2",
      name: "컴투레스트",
      address: "서울 동대문구 회기로 171",
      category: "카페",
      walkingTime: "도보 4분",
      hours: "11:00 ~ 22:00",
    },
    {
      id: "course-3-stop-3",
      placeId: "activity-3",
      name: "회기 파전골목",
      address: "서울 동대문구 회기로 190 일대",
      category: "놀거리",
      walkingTime: "도보 3분",
      hours: "17:00 ~ 자정 전후",
    },
  ],
};

export function getCourseStopsMock(courseId: string): CourseStop[] {
  return COURSE_STOPS_BY_COURSE_ID[courseId] ?? COURSE_STOPS_BY_COURSE_ID["course-1"];
}

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
