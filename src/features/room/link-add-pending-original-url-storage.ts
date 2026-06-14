const STORAGE_KEY_PREFIX = "linkAddPendingOriginalUrl:";

function storageKey(roomId: string, analysisRequestId: number): string {
  return `${STORAGE_KEY_PREFIX}${roomId}:${analysisRequestId}`;
}

export function setLinkAddPendingOriginalUrl(
  roomId: string,
  analysisRequestId: number,
  originalUrl: string,
): void {
  try {
    sessionStorage.setItem(storageKey(roomId, analysisRequestId), originalUrl);
  } catch {
    /* noop */
  }
}

export function peekLinkAddPendingOriginalUrl(roomId: string, analysisRequestId: number): string {
  try {
    return sessionStorage.getItem(storageKey(roomId, analysisRequestId)) ?? "";
  } catch {
    return "";
  }
}
