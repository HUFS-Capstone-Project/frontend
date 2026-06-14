import type { MapCoordinate } from "@/shared/types/map-home";

export const MAP_INITIAL_CENTER: MapCoordinate = {
  latitude: 35.85,
  longitude: 127.65,
};

export const MAP_KOREA_BOUNDS: MapCoordinate[] = [
  { latitude: 33.1, longitude: 125.65 },
  { latitude: 38.1, longitude: 129.7 },
];

export const MAP_ANDROID_INITIAL_BOUNDS: MapCoordinate[] = [
  { latitude: 33.55, longitude: 126.0 },
  { latitude: 38.25, longitude: 129.45 },
];

export const MAP_SEARCH_PLACEHOLDER = "저장해놓은 장소를 검색해보세요";

/** 지도 pan/zoom idle 후 핀 API 재조회까지 대기(ms) */
export const MAP_BOUNDS_DEBOUNCE_MS = 350;
