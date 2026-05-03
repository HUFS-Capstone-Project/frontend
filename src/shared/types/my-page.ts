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
  /** SNS·웹 등 원본 공유 링크 */
  shareLinkUrl?: string | null;
  memo?: string;
};
