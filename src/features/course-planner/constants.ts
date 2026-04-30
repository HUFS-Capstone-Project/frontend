export type CoursePlannerMode = "form" | "region" | "datetime" | "loading" | "result" | "detail";

export const COURSE_DEFAULT_REGION = {
  city: "서울",
  district: "동대문구",
  allDistrict: "전체",
} as const;

export const COURSE_REGION_CITIES = ["서울", "경기", "인천", "부산", "대구", "대전"] as const;

export const COURSE_DISTRICTS_BY_CITY: Record<string, string[]> = {
  서울: ["전체", "강남구", "강동구", "강북구", "강서구", "관악구", "동대문구"],
  경기: ["전체", "성남시", "수원시", "고양시", "용인시", "하남시"],
  인천: ["전체", "남동구", "연수구", "부평구", "서구", "중구"],
  부산: ["전체", "해운대구", "수영구", "부산진구", "동래구", "남구"],
  대구: ["전체", "중구", "동구", "서구", "수성구", "달서구"],
  대전: ["전체", "서구", "유성구", "중구", "동구", "대덕구"],
};

export const COURSE_GENERATION_DELAY_MS = 900;
export const COURSE_TOAST_DURATION_MS = 3200;
export const COURSE_FALLBACK_TITLE = "코스 1";
export const COURSE_DEV_MAP_TITLE = "데이트 지도";
export const COURSE_LOADING_ROOM_FALLBACK = "방";

export const COURSE_TOAST_TEXT = {
  generated: "데이트 코스가 완성되었습니다",
  saved: "코스가 저장되었습니다",
} as const;
