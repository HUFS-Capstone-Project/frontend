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
  businessHours?: PlaceBusinessHours | ResolvedPlaceBusinessHours | null;
};

export type ResolvedSavedPlace = Omit<SavedPlace, "businessHours"> & {
  businessHours?: ResolvedPlaceBusinessHours | null;
};

export type PlaceBusinessHourRow = {
  label: string;
  hours: string;
  isToday?: boolean;
};

export type PlaceBusinessHours = {
  holidayNotice?: string | null;
  weeklySchedule: PlaceBusinessScheduleRow[];
  closingSoonMinutes?: number;
};

export type ResolvedPlaceBusinessHours = {
  status: string;
  openTime?: string | null;
  holidayNotice?: string | null;
  weeklyHours: PlaceBusinessHourRow[];
};

export type PlaceBusinessScheduleRow = {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  openTime: string | null;
  closeTime: string | null;
};

export type RoomFriend = {
  id: string;
  name: string;
};

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};
