const LEGACY_STORAGE_KEY_PREFIX = "linkAddPendingUrl:";
const STORAGE_KEY_PREFIX = "linkAddPendingOriginalUrl:";

function storageKey(roomId: string, analysisRequestId: number): string {
  return `${STORAGE_KEY_PREFIX}${roomId}:${analysisRequestId}`;
}

function legacyStorageKey(roomId: string, analysisRequestId: number): string {
  return `${LEGACY_STORAGE_KEY_PREFIX}${roomId}:${analysisRequestId}`;
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
    const key = storageKey(roomId, analysisRequestId);
    const stored = sessionStorage.getItem(key);
    if (stored != null) {
      return stored;
    }

    return sessionStorage.getItem(legacyStorageKey(roomId, analysisRequestId)) ?? "";
  } catch {
    return "";
  }
}
