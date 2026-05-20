export const LINK_SOURCE_TYPES = ["INSTAGRAM", "NAVER_BLOG", "GENERIC_WEB"] as const;

export type LinkSourceType = (typeof LINK_SOURCE_TYPES)[number];

export function normalizeLinkSourceType(value: string | null | undefined): LinkSourceType | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  if ((LINK_SOURCE_TYPES as readonly string[]).includes(normalized)) {
    return normalized as LinkSourceType;
  }

  return null;
}

/** API sourceType이 없을 때 sourceUrl 호스트로 추론 */
export function inferLinkSourceTypeFromUrl(url: string): LinkSourceType {
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return "GENERIC_WEB";
  }

  try {
    const host = new URL(trimmed).hostname.toLowerCase();

    if (host.includes("instagram.com") || host === "instagr.am") {
      return "INSTAGRAM";
    }

    if (host.includes("naver.com") || host.includes("naver.me")) {
      return "NAVER_BLOG";
    }
  } catch {
    // fall through
  }

  return "GENERIC_WEB";
}

export function resolveLinkSourceType(
  sourceType: string | null | undefined,
  sourceUrl: string,
): LinkSourceType {
  return normalizeLinkSourceType(sourceType) ?? inferLinkSourceTypeFromUrl(sourceUrl);
}
