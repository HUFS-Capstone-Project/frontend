import type { LinkSourceType } from "@/shared/lib/link-source-type";
import type { BusinessHoursDisplay } from "@/shared/types/business-hours";
import type { MapPrimaryCategory, PlaceAddedVia } from "@/shared/types/map-home";
import type { RoomPlaceMemo } from "@/shared/types/place-memo";

export type RecentPlace = {
  id: string;
  name: string;
};

export type SavedPlace = {
  id: string;
  roomPlaceId?: number | null;
  roomId?: string | null;
  roomName?: string | null;
  kakaoPlaceId?: string | null;
  name: string;
  address: string;
  /** 지도·필터와 동일한 1차 카테고리 코드 */
  category: MapPrimaryCategory;
  /** 화면 표시용 카테고리 이름 */
  categoryName?: string | null;
  /** 장소 taxonomy 태그 코드 */
  tagKeys?: string[];
  tagNames?: string[];
  latitude?: number;
  longitude?: number;
  /** SNS·웹 등 원본 공유 링크 */
  shareLinkUrl?: string | null;
  addedVia?: PlaceAddedVia | null;
  /** Link platform such as INSTAGRAM, NAVER_BLOG, YOUTUBE, or GENERIC_WEB. */
  linkSourceType?: LinkSourceType | null;
  memo?: string;
  memos?: RoomPlaceMemo[];
  businessHours?: BusinessHoursDisplay | null;
};
