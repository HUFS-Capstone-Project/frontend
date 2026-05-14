import type { BusinessHoursDisplay } from "@/shared/types/business-hours";

export type MapPlaceCategory = string;
export type MapPrimaryCategory = string;
export type ServiceCategoryCode = "FOOD" | "CAFE" | "ACTIVITY";

export const MAP_ALL_CATEGORY_FILTER_CHIP = "전체" as const;
export type MapAllCategoryFilterChip = typeof MAP_ALL_CATEGORY_FILTER_CHIP;

/** 지도 상단 카테고리 칩(「전체」+ API 카테고리) */
export type MapCategoryFilterChip = MapAllCategoryFilterChip | MapPrimaryCategory;

export type SavedPlace = {
  id: string;
  roomPlaceId?: number | null;
  kakaoPlaceId?: string | null;
  candidateId?: number | null;
  name: string;
  /** 지도·필터에서 쓰는 카테고리 코드. 과거 목 데이터는 표시명을 그대로 담을 수 있다. */
  category: MapPlaceCategory;
  /** 화면 표시용 카테고리 이름. 없으면 `category`를 그대로 표시한다. */
  categoryName?: string | null;
  tagKeys?: string[];
  tagNames?: string[];
  latitude: number;
  longitude: number;
  address: string;
  /** SNS·웹 등 원본 공유 링크 */
  shareLinkUrl?: string | null;
  memo?: string;
  businessHours?: BusinessHoursDisplay | null;
  createdAt?: string | null;
};

export type RoomFriend = {
  id: string;
  userId: number;
  name: string;
  profileImageUrl?: string | null;
  me?: boolean;
};

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};
