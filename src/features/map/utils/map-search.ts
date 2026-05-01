import type { MapCoordinate, SavedPlace } from "@/shared/types/map-home";

export type MapSearchSuggestion = {
  place: SavedPlace;
  matchType: "name" | "address";
};

const DEFAULT_SUGGESTION_LIMIT = 5;

const KNOWN_LOCATION_CENTERS: Array<{ keywords: string[]; center: MapCoordinate }> = [
  { keywords: ["서울", "서울시", "서울특별시"], center: { latitude: 37.5665, longitude: 126.978 } },
  { keywords: ["제주", "제주시"], center: { latitude: 33.4996, longitude: 126.5312 } },
  { keywords: ["대구", "대구시", "대구광역시"], center: { latitude: 35.8714, longitude: 128.6014 } },
  { keywords: ["광명", "광명시"], center: { latitude: 37.4785, longitude: 126.8646 } },
  { keywords: ["인천", "인천시", "인천광역시"], center: { latitude: 37.4563, longitude: 126.7052 } },
  { keywords: ["부산", "부산시", "부산광역시"], center: { latitude: 35.1796, longitude: 129.0756 } },
  { keywords: ["대전", "대전시", "대전광역시"], center: { latitude: 36.3504, longitude: 127.3845 } },
  { keywords: ["광주", "광주시", "광주광역시"], center: { latitude: 35.1595, longitude: 126.8526 } },
  { keywords: ["울산", "울산시", "울산광역시"], center: { latitude: 35.5384, longitude: 129.3114 } },
  { keywords: ["세종", "세종시"], center: { latitude: 36.4801, longitude: 127.289 } },
  { keywords: ["이문", "이문동"], center: { latitude: 37.5943, longitude: 127.0615 } },
  { keywords: ["회기", "회기동"], center: { latitude: 37.5919, longitude: 127.0555 } },
  { keywords: ["동대", "동대문", "동대문구"], center: { latitude: 37.5744, longitude: 127.0396 } },
  { keywords: ["소하", "소하동"], center: { latitude: 37.4484, longitude: 126.8835 } },
  { keywords: ["철산", "철산동"], center: { latitude: 37.476, longitude: 126.8679 } },
  { keywords: ["하안", "하안동"], center: { latitude: 37.461, longitude: 126.8784 } },
  { keywords: ["사당", "사당동"], center: { latitude: 37.4766, longitude: 126.9816 } },
  { keywords: ["연남", "연남동"], center: { latitude: 37.5627, longitude: 126.9217 } },
  { keywords: ["성수", "성수동"], center: { latitude: 37.5446, longitude: 127.0557 } },
  { keywords: ["한남", "한남동"], center: { latitude: 37.5345, longitude: 127.0062 } },
  { keywords: ["애월", "애월읍"], center: { latitude: 33.462, longitude: 126.31 } },
  { keywords: ["일직", "일직동"], center: { latitude: 37.421, longitude: 126.8846 } },
  { keywords: ["수성", "수성구", "수성못"], center: { latitude: 35.8273, longitude: 128.6163 } },
  { keywords: ["동성로"], center: { latitude: 35.8704, longitude: 128.5942 } },
  { keywords: ["송도", "송도동"], center: { latitude: 37.3925, longitude: 126.6415 } },
];

export function normalizeMapSearchText(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/특별자치시$/, "")
    .replace(/특별시$/, "")
    .replace(/광역시$/, "")
    .replace(/자치구$/, "");

  if (normalized.length >= 3) {
    return normalized.replace(/[시군구동읍면]$/, "");
  }

  return normalized;
}

function getKnownLocationCenter(keyword: string): MapCoordinate | null {
  const normalizedKeyword = normalizeMapSearchText(keyword);
  if (!normalizedKeyword) {
    return null;
  }

  const knownLocation = KNOWN_LOCATION_CENTERS.find(({ keywords }) =>
    keywords.some(
      (locationKeyword) => normalizeMapSearchText(locationKeyword) === normalizedKeyword,
    ),
  );

  return knownLocation?.center ?? null;
}

