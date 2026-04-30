import type { MockPlaceCandidate } from "@/features/room/link-add/types";
import { SAVED_PLACE_MOCKS } from "@/pages/map/map-home-mock";

export function buildMockPlacesFromCaption(caption: string | null): MockPlaceCandidate[] {
  const captionTokens =
    caption
      ?.toLowerCase()
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 1) ?? [];

  if (captionTokens.length === 0) {
    return getMockPlaces();
  }

  const matchedPlaces = SAVED_PLACE_MOCKS.filter((place) =>
    captionTokens.some((token) =>
      `${place.name} ${place.address} ${place.category}`.toLowerCase().includes(token),
    ),
  );

  return toMockPlaceCandidates(matchedPlaces.length > 0 ? matchedPlaces : SAVED_PLACE_MOCKS);
}

export function getMockPlaces(): MockPlaceCandidate[] {
  return toMockPlaceCandidates(SAVED_PLACE_MOCKS);
}

export async function confirmMockPlaceSelection(params: {
  placeId: string;
}): Promise<{ selectedPlaceId: string }> {
  await delay(220);

  return {
    selectedPlaceId: params.placeId,
  };
}

function toMockPlaceCandidates(
  places: Pick<(typeof SAVED_PLACE_MOCKS)[number], "id" | "name">[],
): MockPlaceCandidate[] {
  return places.map((place) => ({
    id: place.id,
    name: place.name,
  }));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
