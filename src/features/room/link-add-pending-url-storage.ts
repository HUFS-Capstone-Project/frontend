function storageKey(roomId: string, analysisRequestId: number): string {
  return `linkAddPendingUrl:${roomId}:${analysisRequestId}`;
}

export function setLinkAddPendingUrl(roomId: string, analysisRequestId: number, url: string): void {
  try {
    sessionStorage.setItem(storageKey(roomId, analysisRequestId), url);
  } catch {
    /* noop */
  }
}

export function peekLinkAddPendingUrl(roomId: string, analysisRequestId: number): string {
  try {
    return sessionStorage.getItem(storageKey(roomId, analysisRequestId)) ?? "";
  } catch {
    return "";
  }
}