export function isMapLocationSearch(keyword: string): boolean {
  const trimmedKeyword = keyword.trim();
  if (!trimmedKeyword) {
    return false;
  }

  return Boolean(getKnownLocationCenter(trimmedKeyword)) || /[시군구동읍면]$/.test(trimmedKeyword);
}

export function includesMapSearchText(value: string, keyword: string): boolean {
  const normalizedKeyword = normalizeMapSearchText(keyword);
  if (!normalizedKeyword) {
    return true;
  }

  return normalizeMapSearchText(value).includes(normalizedKeyword);
}

function comparePlacesByKoreanName(a: SavedPlace, b: SavedPlace): number {
  const nameCompare = a.name.localeCompare(b.name, "ko-KR", { numeric: true });
  if (nameCompare !== 0) {
    return nameCompare;
  }

  return a.address.localeCompare(b.address, "ko-KR", { numeric: true });
}

function comparePlacesByNameMatch(keyword: string) {
  return (a: SavedPlace, b: SavedPlace): number => {
    const normalizedKeyword = normalizeMapSearchText(keyword);
    const aMatchIndex = normalizeMapSearchText(a.name).indexOf(normalizedKeyword);
    const bMatchIndex = normalizeMapSearchText(b.name).indexOf(normalizedKeyword);

    if (aMatchIndex !== bMatchIndex) {
      return aMatchIndex - bMatchIndex;
    }

    return comparePlacesByKoreanName(a, b);
  };
}

export function buildMapSearchSuggestions(
  places: SavedPlace[],
  keyword: string,
  limit = DEFAULT_SUGGESTION_LIMIT,
): MapSearchSuggestion[] {
  const normalizedKeyword = normalizeMapSearchText(keyword);
  if (!normalizedKeyword) {
    return [];
  }

  const nameMatches = places
    .filter((place) => includesMapSearchText(place.name, keyword))
    .sort(comparePlacesByNameMatch(keyword))
    .map((place) => ({ place, matchType: "name" as const }));

  const nameMatchIds = new Set(nameMatches.map(({ place }) => place.id));
  const addressMatches = places
    .filter((place) => !nameMatchIds.has(place.id) && includesMapSearchText(place.address, keyword))
    .sort(comparePlacesByKoreanName)
    .map((place) => ({ place, matchType: "address" as const }));

  return [...nameMatches, ...addressMatches].slice(0, limit);
}

export function findMapSearchMatchedPlaces(places: SavedPlace[], keyword: string): SavedPlace[] {
  const normalizedKeyword = normalizeMapSearchText(keyword);
  if (!normalizedKeyword) {
    return [];
  }

  const nameMatches = places
    .filter((place) => includesMapSearchText(place.name, keyword))
    .sort(comparePlacesByNameMatch(keyword));
  const nameMatchIds = new Set(nameMatches.map((place) => place.id));
  const addressMatches = places
    .filter((place) => !nameMatchIds.has(place.id) && includesMapSearchText(place.address, keyword))
    .sort(comparePlacesByKoreanName);

  return [...nameMatches, ...addressMatches];
}

export function findMapLocationMatchedPlaces(places: SavedPlace[], keyword: string): SavedPlace[] {
  const normalizedKeyword = normalizeMapSearchText(keyword);
  if (!normalizedKeyword) {
    return [];
  }

  return places
    .filter((place) => includesMapSearchText(place.address, keyword))
    .sort(comparePlacesByKoreanName);
}

export function findMapSearchCenter(
  places: SavedPlace[],
  keyword: string,
  fallbackCenter: MapCoordinate,
): MapCoordinate {
  const normalizedKeyword = normalizeMapSearchText(keyword);
  if (!normalizedKeyword) {
    return fallbackCenter;
  }

  const knownLocationCenter = getKnownLocationCenter(keyword);
  if (knownLocationCenter) {
    return knownLocationCenter;
  }

  const addressMatches = places.filter((place) => includesMapSearchText(place.address, keyword));
  if (addressMatches.length === 0) {
    return fallbackCenter;
  }

  const coordinateSum = addressMatches.reduce(
    (accumulator, place) => ({
      latitude: accumulator.latitude + place.latitude,
      longitude: accumulator.longitude + place.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: coordinateSum.latitude / addressMatches.length,
    longitude: coordinateSum.longitude / addressMatches.length,
  };
}
