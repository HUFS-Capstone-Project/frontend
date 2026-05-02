import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import type { SavedPlace } from "@/shared/types/my-page";

const MEMO_BY_PLACE_ID: Partial<Record<string, string>> = {
  "cafe-2": "빵 나오는 시간 맞춰 가기",
  "activity-2": "주말에는 예약 확인",
};

export const savedPlaces: SavedPlace[] = SAVED_PLACE_MOCKS.map((place) => ({
  id: place.id,
  name: place.name,
  address: place.address,
  category: place.category,
  tagKeys: place.tagKeys,
  memo: MEMO_BY_PLACE_ID[place.id],
}));
