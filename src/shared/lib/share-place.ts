type ShareablePlace = {
  name: string;
  address: string;
  shareLinkUrl?: string | null;
};

export function buildPlaceShareText(place: ShareablePlace): string {
  return `${place.name}\n${place.address}`;
}

export function sharePlace(place: ShareablePlace): void {
  const text = buildPlaceShareText(place);
  const url = place.shareLinkUrl ?? undefined;

  if (typeof navigator.share === "function") {
    void navigator.share({ title: place.name, text, url }).catch(() => undefined);
    return;
  }

  void navigator.clipboard?.writeText(url ? `${text}\n${url}` : text).catch(() => undefined);
}
