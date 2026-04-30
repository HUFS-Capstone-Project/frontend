export type SavedPlaceCategory = "food" | "cafe" | "activity" | "etc";

export type RecentPlace = {
  id: string;
  name: string;
};

export type SavedPlace = {
  id: string;
  name: string;
  address: string;
  category: SavedPlaceCategory;
  memo?: string;
};

export type SavedCourse = {
  id: string;
  title: string;
  executedAtLabel: string;
  badgeLabel: string;
  stops: CourseStop[];
};

export type CourseStop = {
  id: string;
  name: string;
  address: string;
  walkingTime?: string;
  hours?: string;
};

export const myPageUser = {
  nickname: "홍길동",
  savedPlaceCount: 58,
  recentPlaces: [
    { id: "place-recent-1", name: "아임파이" },
    { id: "place-recent-2", name: "투썸플레이스" },
  ],
};

export const savedPlaces: SavedPlace[] = [
  {
    id: "place-1",
    name: "아임파이",
    address: "서울 동대문구 회기로 116-1 2층 (회기동)",
    category: "cafe",
  },
  {
    id: "place-2",
    name: "감동",
    address: "서울 동대문구 회기로 25길 101-13 1층",
    category: "food",
    memo: "커피 완전 맛있음 ★★★",
  },
  {
    id: "place-3",
    name: "한국외국어대학교 서울캠퍼스",
    address: "서울 동대문구 회기로 116-1 2층 (회기동)",
    category: "etc",
  },
  {
    id: "place-4",
    name: "언니네함박그",
    address: "서울 동대문구 회기로25길 59 1층 언니네함박그",
    category: "food",
  },
  {
    id: "place-5",
    name: "무감커피바",
    address: "서울 동대문구 회기로21길 19 지하1층",
    category: "cafe",
  },
  {
    id: "place-6",
    name: "호현장담 외대후문점",
    address: "서울 동대문구 천장산로7길 10-1 2층 호현장담",
    category: "activity",
  },
];

export const savedCourses: SavedCourse[] = [
  {
    id: "course-1",
    title: "서울 동대문구 0408",
    executedAtLabel: "2일 전 실행한 코스",
    badgeLabel: "친구",
    stops: [
      {
        id: "stop-1",
        name: "한국외국어대학교 서울캠퍼스",
        address: "서울 동대문구 이문로 107",
        walkingTime: "도보 10분",
      },
      {
        id: "stop-2",
        name: "감동",
        address: "회기로 25길 101-13 1층",
        walkingTime: "도보 10분",
      },
      {
        id: "stop-3",
        name: "샤로스톤 외대점",
        address: "회기로 27",
      },
    ],
  },
  {
    id: "course-2",
    title: "망원동 벚꽃데이트 코스",
    executedAtLabel: "7일 전 실행한 코스",
    badgeLabel: "하트",
    stops: [
      {
        id: "stop-4",
        name: "망원시장",
        address: "서울 마포구 포은로8길 14",
        walkingTime: "도보 8분",
      },
      {
        id: "stop-5",
        name: "망원한강공원",
        address: "서울 마포구 마포나루길 467",
      },
    ],
  },
  {
    id: "course-3",
    title: "간만에 휴가 데이트",
    executedAtLabel: "03.08 실행한 코스",
    badgeLabel: "하트",
    stops: [
      {
        id: "stop-6",
        name: "연남동 산책길",
        address: "서울 마포구 연남동",
        walkingTime: "도보 12분",
      },
      {
        id: "stop-7",
        name: "작은 카페",
        address: "서울 마포구 동교로 41길",
      },
    ],
  },
  {
    id: "course-4",
    title: "간만에 휴가 데이트",
    executedAtLabel: "03.08 실행한 코스",
    badgeLabel: "하트",
    stops: [{ id: "stop-8", name: "성수 카페거리", address: "서울 성동구 성수동" }],
  },
  {
    id: "course-5",
    title: "간만에 휴가 데이트",
    executedAtLabel: "03.08 실행한 코스",
    badgeLabel: "하트",
    stops: [{ id: "stop-9", name: "서울숲", address: "서울 성동구 뚝섬로 273" }],
  },
  {
    id: "course-6",
    title: "간만에 휴가 데이트",
    executedAtLabel: "03.08 실행한 코스",
    badgeLabel: "하트",
    stops: [{ id: "stop-10", name: "뚝섬 한강공원", address: "서울 광진구 강변북로 139" }],
  },
  {
    id: "course-7",
    title: "간만에 휴가 데이트",
    executedAtLabel: "03.08 실행한 코스",
    badgeLabel: "하트",
    stops: [{ id: "stop-11", name: "압구정 로데오", address: "서울 강남구 압구정로" }],
  },
];
