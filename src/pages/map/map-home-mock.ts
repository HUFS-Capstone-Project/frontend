import type {
  MapCategoryFilterChip,
  MapCoordinate,
  MapPrimaryCategory,
  SavedPlace,
} from "@/shared/types/map-home";

export const MAP_HOME_TITLE = "친구1 님과의 데이트 지도";
export const MAP_SEARCH_PLACEHOLDER = "저장해놓은 장소를 검색해보세요";

export const MAP_PRIMARY_CATEGORY_ITEMS: MapPrimaryCategory[] = ["맛집", "카페", "놀거리"];

export const MAP_CATEGORY_ITEMS: MapCategoryFilterChip[] = ["전체", ...MAP_PRIMARY_CATEGORY_ITEMS];

export const MAP_INITIAL_CENTER: MapCoordinate = {
  latitude: 37.59352,
  longitude: 127.06118,
};

export const SAVED_PLACE_MOCKS: SavedPlace[] = [
  {
    id: "place-1",
    name: "릴스 저장 맛집 - 경희대 파스타공방",
    category: "맛집",
    tagKeys: ["맛집-양식"],
    latitude: 37.59429,
    longitude: 127.05973,
    address: "서울 동대문구 회기로 157",
  },
  {
    id: "place-2",
    name: "릴스 저장 카페 - 휘경 브루잉랩",
    category: "카페",
    tagKeys: ["카페-제과-베이커리"],
    latitude: 37.5924,
    longitude: 127.06106,
    address: "서울 동대문구 망우로 32",
  },
  {
    id: "place-3",
    name: "릴스 저장 놀거리 - 회기 보드게임 라운지",
    category: "놀거리",
    tagKeys: ["놀거리-보드카페"],
    latitude: 37.59161,
    longitude: 127.06044,
    address: "서울 동대문구 이문로 96",
  },
  {
    id: "place-4",
    name: "릴스 저장 기타 - 산책 포토스팟",
    category: "기타",
    tagKeys: [],
    latitude: 37.59094,
    longitude: 127.06281,
    address: "서울 동대문구 휘경로 12",
  },
  {
    id: "place-5",
    name: "릴스 저장 맛집 - 이문동 스테이크 키친",
    category: "맛집",
    tagKeys: ["맛집-한식"],
    latitude: 37.59511,
    longitude: 127.06307,
    address: "서울 동대문구 이문로 121",
  },
  {
    id: "place-6",
    name: "릴스 저장 카페 - 우디 시나몬",
    category: "카페",
    tagKeys: ["카페-제과-베이커리"],
    latitude: 37.59457,
    longitude: 127.05786,
    address: "서울 동대문구 한천로 44",
  },
];
