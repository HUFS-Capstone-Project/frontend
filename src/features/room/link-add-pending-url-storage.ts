function storageKey(roomId: string, linkId: number): string {
  return `linkAddPendingUrl:${roomId}:${linkId}`;
}

export function setLinkAddPendingUrl(roomId: string, linkId: number, url: string): void {
  try {
    sessionStorage.setItem(storageKey(roomId, linkId), url);
  } catch {
    /* noop */
  }
}

export function peekLinkAddPendingUrl(roomId: string, linkId: number): string {
  try {
    return sessionStorage.getItem(storageKey(roomId, linkId)) ?? "";
  } catch {
    return "";
  }
}
