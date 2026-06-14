import { shareWithNativeFallback } from "@/shared/lib/native-share";

type ShareablePlace = {
  name: string;
  address: string;
  shareLinkUrl?: string | null;
};

export function buildPlaceShareText(place: ShareablePlace): string {
  return `${place.name}\n${place.address}`;
}

export async function sharePlace(place: ShareablePlace): Promise<void> {
  const text = buildPlaceShareText(place);
  const url = place.shareLinkUrl?.trim() || undefined;

  await shareWithNativeFallback({
    title: place.name,
    text,
    url,
    dialogTitle: "장소 공유",
  });
}
