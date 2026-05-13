import type { BusinessHoursDisplay } from "@/shared/types/business-hours";

export type MapPlaceCategory = string;
export type MapPrimaryCategory = string;

export const MAP_ALL_CATEGORY_FILTER_CHIP = "전체" as const;
export type MapAllCategoryFilterChip = typeof MAP_ALL_CATEGORY_FILTER_CHIP;

/** 지도 상단 카테고리 칩(「전체」+ API 카테고리) */
export type MapCategoryFilterChip = MapAllCategoryFilterChip | MapPrimaryCategory;

export type SavedPlace = {
  id: string;
  name: string;
  category: MapPlaceCategory;
  tagKeys?: string[];
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
