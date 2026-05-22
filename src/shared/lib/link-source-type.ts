export const LINK_SOURCE_TYPES = ["INSTAGRAM", "NAVER_BLOG", "YOUTUBE", "GENERIC_WEB"] as const;

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

/** Infer from originalUrl host when API linkSourceType is absent. */
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

    if (host.includes("youtube.com") || host === "youtu.be") {
      return "YOUTUBE";
    }
  } catch {
    // fall through
  }

  return "GENERIC_WEB";
}

export function resolveLinkSourceType(
  linkSourceType: string | null | undefined,
  originalUrl: string,
): LinkSourceType {
  return normalizeLinkSourceType(linkSourceType) ?? inferLinkSourceTypeFromUrl(originalUrl);
}
