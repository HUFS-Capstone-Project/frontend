import type { MockPlaceCandidate } from "@/features/room/link-add/types";

export function buildMockPlacesFromCaption(caption: string | null): MockPlaceCandidate[] {
  if (!caption || caption.trim().length === 0) {
    return getMockPlaces();
  }

  const seeds = caption
    .split(" ")
    .map((word) => word.trim())
    .filter((word) => word.length > 1)
    .slice(0, 3);

  if (seeds.length === 0) {
    return getMockPlaces();
  }

  return seeds.map((seed, index) => ({
    id: `mock-place-${index + 1}`,
    name: `${seed} 추천 장소 ${index + 1}`,
  }));
}

export function getMockPlaces(): MockPlaceCandidate[] {
  return [
    { id: "mock-place-1", name: "사사노하" },
    { id: "mock-place-2", name: "원할머니 보쌈" },
    { id: "mock-place-3", name: "승원" },
  ];
}

export async function confirmMockPlaceSelection(params: {
  placeId: string;
}): Promise<{ selectedPlaceId: string }> {
  await delay(220);

  return {
    selectedPlaceId: params.placeId,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
