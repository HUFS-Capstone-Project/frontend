import { MAP_INITIAL_CENTER } from "@/shared/mocks/place-mocks";
import type { MapCoordinate, SavedPlace as MapSavedPlace } from "@/shared/types/map-home";
import type { SavedPlace as MySavedPlace } from "@/shared/types/my-page";

type MapPin = Pick<MapSavedPlace, "id" | "latitude" | "longitude">;

/** API가 내려준 좌표가 있는 나의 장소만 지도 핀으로 사용 */
export function mapPlacesMatchingMySaved(places: MySavedPlace[]): MapSavedPlace[] {
  return places
    .filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude))
    .map((place) => ({
      id: place.id,
      roomPlaceId: place.roomPlaceId ?? null,
      kakaoPlaceId: place.kakaoPlaceId ?? null,
      name: place.name,
      category: place.category,
      categoryName: place.categoryName,
      tagKeys: place.tagKeys,
      latitude: place.latitude ?? 0,
      longitude: place.longitude ?? 0,
      address: place.address,
      shareLinkUrl: place.shareLinkUrl ?? null,
      memo: place.memo,
      businessHours: place.businessHours ?? null,
    }));
}

export function weightedMapCenter(mapPlaces: MapPin[]): MapCoordinate {
  if (mapPlaces.length === 0) return MAP_INITIAL_CENTER;
  let lat = 0;
  let lng = 0;
  for (const p of mapPlaces) {
    lat += p.latitude;
    lng += p.longitude;
  }
  const n = mapPlaces.length;
  return { latitude: lat / n, longitude: lng / n };
}
