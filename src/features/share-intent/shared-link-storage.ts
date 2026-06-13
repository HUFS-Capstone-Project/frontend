const SHARED_LINK_URL_KEY = "udidura-shared-link-url";

export function setPendingSharedLinkUrl(url: string): void {
  sessionStorage.setItem(SHARED_LINK_URL_KEY, url);
}

export function peekPendingSharedLinkUrl(): string | null {
  return sessionStorage.getItem(SHARED_LINK_URL_KEY);
}

export function takePendingSharedLinkUrl(): string | null {
  const url = peekPendingSharedLinkUrl();
  sessionStorage.removeItem(SHARED_LINK_URL_KEY);
  return url;
}

export function clearPendingSharedLinkUrl(): void {
  sessionStorage.removeItem(SHARED_LINK_URL_KEY);
}

export function extractFirstHttpUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s<>"']+/i);
  if (!match) return null;

  return match[0].replace(/[),.;\]]+$/g, "");
}

