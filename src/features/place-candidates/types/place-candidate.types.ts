import type { ServiceCategoryCode } from "@/shared/types/map-home";

export type PlaceCandidateDisabledReason = "ALREADY_IN_ROOM" | "MISSING_KAKAO_PLACE_ID";

export type PlaceCandidateDto = {
  kakaoPlaceId: string | null;
  name: string;
  address: string | null;
  roadAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  categoryName: string | null;
  categoryGroupCode: string | null;
  serviceCategoryCode: ServiceCategoryCode;
  serviceCategoryName: string;
  phone: string | null;
  placeUrl: string | null;
  source: string;
  alreadyInRoom: boolean;
  roomPlaceId: number | null;
  selectable: boolean;
  disabledReason: PlaceCandidateDisabledReason | null;
};

export type PlaceCandidate = PlaceCandidateDto;

export type PlaceCandidateParams = {
  keyword: string;
  region?: string;
  /** Kakao API 검색 필터용. 백엔드 query param은 `categoryGroupCode`로 보낸다. */
  kakaoCategoryGroupCode?: string;
  page?: number;
  limit?: number;
};

export type PlaceCandidateSearchResponse = {
  items: PlaceCandidate[];
  page: number;
  limit: number;
  hasNext: boolean;
  nextPage: number | null;
  totalCount: number;
  pageableCount: number;
};
