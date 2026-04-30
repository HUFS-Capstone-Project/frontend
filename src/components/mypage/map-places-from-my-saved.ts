import { MAP_INITIAL_CENTER, SAVED_PLACE_MOCKS } from "@/pages/map/map-home-mock";
import type { MapCoordinate, SavedPlace as MapSavedPlace } from "@/shared/types/map-home";

import type { SavedPlace as MySavedPlace } from "./mypage-mock-data";

type MapPin = Pick<MapSavedPlace, "id" | "latitude" | "longitude">;

/** 나의 장소(id)와 지도 목 목데이터가 겹치는 항목만 핀으로 사용 */
export function mapPlacesMatchingMySaved(places: MySavedPlace[]): MapSavedPlace[] {
  const ids = new Set(places.map((p) => p.id));
  return SAVED_PLACE_MOCKS.filter((m) => ids.has(m.id));
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
